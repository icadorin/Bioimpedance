package com.bioimpedance.constants;

import com.fasterxml.jackson.annotation.JsonCreator;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.Arrays;
import java.util.Optional;
import java.util.Set;

@Getter
@RequiredArgsConstructor
public enum Plan {
    BASIC("basic", "Basic", 1, Set.of(
        PlanFeature.CALCULATOR
    )),
    PRO("pro", "Pro", 2, Set.of(
        PlanFeature.CALCULATOR,
        PlanFeature.HISTORY,
        PlanFeature.PDF,
        PlanFeature.CHARTS,
        PlanFeature.BODY_COMPARISON
    )),
    STUDIO("studio", "Studio", 3, Set.of(
        PlanFeature.CALCULATOR,
        PlanFeature.HISTORY,
        PlanFeature.PDF,
        PlanFeature.CHARTS,
        PlanFeature.BODY_COMPARISON,
        PlanFeature.PDF_CUSTOMIZATION,
        PlanFeature.CUSTOM_BRANDING,
        PlanFeature.ADVANCED_REPORTS
    ));

    private final String slug;
    private final String label;
    private final int sortOrder;
    private final Set<PlanFeature> features;

    public boolean includes(PlanFeature feature) {
        return features.contains(feature);
    }

    public static Optional<Plan> fromSlug(String slug) {
        return Arrays.stream(values())
            .filter(plan -> plan.slug.equalsIgnoreCase(slug))
            .findFirst();
    }

    @JsonCreator
    public static Plan fromJson(String value) {
        if (value == null) {
            return null;
        }

        return fromSlug(value)
            .orElseGet(() -> Plan.valueOf(value.toUpperCase()));
    }
}
