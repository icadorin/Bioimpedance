package com.bioimpedance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculationResultDTO {
    private Double imc;
    private Double bodyFat;
    private Double leanMass;
    private Double fatMass;
    private Double ffmi;
    private Double bmr;
    private Double tdee;
    private Double targetCalories;
    private String bodyFatLevel;
    private MethodDetailsDTO methodDetails;

    private Integer protein;
    private Integer carbs;
    private Integer fat;
    private String trainingType;
    private String cardio;
}