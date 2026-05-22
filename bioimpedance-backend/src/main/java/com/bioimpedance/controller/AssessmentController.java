package com.bioimpedance.controller;

import com.bioimpedance.dto.request.AssessmentRequestDTO;
import com.bioimpedance.dto.request.CalculateRequestDTO;
import com.bioimpedance.dto.response.AssessmentResponseDTO;
import com.bioimpedance.dto.response.CalculationResultDTO;
import com.bioimpedance.service.AssessmentService;
import com.bioimpedance.service.CalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final CalculationService calculationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AssessmentResponseDTO create(@RequestBody AssessmentRequestDTO dto) {
        return assessmentService.create(dto);
    }

    @PostMapping("/calculate")
    public CalculationResultDTO calculate(@RequestBody CalculateRequestDTO dto) {
        return calculationService.calculate(dto);
    }

    @GetMapping("/client/{clientId}")
    public List<AssessmentResponseDTO> findByClient(@PathVariable String clientId) {
        return assessmentService.findByClientId(clientId);
    }
}