package com.bioimpedance.mapper;

import com.bioimpedance.dto.request.AssessmentRequestDTO;
import com.bioimpedance.dto.request.CalculateRequestDTO;
import com.bioimpedance.dto.response.AssessmentResponseDTO;
import com.bioimpedance.dto.response.CalculationResultDTO;
import com.bioimpedance.entity.Assessment;
import com.bioimpedance.entity.AssessmentResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface AssessmentMapper {

    @Mapping(target = "result", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Assessment toEntity(AssessmentRequestDTO dto);

    AssessmentResponseDTO toResponse(Assessment assessment);

    @Mapping(target = "methodDetails", ignore = true)
    @Mapping(target = "protein", ignore = true)
    @Mapping(target = "carbs", ignore = true)
    @Mapping(target = "fat", ignore = true)
    @Mapping(target = "trainingType", ignore = true)
    @Mapping(target = "cardio", ignore = true)
    CalculationResultDTO toCalculationResultDTO(AssessmentResult result);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "clientId", ignore = true)
    @Mapping(target = "date", ignore = true)
    @Mapping(target = "observations", ignore = true)
    @Mapping(target = "result", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Assessment toEntityFromCalculate(CalculateRequestDTO dto);
}