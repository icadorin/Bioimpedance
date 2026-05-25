package com.bioimpedance.security;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    // ConcurrentHashMap por IP — sem Redis por enquanto (single instance)
    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equalsIgnoreCase(method)) {
            if (path.equals("/api/auth/login")) {
                if (!tryConsume(loginBuckets, getClientIp(request), 5, 1)) {
                    writeTooManyRequests(response, "Muitas tentativas de login. Tente novamente em 1 minuto.");
                    return;
                }
            } else if (path.equals("/api/auth/register")) {
                if (!tryConsume(registerBuckets, getClientIp(request), 3, 10)) {
                    writeTooManyRequests(response, "Limite de registros atingido.");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * @param capacity    tokens máximos no bucket
     * @param refillPerMinute tokens reabastecidos por minuto
     */
    private boolean tryConsume(Map<String, Bucket> map, String key,
                               int capacity, int refillPerMinute) {
        Bucket bucket = map.computeIfAbsent(key, k ->
            Bucket.builder()
                .addLimit(limit -> limit
                    .capacity(capacity)
                    .refillGreedy(refillPerMinute, Duration.ofMinutes(1)))
                .build());

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        return probe.isConsumed();
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    private void writeTooManyRequests(HttpServletResponse response, String message)
        throws IOException {
        response.setStatus(429);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"error\":\"" + message + "\"}");
    }
}