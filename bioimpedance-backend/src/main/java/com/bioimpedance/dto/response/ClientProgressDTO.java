package com.bioimpedance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientProgressDTO {
    private String clientId;
    private String clientName;
    private String clientGoal;
    private Double weightDiff;
    private Double bodyFatDiff;
    private Double leanMassDiff;
    private String latestDate;
    private String previousDate;
}