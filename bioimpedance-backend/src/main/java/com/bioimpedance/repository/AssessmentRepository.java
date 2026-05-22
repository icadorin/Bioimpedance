package com.bioimpedance.repository;

import com.bioimpedance.entity.Assessment;
import com.bioimpedance.constants.AssessmentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, String> {

    List<Assessment> findByClientIdOrderByDateDesc(String clientId);

    List<Assessment> findByClientIdAndMethodOrderByDateDesc(String clientId, AssessmentMethod method);

    List<Assessment> findByDateBetween(LocalDate start, LocalDate end);

    long countByDateBetween(LocalDate start, LocalDate end);

    List<Assessment> findTop5ByOrderByDateDesc();
}