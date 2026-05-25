package com.bioimpedance.util;

import com.bioimpedance.constants.ActivityLevel;
import org.springframework.stereotype.Component;

/**
 * Cálculos metabólicos: IMC, TMB (Mifflin-St Jeor), TDEE, FFMI.
 * Espelha fielmente as fórmulas do frontend (calculations.ts).
 */
@Component
public class MetabolicCalculator {

    /**
     * IMC = peso / altura²
     *
     * @param weight peso em kg
     * @param height altura em cm
     */
    public double calculateIMC(double weight, double height) {
        if (weight <= 0 || height <= 0) return 0;
        double heightM = height / 100.0;
        return weight / (heightM * heightM);
    }

    /**
     * TMB — Mifflin-St Jeor
     * Masculino: 10W + 6.25H - 5A + 5
     * Feminino:  10W + 6.25H - 5A - 161
     *
     * @param weight peso em kg
     * @param height altura em cm
     * @param age    idade em anos
     * @param gender "MALE" ou "FEMALE"
     */
    public double calculateBMR(double weight, double height, int age, String gender) {
        if (weight <= 0 || height <= 0 || age <= 0) return 0;

        double base = 10 * weight + 6.25 * height - 5 * age;
        return "MALE".equalsIgnoreCase(gender) ? base + 5 : base - 161;
    }

    /**
     * TDEE = TMB × fator de atividade
     */
    public double calculateTDEE(double bmr, ActivityLevel activityLevel) {
        double factor = switch (activityLevel) {
            case SEDENTARY  -> 1.2;
            case LIGHT      -> 1.375;
            case MODERATE   -> 1.55;
            case ACTIVE     -> 1.725;
            case VERY_ACTIVE -> 1.9;
        };
        return bmr * factor;
    }

    /**
     * FFMI = massa magra / altura²
     *
     * @param leanMass massa magra em kg
     * @param heightCm altura em cm
     */
    public double calculateFFMI(double leanMass, double heightCm) {
        if (leanMass <= 0 || heightCm <= 0) return 0;
        double heightM = heightCm / 100.0;
        return leanMass / (heightM * heightM);
    }

    /**
     * Massa magra = peso × (1 - %gordura/100)
     */
    public double calculateLeanMass(double weight, double bodyFatPercent) {
        if (weight <= 0 || bodyFatPercent <= 0) return 0;
        return weight * (1.0 - bodyFatPercent / 100.0);
    }

    /**
     * Massa gorda = peso × (%gordura/100)
     */
    public double calculateFatMass(double weight, double bodyFatPercent) {
        if (weight <= 0 || bodyFatPercent <= 0) return 0;
        return weight * (bodyFatPercent / 100.0);
    }
}