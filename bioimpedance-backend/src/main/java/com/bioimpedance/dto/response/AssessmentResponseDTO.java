package com.bioimpedance.dto.response;

import com.bioimpedance.constants.AssessmentMethod;
import com.bioimpedance.constants.Gender;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResponseDTO {
    private String id;
    private String clientId;
    private LocalDate date;
    private AssessmentMethod method;
    private Double weight;
    private Double height;
    private Integer age;
    private Gender gender;
    private AssessmentResultDTO result;
    private String observations;
    private LocalDateTime createdAt;
}