package com.bioimpedance.dto.request;

import com.bioimpedance.constants.AssessmentMethod;
import com.bioimpedance.constants.Gender;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentRequestDTO {

    private String clientId;

    @NotNull
    private LocalDate date;

    @NotNull
    private AssessmentMethod method;

    @NotNull
    @Positive
    private Double weight;

    @NotNull
    @Positive
    private Double height;

    @NotNull
    @Min(10) @Max(100)
    private Integer age;

    @NotNull
    private Gender gender;

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

    private String observations;
}