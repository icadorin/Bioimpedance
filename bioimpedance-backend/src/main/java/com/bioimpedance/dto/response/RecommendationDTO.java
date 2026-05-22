package com.bioimpedance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDTO {
    private int targetCalories;
    private int protein;
    private int carbs;
    private int fat;
    private String trainingType;
    private String cardio;
}