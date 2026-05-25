package com.bioimpedance.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionResponseDTO {
    private String plan;
    private String planName;
    private String status;
    private LocalDateTime currentPeriodEnd;
    private boolean cancelAtPeriodEnd;
    private boolean billingPortalReady;
    private List<PlanFeatureDTO> features;
}
