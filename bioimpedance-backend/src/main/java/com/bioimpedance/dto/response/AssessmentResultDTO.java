package com.bioimpedance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResultDTO {
    private Double imc;
    private Double bodyFat;
    private Double leanMass;
    private Double fatMass;
    private Double ffmi;
    private Double bmr;
    private Double tdee;
    private Double targetCalories;
    private String bodyFatLevel;

    // Detalhes específicos do método
    private MethodDetailsDTO methodDetails;

    private Integer protein;
    private Integer carbs;
    private Integer fat;
    private String trainingType;
    private String cardio;
}