package com.bioimpedance.constants;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PlanFeature {
    CALCULATOR("calculator", "Calculadora"),
    HISTORY("history", "Histórico"),
    PDF("pdf", "PDF"),
    CHARTS("charts", "Gráficos"),
    BODY_COMPARISON("body_comparison", "Comparação corporal"),
    PDF_CUSTOMIZATION("pdf_customization", "Personalização PDF"),
    CUSTOM_BRANDING("custom_branding", "Branding próprio"),
    ADVANCED_REPORTS("advanced_reports", "Relatórios avançados");

    private final String key;
    private final String label;
}
