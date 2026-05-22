package com.bioimpedance.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private int totalClients;
    private int activeClients;
    private int assessmentsThisMonth;
    private double averageBodyFatChange;
    private double averageLeanMassChange;
    private int clientsWithProgress;
}