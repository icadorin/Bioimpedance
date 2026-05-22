package com.bioimpedance.dto.request;

import com.bioimpedance.constants.AssessmentMethod;
import com.bioimpedance.constants.Gender;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculateRequestDTO {

    private AssessmentMethod method;

    private Double weight;
    private Double height;
    private Integer age;
    private Gender gender;
    private String activityLevel;
    private String objective;

    // Navy
    private Double waist;
    private Double neck;
    private Double hip;

    // Bioimpedance
    private Double resistance;
    private Double reactance;

    // Skinfold
    private String protocol;
    private Double biceps;
    private Double chest;
    private Double midaxillary;
    private Double triceps;
    private Double subscapular;
    private Double abdominal;
    private Double suprailiac;
    private Double thigh;
}