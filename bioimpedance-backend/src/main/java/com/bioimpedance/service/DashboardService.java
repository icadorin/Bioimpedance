package com.bioimpedance.service;

import com.bioimpedance.constants.PlanFeature;
import com.bioimpedance.dto.response.AssessmentResponseDTO;
import com.bioimpedance.dto.response.ClientProgressDTO;
import com.bioimpedance.dto.response.ComparisonDTO;
import com.bioimpedance.dto.response.DashboardStatsDTO;
import com.bioimpedance.entity.Assessment;
import com.bioimpedance.mapper.AssessmentMapper;
import com.bioimpedance.repository.AssessmentRepository;
import com.bioimpedance.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ClientRepository clientRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentMapper assessmentMapper;
    private final BillingService billingService;

    public DashboardStatsDTO getDashboardStats() {
        billingService.requireFeature(PlanFeature.CHARTS);

        long totalClients = clientRepository.count();
        long activeClients = clientRepository.countByStatus(com.bioimpedance.constants.ClientStatus.ACTIVE);

        LocalDate startOfMonth = LocalDate.now().with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
        long assessmentsThisMonth = assessmentRepository.countByDateBetween(startOfMonth, endOfMonth);

        // Cálculo do progresso médio
        List<ClientProgressDTO> progressList = getClientsWithProgress();
        double avgBodyFatChange = 0;
        double avgLeanMassChange = 0;
        int clientsWithProgress = progressList.size();

        if (clientsWithProgress > 0) {
            avgBodyFatChange = progressList.stream()
                .mapToDouble(ClientProgressDTO::getBodyFatDiff)
                .average()
                .orElse(0);
            avgLeanMassChange = progressList.stream()
                .mapToDouble(ClientProgressDTO::getLeanMassDiff)
                .average()
                .orElse(0);
        }

        return DashboardStatsDTO.builder()
            .totalClients((int) totalClients)
            .activeClients((int) activeClients)
            .assessmentsThisMonth((int) assessmentsThisMonth)
            .averageBodyFatChange(round2(avgBodyFatChange))
            .averageLeanMassChange(round2(avgLeanMassChange))
            .clientsWithProgress(clientsWithProgress)
            .build();
    }

    public List<ClientProgressDTO> getClientsWithProgress() {
        billingService.requireFeature(PlanFeature.BODY_COMPARISON);

        List<ClientProgressDTO> result = new ArrayList<>();

        clientRepository.findAll().forEach(client -> {
            List<Assessment> assessments = assessmentRepository
                .findByClientIdOrderByDateDesc(client.getId());

            // Filtra apenas avaliações válidas para comparação (não IMC e com bodyFat > 0)
            List<Assessment> validAssessments = assessments.stream()
                .filter(a -> a.getMethod() != com.bioimpedance.constants.AssessmentMethod.IMC)
                .filter(a -> a.getResult() != null)
                .filter(a -> a.getResult().getBodyFat() != null && a.getResult().getBodyFat() > 0)
                .filter(a -> a.getResult().getLeanMass() != null && a.getResult().getLeanMass() > 0)
                .toList();

            if (validAssessments.size() >= 2) {
                Assessment latest = validAssessments.get(0);
                Assessment previous = validAssessments.get(1);

                result.add(ClientProgressDTO.builder()
                    .clientId(client.getId())
                    .clientName(client.getName())
                    .clientGoal(client.getGoal())
                    .weightDiff(round2(latest.getWeight() - previous.getWeight()))
                    .bodyFatDiff(round2(latest.getResult().getBodyFat() - previous.getResult().getBodyFat()))
                    .leanMassDiff(round2(latest.getResult().getLeanMass() - previous.getResult().getLeanMass()))
                    .latestDate(latest.getDate().toString())
                    .previousDate(previous.getDate().toString())
                    .build());
            }
        });

        // Ordena por maior mudança absoluta (gordura + massa magra)
        return result.stream()
            .sorted((a, b) -> {
                double scoreA = Math.abs(a.getBodyFatDiff()) + Math.abs(a.getLeanMassDiff());
                double scoreB = Math.abs(b.getBodyFatDiff()) + Math.abs(b.getLeanMassDiff());
                return Double.compare(scoreB, scoreA);
            })
            .limit(4)
            .collect(Collectors.toList());
    }

    public List<AssessmentResponseDTO> getRecentAssessments() {
        billingService.requireFeature(PlanFeature.HISTORY);

        return assessmentRepository.findTop5ByOrderByDateDesc()
            .stream()
            .map(assessmentMapper::toResponse)
            .collect(Collectors.toList());
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
