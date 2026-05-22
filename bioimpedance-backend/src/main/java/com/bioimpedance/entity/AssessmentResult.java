package com.bioimpedance.entity;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AssessmentResult {

    private Double imc;
    private Double bodyFat;
    private Double leanMass;
    private Double fatMass;
    private Double ffmi;
    private Double bmr;
    private Double tdee;
    private Double targetCalories;
    private String bodyFatLevel;
}