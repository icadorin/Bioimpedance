package com.bioimpedance.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "session_fingerprints")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SessionFingerprint {
    @Id
    private String id;
    private String userId;
    private String ipHash;          // Hash do IP (não armazena IP cru por LGPD/GDPR)
    private String userAgentHash;   // Hash do User-Agent
    private String tokenFamily;     // Família do refresh token (rotating)
    private Instant createdAt;
    private Instant lastUsedAt;
    private boolean blocked;        // Flag para bloqueio manual/admin
}