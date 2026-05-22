package com.bioimpedance.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingPlanDTO {

    private String plan;
    private String name;
    private int sortOrder;
    private boolean paid;
    private boolean checkoutReady;
    private List<PlanFeatureDTO> features;
}
