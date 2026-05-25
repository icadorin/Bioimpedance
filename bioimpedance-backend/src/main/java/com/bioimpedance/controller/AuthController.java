package com.bioimpedance.controller;

import com.bioimpedance.dto.auth.AuthResponseDTO;

import com.bioimpedance.dto.auth.LoginRequestDTO;
import com.bioimpedance.dto.auth.RegisterRequestDTO;
import com.bioimpedance.entity.User;
import com.bioimpedance.repository.UserRepository;
import com.bioimpedance.service.AuthService;
import com.bioimpedance.service.JwtService;
import com.bioimpedance.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request,
                                      HttpServletResponse response) {
        AuthResponseDTO auth = authService.register(request);
        setAuthCookies(response, auth);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("name", auth.getName(),
                "email", auth.getEmail(),
                "plan", auth.getPlan()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request,
                                   HttpServletResponse response) {
        AuthResponseDTO auth = authService.login(request);
        setAuthCookies(response, auth);
        return ResponseEntity.ok(Map.of("name", auth.getName(),
            "email", auth.getEmail(),
            "plan", auth.getPlan()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request,
                                     HttpServletResponse response) {
        String refreshToken = CookieUtil.getRefreshToken(request)
            .orElseThrow(() -> new IllegalArgumentException("Refresh token não encontrado"));

        AuthResponseDTO auth = authService.refresh(refreshToken);
        setAuthCookies(response, auth);

        return ResponseEntity.ok(Map.of("refreshed", true));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        CookieUtil.clearCookies(response);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String token = CookieUtil.getAccessToken(request).orElse(null);
        if (token == null || !jwtService.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String email = jwtService.extractEmail(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        return ResponseEntity.ok(Map.of(
            "name", user.getName(),
            "email", user.getEmail(),
            "plan", user.getPlan().getSlug()
        ));
    }

    private void setAuthCookies(HttpServletResponse response, AuthResponseDTO auth) {
        CookieUtil.setAccessToken(response, auth.getToken());
        CookieUtil.setRefreshToken(response, auth.getRefreshToken());
        CookieUtil.setCsrfToken(response, authService.generateCsrfToken());
    }
}