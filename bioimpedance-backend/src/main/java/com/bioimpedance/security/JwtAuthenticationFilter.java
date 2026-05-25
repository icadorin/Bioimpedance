package com.bioimpedance.security;

import com.bioimpedance.entity.User;
import com.bioimpedance.repository.UserRepository;
import com.bioimpedance.service.JwtService;
import com.bioimpedance.util.CookieUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final FingerprintService fingerprintService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getRequestURI();
        
        // Bypass: rotas públicas não precisam de JWT nem CSRF
        if (path.startsWith("/api/auth/") || path.startsWith("/api/billing/webhook")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // CSRF check — pular em métodos seguros
            if (!isSafeMethod(request)) {
                String csrfHeader = request.getHeader("X-XSRF-TOKEN");
                String csrfCookie = CookieUtil.getCsrfToken(request).orElse(null);

                if (csrfHeader == null || csrfCookie == null || !csrfHeader.equals(csrfCookie)) {
                    writeError(response, HttpServletResponse.SC_FORBIDDEN, "CSRF token inválido");
                    return;
                }
            }

            String token = CookieUtil.getAccessToken(request).orElse(null);

            if (token != null && jwtService.isTokenValid(token)) {
                String email = jwtService.extractEmail(token);
                String tokenFamily = jwtService.extractTokenFamily(token);

                User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    FingerprintService.FingerprintResult result =
                        fingerprintService.validateFingerprint(user.getId(), tokenFamily, request);

                    if (result.isBlocked()) {
                        CookieUtil.clearCookies(response);
                        writeError(response, HttpServletResponse.SC_UNAUTHORIZED,
                            "Sessão suspeita detectada. Faça login novamente.");
                        return;
                    }
                }

                SecurityContextHolder.getContext().setAuthentication(
                    new UsernamePasswordAuthenticationToken(email, null, null));
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            writeError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                "Erro interno de autenticação");
        }
    }

    private boolean isSafeMethod(HttpServletRequest request) {
        return switch (request.getMethod().toUpperCase()) {
            case "GET", "HEAD", "OPTIONS", "TRACE" -> true;
            default -> false;
        };
    }

    private void writeError(HttpServletResponse response, int status, String message)
        throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}