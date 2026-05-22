package com.bioimpedance.service;

import com.bioimpedance.constants.ActivityLevel;
import com.bioimpedance.constants.AssessmentMethod;
import com.bioimpedance.constants.Gender;
import com.bioimpedance.dto.request.CalculateRequestDTO;
import com.bioimpedance.dto.response.CalculationResultDTO;
import com.bioimpedance.dto.response.MethodDetailItem;
import com.bioimpedance.dto.response.MethodDetailsDTO;
import com.bioimpedance.dto.response.RecommendationDTO;
import com.bioimpedance.utils.BodyFatCalculator;
import com.bioimpedance.utils.BodyFatInterpreter;
import com.bioimpedance.utils.MetabolicCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CalculationService {

    private final MetabolicCalculator metabolicCalculator;
    private final BodyFatCalculator bodyFatCalculator;
    private final BodyFatInterpreter interpreter;
    private final RecommendationService recommendationService;

    public CalculationResultDTO calculate(CalculateRequestDTO dto) {

        validateBase(dto);

        double imc = metabolicCalculator.calculateIMC(dto.getWeight(), dto.getHeight());
        double bmr = metabolicCalculator.calculateBMR(
            dto.getWeight(), dto.getHeight(), dto.getAge(), dto.getGender().name());

        ActivityLevel activityLevel = parseActivityLevel(dto.getActivityLevel());
        double tdee = metabolicCalculator.calculateTDEE(bmr, activityLevel);

        double bodyFat;
        MethodDetailsDTO methodDetails;

        switch (dto.getMethod()) {
            case NAVY -> {
                bodyFat = calcNavy(dto);
                methodDetails = buildNavyDetails(dto, bodyFat);
            }
            case BIOIMPEDANCE -> {
                bodyFat = calcBio(dto);
                methodDetails = buildBioDetails(dto);
            }
            case SKINFOLD -> {
                bodyFat = calcSkinfold(dto);
                methodDetails = buildSkinfoldDetails(dto, bodyFat);
            }
            default -> {
                bodyFat = 0.0;
                methodDetails = buildImcDetails(imc);
            }
        }

        double leanMass = metabolicCalculator.calculateLeanMass(dto.getWeight(), bodyFat);
        double fatMass = metabolicCalculator.calculateFatMass(dto.getWeight(), bodyFat);
        double ffmi = metabolicCalculator.calculateFFMI(leanMass, dto.getHeight());

        String bodyFatLevel = interpreter.interpretBodyFat(dto.getGender().name(), bodyFat);

        String objective = dto.getObjective() != null ? dto.getObjective() : "maintenance";
        RecommendationDTO recommendation = recommendationService.generateRecommendation(
            tdee, objective, bodyFat, dto.getWeight(), dto.getGender().name());

        return CalculationResultDTO.builder()
            .imc(round2(imc))
            .bodyFat(round2(bodyFat))
            .leanMass(round2(leanMass))
            .fatMass(round2(fatMass))
            .ffmi(round2(ffmi))
            .bmr(round2(bmr))
            .tdee(round2(tdee))
            .targetCalories((double) recommendation.getTargetCalories())
            .bodyFatLevel(bodyFatLevel)
            .protein(recommendation.getProtein())
            .carbs(recommendation.getCarbs())
            .fat(recommendation.getFat())
            .trainingType(recommendation.getTrainingType())
            .cardio(recommendation.getCardio())
            .methodDetails(methodDetails)
            .build();
    }

    private double calcNavy(CalculateRequestDTO dto) {
        return bodyFatCalculator.calculateBodyFatNavy(
            nvl(dto.getWaist()), nvl(dto.getNeck()), nvl(dto.getHip()),
            dto.getHeight(), dto.getGender().name());
    }

    private double calcBio(CalculateRequestDTO dto) {
        return bodyFatCalculator.calculateBodyFatBio(
            dto.getWeight(), dto.getHeight(), dto.getAge(),
            dto.getGender().name(),
            nvl(dto.getResistance()), nvl(dto.getReactance()));
    }

    private double calcSkinfold(CalculateRequestDTO dto) {
        String protocol = dto.getProtocol() != null ? dto.getProtocol() : "jp3";
        return bodyFatCalculator.calculateBodyFatSkinfold(
            protocol, dto.getGender().name(), dto.getAge(),
            nvl(dto.getBiceps()), nvl(dto.getTriceps()), nvl(dto.getSubscapular()),
            nvl(dto.getChest()), nvl(dto.getMidaxillary()), nvl(dto.getAbdominal()),
            nvl(dto.getSuprailiac()), nvl(dto.getThigh()));
    }

    private MethodDetailsDTO buildNavyDetails(CalculateRequestDTO dto, double bodyFat) {
        double navyBase = dto.getGender() == Gender.MALE
            ? nvl(dto.getWaist()) - nvl(dto.getNeck())
            : nvl(dto.getWaist()) + nvl(dto.getHip()) - nvl(dto.getNeck());

        List<MethodDetailItem> items = List.of(
            new MethodDetailItem("Método", "US Navy",
                "Estimativa baseada em circunferências corporais"),
            new MethodDetailItem("Medida base", String.format("%.1f cm", navyBase),
                "Valor principal usado no cálculo")
        );
        return new MethodDetailsDTO("Detalhes do método", items);
    }

    private MethodDetailsDTO buildBioDetails(CalculateRequestDTO dto) {
        double impedance = bodyFatCalculator.calculateImpedance(
            nvl(dto.getResistance()), nvl(dto.getReactance()));
        double phaseAngle = bodyFatCalculator.calculatePhaseAngle(
            nvl(dto.getResistance()), nvl(dto.getReactance()));
        double tbw = bodyFatCalculator.calculateTBW(
            dto.getWeight(), dto.getHeight(), dto.getGender().name(), nvl(dto.getResistance()));

        List<MethodDetailItem> items = List.of(
            new MethodDetailItem("Impedância", String.format("%.1f ohms", impedance),
                "Resistência elétrica corporal total"),
            new MethodDetailItem("Ângulo de fase", String.format("%.1f graus", phaseAngle),
                "Indicador associado à saúde celular"),
            new MethodDetailItem("Água corporal", String.format("%.1f L", tbw),
                "Estimativa de água total no organismo")
        );
        return new MethodDetailsDTO("Detalhes da bioimpedância", items);
    }

    private MethodDetailsDTO buildSkinfoldDetails(CalculateRequestDTO dto, double bodyFat) {
        String protocol = dto.getProtocol() != null ? dto.getProtocol() : "jp3";
        String protocolLabel = switch (protocol.toLowerCase()) {
            case "jp3" -> "Jackson-Pollock 3 dobras";
            case "jp7" -> "Jackson-Pollock 7 dobras";
            case "dw4" -> "Durnin-Womersley 4 dobras";
            default -> protocol;
        };

        double sum = bodyFatCalculator.calculateSkinfoldSum(
            protocol, dto.getGender().name(),
            nvl(dto.getBiceps()), nvl(dto.getTriceps()), nvl(dto.getSubscapular()),
            nvl(dto.getChest()), nvl(dto.getMidaxillary()), nvl(dto.getAbdominal()),
            nvl(dto.getSuprailiac()), nvl(dto.getThigh()));

        List<MethodDetailItem> items = List.of(
            new MethodDetailItem("Protocolo", protocolLabel,
                "Método utilizado para cálculo das dobras"),
            new MethodDetailItem("Soma das dobras", String.format("%.1f mm", sum),
                "Soma total das dobras medidas")
        );
        return new MethodDetailsDTO("Detalhes das dobras", items);
    }

    private MethodDetailsDTO buildImcDetails(double imc) {
        List<MethodDetailItem> items = List.of(
            new MethodDetailItem("IMC", String.format("%.1f", imc),
                "Índice de Massa Corporal (peso / altura²)"),
            new MethodDetailItem("Classificação", interpreter.classifyIMC(imc),
                "Baseado nos critérios da OMS")
        );
        return new MethodDetailsDTO("Detalhes do IMC", items);
    }

    private void validateBase(CalculateRequestDTO dto) {
        if (dto.getWeight() == null || dto.getWeight() <= 0)
            throw new IllegalArgumentException("Peso inválido");
        if (dto.getHeight() == null || dto.getHeight() <= 0)
            throw new IllegalArgumentException("Altura inválida");
        if (dto.getAge() == null || dto.getAge() < 10 || dto.getAge() > 100)
            throw new IllegalArgumentException("Idade inválida");
        if (dto.getGender() == null)
            throw new IllegalArgumentException("Sexo é obrigatório");
        if (dto.getMethod() == null)
            throw new IllegalArgumentException("Método é obrigatório");
    }

    private ActivityLevel parseActivityLevel(String value) {
        if (value == null || value.isBlank()) return ActivityLevel.MODERATE;
        try {
            return ActivityLevel.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ActivityLevel.MODERATE;
        }
    }

    private double nvl(Double value) {
        return value != null ? value : 0.0;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}