package com.bioimpedance.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "refresh_tokens")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RefreshToken {
    @Id
    private String id;
    private String tokenHash;
    private String userId;
    private Instant expiresAt;
    private Instant createdAt;
    private boolean used;
}