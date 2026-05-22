package com.bioimpedance.service;

import com.bioimpedance.dto.response.RecommendationDTO;
import org.springframework.stereotype.Service;

/**
 * Gera recomendações de dieta e treino com base no objetivo, TDEE e composição corporal.
 * Lógica espelhada do frontend (recommendationEngine.ts).
 */
@Service
public class RecommendationService {

    /**
     * @param tdee      gasto calórico total diário
     * @param objective "cutting", "bulking" ou "maintenance"
     * @param bodyFat   percentual de gordura (0 se IMC)
     * @param weight    peso em kg (base para cálculo de proteína)
     * @param gender    "MALE" ou "FEMALE"
     */
    public RecommendationDTO generateRecommendation(double tdee, String objective,
                                                    double bodyFat, double weight, String gender) {
        double calories;
        // g por kg de peso corporal — corrigido: não confundir com calorias
        double proteinPerKg;

        switch (objective.toLowerCase()) {
            case "cutting" -> {
                calories      = tdee * 0.85;   // déficit leve
                proteinPerKg  = 2.2;           // mais proteína para preservar massa magra
            }
            case "bulking" -> {
                calories      = tdee * 1.10;   // superávit leve
                proteinPerKg  = 1.8;
            }
            default -> {                        // maintenance
                calories      = tdee;
                proteinPerKg  = 1.6;
            }
        }

        // Proteína total em gramas
        int protein = (int) Math.round(proteinPerKg * weight);

        // Gordura = 25% das calorias totais (9 kcal/g)
        int fat = (int) Math.round((calories * 0.25) / 9.0);

        // Carboidratos = calorias restantes (4 kcal/g)
        int carbs = (int) Math.round((calories - (protein * 4.0) - (fat * 9.0)) / 4.0);

        // Alertas (notas textuais que o front pode exibir)
        String trainingType = resolveTrainingType(bodyFat);
        String cardio       = resolveCardio(bodyFat);

        return RecommendationDTO.builder()
            .targetCalories((int) Math.round(calories))
            .protein(protein)
            .carbs(Math.max(0, carbs))   // carbs nunca negativo
            .fat(fat)
            .trainingType(trainingType)
            .cardio(cardio)
            .build();
    }

    private String resolveTrainingType(double bodyFat) {
        if (bodyFat > 25) return "Treino metabólico + força leve";
        if (bodyFat > 18) return "Hipertrofia padrão";
        return "Hipertrofia + performance";
    }

    private String resolveCardio(double bodyFat) {
        if (bodyFat > 25) return "3–5x por semana (moderado)";
        if (bodyFat > 18) return "2–3x por semana leve";
        return "Cardio leve opcional";
    }
}