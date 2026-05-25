package com.bioimpedance.service;

import com.bioimpedance.entity.RefreshToken;
import com.bioimpedance.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    /** Persiste o hash do refresh token JWT no banco para single-use tracking. */
    @Transactional
    public void createRefreshToken(String userId, String plainTextJwt) {
        // Remove tokens antigos do usuário antes de criar
        refreshTokenRepository.deleteByUserId(userId);

        String tokenHash = hashToken(plainTextJwt);

        RefreshToken token = RefreshToken.builder()
            .id(UUID.randomUUID().toString())
            .tokenHash(tokenHash)
            .userId(userId)
            .expiresAt(Instant.now().plus(7, ChronoUnit.DAYS))
            .createdAt(Instant.now())
            .used(false)
            .build();

        refreshTokenRepository.save(token);
    }

    /**
     * Valida e invalida o token atual (single-use).
     * Retorna RotateResult com o userId se OK, ou empty se roubo detectado.
     */
    @Transactional
    public Optional<RotateResult> rotateRefreshToken(String plainTextJwt) {
        String hash = hashToken(plainTextJwt);

        RefreshToken stored = refreshTokenRepository.findByTokenHash(hash).orElse(null);

        if (stored == null || stored.isUsed() || stored.getExpiresAt().isBefore(Instant.now())) {
            // Token não encontrado, já usado, ou expirado → possível roubo
            if (stored != null) {
                refreshTokenRepository.deleteByUserId(stored.getUserId());
            }
            return Optional.empty();
        }

        // Marca como usado (single-use)
        stored.setUsed(true);
        refreshTokenRepository.save(stored);

        return Optional.of(new RotateResult(stored.getUserId()));
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao hash token", e);
        }
    }

    public record RotateResult(String userId) {}
}