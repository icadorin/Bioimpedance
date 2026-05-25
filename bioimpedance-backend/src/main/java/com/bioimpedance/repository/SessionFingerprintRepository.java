package com.bioimpedance.repository;

import com.bioimpedance.entity.SessionFingerprint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionFingerprintRepository extends JpaRepository<SessionFingerprint, String> {

    Optional<SessionFingerprint> findByUserIdAndTokenFamily(String userId, String tokenFamily);

    List<SessionFingerprint> findByUserIdOrderByLastUsedAtDesc(String userId);
}