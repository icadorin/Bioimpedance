package com.bioimpedance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComparisonDTO {
    private Double weightDiff;
    private Double bodyFatDiff;
    private Double leanMassDiff;
    private Double fatMassDiff;
    private Double imcDiff;
    private AssessmentResponseDTO latest;
    private AssessmentResponseDTO previous;
}