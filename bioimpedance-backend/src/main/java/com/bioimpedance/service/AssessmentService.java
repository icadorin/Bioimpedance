package com.bioimpedance.service;

import com.bioimpedance.constants.PlanFeature;
import com.bioimpedance.dto.request.AssessmentRequestDTO;
import com.bioimpedance.dto.response.AssessmentResponseDTO;
import com.bioimpedance.dto.response.CalculationResultDTO;
import com.bioimpedance.entity.Assessment;
import com.bioimpedance.entity.AssessmentResult;
import com.bioimpedance.exception.ResourceNotFoundException;
import com.bioimpedance.mapper.AssessmentMapper;
import com.bioimpedance.repository.AssessmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentMapper assessmentMapper;
    private final CalculationService calculationService;
    private final BillingService billingService;

    @Transactional
    public AssessmentResponseDTO create(AssessmentRequestDTO dto) {
        billingService.requireFeature(PlanFeature.HISTORY);

        // Calcula os resultados
        var calcRequest = convertToCalculateRequest(dto);
        CalculationResultDTO resultDTO = calculationService.calculate(calcRequest);

        // Converte para Entity
        Assessment assessment = assessmentMapper.toEntity(dto);
        assessment.setResult(convertToAssessmentResult(resultDTO));

        assessment = assessmentRepository.save(assessment);
        return assessmentMapper.toResponse(assessment);
    }

    public List<AssessmentResponseDTO> findByClientId(String clientId) {
        billingService.requireFeature(PlanFeature.HISTORY);

        return assessmentRepository.findByClientIdOrderByDateDesc(clientId)
            .stream()
            .map(assessmentMapper::toResponse)
            .toList();
    }

    public AssessmentResponseDTO findById(String id) {
        billingService.requireFeature(PlanFeature.HISTORY);

        Assessment assessment = assessmentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada"));
        return assessmentMapper.toResponse(assessment);
    }

    public void delete(String id) {
        billingService.requireFeature(PlanFeature.HISTORY);

        if (!assessmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Avaliação não encontrada");
        }
        assessmentRepository.deleteById(id);
    }

    private com.bioimpedance.dto.request.CalculateRequestDTO convertToCalculateRequest(AssessmentRequestDTO dto) {
        return com.bioimpedance.dto.request.CalculateRequestDTO.builder()
            .method(dto.getMethod())
            .weight(dto.getWeight())
            .height(dto.getHeight())
            .age(dto.getAge())
            .gender(dto.getGender())
            .activityLevel("MODERATE") // TODO: pegar do client ou do DTO
            .objective("MAINTENANCE")  // TODO: pegar do client ou do DTO
            .waist(dto.getWaist())
            .neck(dto.getNeck())
            .hip(dto.getHip())
            .resistance(dto.getResistance())
            .reactance(dto.getReactance())
            .protocol(dto.getProtocol())
            .biceps(dto.getBiceps())
            .chest(dto.getChest())
            .midaxillary(dto.getMidaxillary())
            .triceps(dto.getTriceps())
            .subscapular(dto.getSubscapular())
            .abdominal(dto.getAbdominal())
            .suprailiac(dto.getSuprailiac())
            .thigh(dto.getThigh())
            .build();
    }

    private AssessmentResult convertToAssessmentResult(CalculationResultDTO dto) {
        return AssessmentResult.builder()
            .imc(dto.getImc())
            .bodyFat(dto.getBodyFat())
            .leanMass(dto.getLeanMass())
            .fatMass(dto.getFatMass())
            .ffmi(dto.getFfmi())
            .bmr(dto.getBmr())
            .tdee(dto.getTdee())
            .targetCalories(dto.getTargetCalories())
            .bodyFatLevel(dto.getBodyFatLevel())
            .build();
    }
}
