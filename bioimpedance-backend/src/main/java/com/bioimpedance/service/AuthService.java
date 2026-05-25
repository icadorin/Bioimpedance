package com.bioimpedance.service;

import com.bioimpedance.constants.Plan;
import com.bioimpedance.dto.auth.AuthResponseDTO;
import com.bioimpedance.dto.auth.LoginRequestDTO;
import com.bioimpedance.dto.auth.RegisterRequestDTO;
import com.bioimpedance.entity.User;
import com.bioimpedance.repository.RefreshTokenRepository;
import com.bioimpedance.repository.SessionFingerprintRepository;
import com.bioimpedance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final SessionFingerprintRepository fingerprintRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    /** Token CSRF gerado por sessão — não precisa de cache, basta ser aleatório e stateless via cookie. */
    public String generateCsrfToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        validatePassword(request.getPassword());

        String emailLower = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(emailLower)) {
            throw new IllegalArgumentException("Este email já está em uso");
        }

        String name = request.getName().trim();

        User user = User.builder()
            .email(emailLower)
            .password(passwordEncoder.encode(request.getPassword()))
            .name(name)
            .active(true)
            .plan(Plan.BASIC)
            .build();

        user = userRepository.save(user);

        String tokenFamily = UUID.randomUUID().toString();
        String accessToken = jwtService.generateToken(user.getEmail(), tokenFamily);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), tokenFamily);

        refreshTokenService.createRefreshToken(user.getId(), refreshToken);

        return new AuthResponseDTO(accessToken, refreshToken,
            user.getName(), user.getEmail(), user.getPlan().getSlug());
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
            .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }
        if (!user.isActive()) {
            throw new IllegalArgumentException("Conta desativada");
        }

        String tokenFamily = UUID.randomUUID().toString();
        String accessToken = jwtService.generateToken(user.getEmail(), tokenFamily);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), tokenFamily);

        refreshTokenService.createRefreshToken(user.getId(), refreshToken);

        return new AuthResponseDTO(accessToken, refreshToken,
            user.getName(), user.getEmail(), user.getPlan().getSlug());
    }

    @Transactional
    public AuthResponseDTO refresh(String oldRefreshToken) {
        try {
            if (!jwtService.isRefreshTokenValid(oldRefreshToken)) {
                throw new IllegalArgumentException("Refresh token inválido ou expirado");
            }

            // Rotate — invalida o antigo, cria o novo, detecta roubo
            RefreshTokenService.RotateResult rotateResult =
                refreshTokenService.rotateRefreshToken(oldRefreshToken)
                    .orElseThrow(() -> {
                        // Possível roubo — bloqueia todas as sessões do usuário
                        blockAllSessions(jwtService.extractEmail(oldRefreshToken));
                        return new SecurityException("Sessão comprometida. Faça login novamente.");
                    });

            String email = jwtService.extractEmail(oldRefreshToken);
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

            String newTokenFamily = UUID.randomUUID().toString();
            String newAccessToken = jwtService.generateToken(user.getEmail(), newTokenFamily);
            String newRefreshToken = jwtService.generateRefreshToken(user.getEmail(), newTokenFamily);

            refreshTokenService.createRefreshToken(user.getId(), newRefreshToken);

            return new AuthResponseDTO(newAccessToken, newRefreshToken,
                user.getName(), user.getEmail(), user.getPlan().getSlug());
        } catch (SecurityException e) {
            throw e; // Re-lança para tratamento específico
        } catch (Exception e) {
            throw new SecurityException("Erro ao renovar sessão", e);
        }
    }

    private void blockAllSessions(String email) {
        userRepository.findByEmail(email).ifPresent(user ->
            fingerprintRepository.findByUserIdOrderByLastUsedAtDesc(user.getId())
                .forEach(s -> {
                    s.setBlocked(true);
                    fingerprintRepository.save(s);
                })
        );
    }

    private void validatePassword(String password) {
        if (password == null || password.length() < 8)
            throw new IllegalArgumentException("A senha deve ter no mínimo 8 caracteres");
        if (!password.matches(".*[A-Z].*"))
            throw new IllegalArgumentException("A senha deve conter pelo menos uma letra maiúscula");
        if (!password.matches(".*[0-9].*"))
            throw new IllegalArgumentException("A senha deve conter pelo menos um número");
    }

    private String extractNameFromEmail(String email) {
        String name = email.split("@")[0];
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }
}