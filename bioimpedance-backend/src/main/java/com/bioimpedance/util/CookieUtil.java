package com.bioimpedance.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;

// Agora é @Component para poder injetar @Value
@Component
public class CookieUtil {

    private static boolean secureCookies = true;

    // Chamado pelo Spring ao inicializar — injeta a propriedade no campo estático
    @Value("${cookie.secure:true}")
    public void setSecureCookies(boolean value) {
        CookieUtil.secureCookies = value;
    }

    private static final String ACCESS_TOKEN  = "access_token";
    private static final String REFRESH_TOKEN = "refresh_token";
    private static final String CSRF_TOKEN    = "XSRF-TOKEN";

    public static void setAccessToken(HttpServletResponse response, String token) {
        addCookie(response, ResponseCookie.from(ACCESS_TOKEN, token)
            .httpOnly(true)
            .secure(secureCookies)
            .sameSite(secureCookies ? "Strict" : "Lax")
            .path("/api")
            .maxAge(Duration.ofMinutes(15))
            .build());
    }

    public static void setRefreshToken(HttpServletResponse response, String token) {
        addCookie(response, ResponseCookie.from(REFRESH_TOKEN, token)
            .httpOnly(true)
            .secure(secureCookies)
            .sameSite(secureCookies ? "Strict" : "Lax")
            .path("/api")
            .maxAge(Duration.ofDays(7))
            .build());
    }

    public static void setCsrfToken(HttpServletResponse response, String token) {
        addCookie(response, ResponseCookie.from(CSRF_TOKEN, token)
            .httpOnly(false)
            .secure(secureCookies)
            .sameSite(secureCookies ? "Strict" : "Lax")
            .path("/")
            .maxAge(Duration.ofMinutes(15))
            .build());
    }

    public static Optional<String> getAccessToken(HttpServletRequest request) {
        return getCookieValue(request, ACCESS_TOKEN);
    }

    public static Optional<String> getRefreshToken(HttpServletRequest request) {
        return getCookieValue(request, REFRESH_TOKEN);
    }

    public static Optional<String> getCsrfToken(HttpServletRequest request) {
        return getCookieValue(request, CSRF_TOKEN);
    }

    public static void clearCookies(HttpServletResponse response) {
        addCookie(response, ResponseCookie.from(ACCESS_TOKEN, "")
            .httpOnly(true).secure(secureCookies)
            .sameSite(secureCookies ? "Strict" : "Lax")
            .path("/api").maxAge(0).build());

        addCookie(response, ResponseCookie.from(REFRESH_TOKEN, "")
            .httpOnly(true).secure(secureCookies)
            .sameSite(secureCookies ? "Strict" : "Lax")
            .path("/api").maxAge(0).build());

        addCookie(response, ResponseCookie.from(CSRF_TOKEN, "")
            .httpOnly(false).secure(secureCookies)
            .sameSite(secureCookies ? "Strict" : "Lax")
            .path("/").maxAge(0).build());
    }

    private static void addCookie(HttpServletResponse response, ResponseCookie cookie) {
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private static Optional<String> getCookieValue(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return Optional.empty();
        return Arrays.stream(request.getCookies())
            .filter(c -> name.equals(c.getName()))
            .map(Cookie::getValue)
            .findFirst();
    }
}