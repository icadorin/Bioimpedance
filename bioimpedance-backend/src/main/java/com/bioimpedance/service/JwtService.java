package com.bioimpedance.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:900000}")           // 15 minutos
    private long expiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7 dias
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        try {
            if (secret == null || secret.length() < 32) {
                throw new IllegalStateException("JWT_SECRET deve ter pelo menos 32 caracteres");
            }
            return Keys.hmacShaKeyFor(secret.getBytes());
        } catch (Exception e) {
            throw new IllegalStateException("Erro ao gerar chave JWT", e);
        }
    }

    /** Access token — 15 min. tokenFamily = JTI para fingerprint tracking. */
    public String generateToken(String email, String tokenFamily) {
        return Jwts.builder()
            .id(tokenFamily)                 // JTI = token family
            .subject(email)
            .claim("type", "access")
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(getSigningKey(), Jwts.SIG.HS512)
            .compact();
    }

    /** Refresh token — 7 dias. JTI diferente do access, mas mesmo family. */
    public String generateRefreshToken(String email, String tokenFamily) {
        return Jwts.builder()
            .id(UUID.randomUUID().toString())
            .subject(email)
            .claim("type", "refresh")
            .claim("family", tokenFamily)    // família para rastreamento
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
            .signWith(getSigningKey(), Jwts.SIG.HS512)
            .compact();
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /** Extrai o token family do access token (via JTI) ou do refresh (via claim "family"). */
    public String extractTokenFamily(String token) {
        Claims claims = extractAllClaims(token);
        String family = claims.get("family", String.class);
        return family != null ? family : claims.getId();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "access".equals(claims.get("type", String.class));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isRefreshTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return "refresh".equals(claims.get("type", String.class));
        } catch (ExpiredJwtException e) {
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        } catch (ExpiredJwtException e) {
            throw new IllegalArgumentException("Token expirado", e);
        } catch (Exception e) {
            throw new IllegalArgumentException("Token JWT inválido", e);
        }
    }
}