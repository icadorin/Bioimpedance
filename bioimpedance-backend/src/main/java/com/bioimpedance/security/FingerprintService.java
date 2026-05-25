package com.bioimpedance.security;

import com.bioimpedance.entity.SessionFingerprint;
import com.bioimpedance.repository.SessionFingerprintRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FingerprintService {

    private final SessionFingerprintRepository fingerprintRepository;

    public FingerprintResult validateFingerprint(String userId, String tokenFamily,
                                                 HttpServletRequest request) {
        String currentIpHash = hash(getClientIp(request));
        String currentUaHash = hash(request.getHeader("User-Agent"));

        try {
            Optional<SessionFingerprint> existing =
                fingerprintRepository.findByUserIdAndTokenFamily(userId, tokenFamily);

            if (existing.isEmpty()) {
                // Primeira vez com este tokenFamily — registra
                fingerprintRepository.save(SessionFingerprint.builder()
                    .id(UUID.randomUUID().toString())
                    .userId(userId)
                    .ipHash(currentIpHash)
                    .userAgentHash(currentUaHash)
                    .tokenFamily(tokenFamily)
                    .createdAt(Instant.now())
                    .lastUsedAt(Instant.now())
                    .blocked(false)
                    .build());
                return FingerprintResult.valid();
            }

            SessionFingerprint stored = existing.get();

            if (stored.isBlocked()) {
                return FingerprintResult.blocked("Sessão bloqueada");
            }

            boolean ipMatch = stored.getIpHash().equals(currentIpHash);
            boolean uaMatch = stored.getUserAgentHash().equals(currentUaHash);

            // Ambos diferentes = provável roubo → bloqueia TODAS as sessões
            if (!ipMatch && !uaMatch) {
                blockAllSessions(userId);
                return FingerprintResult.blocked("Sessão suspeita detectada");
            }

            // IP pode mudar (celular/VPN) mas UA mantido → atualiza IP e segue
            stored.setIpHash(currentIpHash);
            stored.setLastUsedAt(Instant.now());
            fingerprintRepository.save(stored);

            return FingerprintResult.valid();
        } catch (Exception e) {
            return FingerprintResult.blocked("Erro ao validar sessão");
        }
    }

    private void blockAllSessions(String userId) {
        try {
            List<SessionFingerprint> sessions =
                fingerprintRepository.findByUserIdOrderByLastUsedAtDesc(userId);
            sessions.forEach(s -> s.setBlocked(true));
            fingerprintRepository.saveAll(sessions);
        } catch (Exception e) {
            // Log do erro - não impede o bloqueio por segurança
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    private String hash(String value) {
        if (value == null) return "unknown";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(bytes);
        } catch (Exception e) {
            return "error";
        }
    }

    @Getter
    public static class FingerprintResult {
        private final boolean valid;
        private final boolean blocked;
        private final String reason;

        private FingerprintResult(boolean valid, boolean blocked, String reason) {
            this.valid = valid;
            this.blocked = blocked;
            this.reason = reason;
        }

        public static FingerprintResult valid() {
            return new FingerprintResult(true, false, null);
        }

        public static FingerprintResult blocked(String reason) {
            return new FingerprintResult(false, true, reason);
        }
    }
}