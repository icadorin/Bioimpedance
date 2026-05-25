package com.bioimpedance.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Todos os cálculos de percentual de gordura corporal.
 * Fórmulas espelhadas fielmente do frontend (calculations.ts / calculationsBio.ts / calculationsSkin.ts).
 */
@Slf4j
@Component
public class BodyFatCalculator {

    // ─────────────────────────────────────────────────────────────────
    // NAVY METHOD
    // ─────────────────────────────────────────────────────────────────

    /**
     * Método US Navy.
     * Masculino: 86.01 * log10(cintura - pescoço) - 70.041 * log10(altura) + 36.76
     * Feminino:  163.205 * log10(cintura + quadril - pescoço) - 97.684 * log10(altura) - 78.387
     *
     * @param waist   cintura em cm
     * @param neck    pescoço em cm
     * @param hip     quadril em cm (apenas feminino; pode ser 0 para masculino)
     * @param height  altura em cm
     * @param gender  "MALE" ou "FEMALE"
     * @return percentual de gordura, ou 0 se valores inválidos
     */
    public double calculateBodyFatNavy(double waist, double neck, double hip,
                                       double height, String gender) {
        if (height < 120 || waist < 60 || neck < 25) return 0;

        if ("MALE".equalsIgnoreCase(gender)) {
            double diff = waist - neck;
            if (diff < 10) return 0;
            double value = 86.01 * Math.log10(diff) - 70.041 * Math.log10(height) + 36.76;
            return isFiniteAndPositive(value) ? value : 0;
        } else {
            if (hip <= 0) return 0;
            double sum = waist + hip - neck;
            double value = 163.205 * Math.log10(sum) - 97.684 * Math.log10(height) - 78.387;
            return isFiniteAndPositive(value) ? value : 0;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // BIOIMPEDÂNCIA (Segal et al.)
    // ─────────────────────────────────────────────────────────────────

    /**
     * Percentual de gordura via bioimpedância.
     * Calcula massa magra primeiro e depois deriva a gordura.
     *
     * @param weight     peso em kg
     * @param height     altura em cm
     * @param age        idade em anos
     * @param gender     "MALE" ou "FEMALE"
     * @param resistance resistência em ohms
     * @param reactance  reactância em ohms (não usada diretamente na fórmula de Segal, mas mantida para consistência)
     * @return percentual de gordura, ou 0 se inválido
     */
    public double calculateBodyFatBio(double weight, double height, int age,
                                      String gender, double resistance, double reactance) {
        if (weight <= 0 || height <= 0 || age <= 0 || resistance <= 0) return 0;

        double leanMass;
        if ("MALE".equalsIgnoreCase(gender)) {
            leanMass = 0.0006636 * Math.pow(height, 2)
                - 0.02117   * resistance
                + 0.62854   * weight
                - 0.1238    * age
                + 9.33285;
        } else {
            leanMass = 0.0011285 * Math.pow(height, 2)
                - 0.01273   * resistance
                + 0.16796   * weight
                - 0.14941   * age
                + 14.59593;
        }

        if (leanMass <= 0 || leanMass >= weight) return 0;

        double bodyFat = ((weight - leanMass) / weight) * 100;
        return isFiniteAndPositive(bodyFat) ? bodyFat : 0;
    }

    /**
     * Impedância bioelétrica: Z = √(R² + Xc²)
     */
    public double calculateImpedance(double resistance, double reactance) {
        return Math.sqrt(Math.pow(resistance, 2) + Math.pow(reactance, 2));
    }

    /**
     * Ângulo de fase: φ = arctan(Xc / R) × (180 / π)
     */
    public double calculatePhaseAngle(double resistance, double reactance) {
        if (resistance <= 0 || reactance <= 0) return 0;
        return Math.atan(reactance / resistance) * (180.0 / Math.PI);
    }

    /**
     * Água corporal total (TBW).
     * Masculino: 0.59 × (altura² / R) + 0.065 × peso + 0.04
     * Feminino:  0.47 × (altura² / R) + 0.113 × peso - 4.03
     */
    public double calculateTBW(double weight, double height, String gender, double resistance) {
        if (weight <= 0 || height <= 0 || resistance <= 0) return 0;

        double tbw;
        if ("MALE".equalsIgnoreCase(gender)) {
            tbw = 0.59  * (Math.pow(height, 2) / resistance) + 0.065 * weight + 0.04;
        } else {
            tbw = 0.47  * (Math.pow(height, 2) / resistance) + 0.113 * weight - 4.03;
        }
        return isFiniteAndPositive(tbw) ? tbw : 0;
    }

    // ─────────────────────────────────────────────────────────────────
    // DOBRAS CUTÂNEAS
    // ─────────────────────────────────────────────────────────────────

    /**
     * Percentual de gordura via dobras cutâneas.
     * Suporta protocolos: JP3 (Jackson-Pollock 3), JP7 (Jackson-Pollock 7), DW4 (Durnin-Womersley 4).
     */
    public double calculateBodyFatSkinfold(String protocol, String gender, int age,
                                           double biceps, double triceps, double subscapular,
                                           double chest, double midaxillary, double abdominal,
                                           double suprailiac, double thigh) {
        double sum = calculateSkinfoldSum(protocol, gender,
            biceps, triceps, subscapular, chest, midaxillary, abdominal, suprailiac, thigh);

        if (sum <= 0 || age <= 0) return 0;

        double density = calculateSkinfoldDensity(protocol, gender, age, sum);
        if (density <= 0) return 0;

        // Fórmula de Siri: %G = (495 / densidade) - 450
        double bodyFat = (495.0 / density) - 450.0;
        return isFiniteAndPositive(bodyFat) ? bodyFat : 0;
    }

    /**
     * Soma as dobras de acordo com o protocolo e sexo.
     */
    public double calculateSkinfoldSum(String protocol, String gender,
                                       double biceps, double triceps, double subscapular,
                                       double chest, double midaxillary, double abdominal,
                                       double suprailiac, double thigh) {
        return switch (protocol.toLowerCase()) {
            case "jp3" -> "MALE".equalsIgnoreCase(gender)
                ? chest + abdominal + thigh
                : triceps + suprailiac + thigh;
            case "jp7" -> chest + midaxillary + triceps + subscapular + abdominal + suprailiac + thigh;
            case "dw4" -> biceps + triceps + subscapular + suprailiac;
            default -> 0;
        };
    }

    // ─────────────────────────────────────────────────────────────────
    // Densidades
    // ─────────────────────────────────────────────────────────────────

    private double calculateSkinfoldDensity(String protocol, String gender, int age, double sum) {
        return switch (protocol.toLowerCase()) {
            case "jp3" -> calculateJp3Density(gender, age, sum);
            case "jp7" -> calculateJp7Density(gender, age, sum);
            case "dw4" -> calculateDurninWomersleyDensity(gender, age, sum);
            default -> 0;
        };
    }

    /**
     * Jackson-Pollock 3 dobras.
     * Masculino: peitoral + abdominal + coxa
     * Feminino:  tríceps + supra-ilíaca + coxa
     */
    private double calculateJp3Density(String gender, int age, double sum) {
        if ("MALE".equalsIgnoreCase(gender)) {
            return 1.10938
                - 0.0008267  * sum
                + 0.0000016  * Math.pow(sum, 2)
                - 0.0002574  * age;
        } else {
            return 1.0994921
                - 0.0009929  * sum
                + 0.0000023  * Math.pow(sum, 2)
                - 0.0001392  * age;
        }
    }

    /**
     * Jackson-Pollock 7 dobras.
     */
    private double calculateJp7Density(String gender, int age, double sum) {
        if ("MALE".equalsIgnoreCase(gender)) {
            return 1.112
                - 0.00043499 * sum
                + 0.00000055 * Math.pow(sum, 2)
                - 0.00028826 * age;
        } else {
            return 1.097
                - 0.00046971 * sum
                + 0.00000056 * Math.pow(sum, 2)
                - 0.00012828 * age;
        }
    }

    /**
     * Durnin-Womersley 4 dobras (bíceps + tríceps + subescapular + supra-ilíaca).
     * Coeficientes variam por sexo e faixa etária.
     */
    private double calculateDurninWomersleyDensity(String gender, int age, double sum) {
        double logSum = Math.log10(sum);
        if ("MALE".equalsIgnoreCase(gender)) {
            if (age < 17) return 1.1533 - 0.0643 * logSum;
            if (age < 20) return 1.162  - 0.063  * logSum;
            if (age < 30) return 1.1631 - 0.0632 * logSum;
            if (age < 40) return 1.1422 - 0.0544 * logSum;
            if (age < 50) return 1.162  - 0.07   * logSum;
            return             1.1715 - 0.0779 * logSum;
        } else {
            if (age < 17) return 1.1369 - 0.0598 * logSum;
            if (age < 20) return 1.1549 - 0.0678 * logSum;
            if (age < 30) return 1.1599 - 0.0717 * logSum;
            if (age < 40) return 1.1423 - 0.0632 * logSum;
            if (age < 50) return 1.1333 - 0.0612 * logSum;
            return             1.1339 - 0.0645 * logSum;
        }
    }

    // ─────────────────────────────────────────────────────────────────
    // UTILITÁRIO
    // ─────────────────────────────────────────────────────────────────

    private boolean isFiniteAndPositive(double value) {
        return Double.isFinite(value) && value > 0;
    }
}