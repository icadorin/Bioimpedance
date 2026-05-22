package com.bioimpedance.controller;

import com.bioimpedance.dto.response.ClientProgressDTO;
import com.bioimpedance.dto.response.DashboardStatsDTO;
import com.bioimpedance.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats() {
        return dashboardService.getDashboardStats();
    }

    @GetMapping("/progress")
    public List<ClientProgressDTO> getClientProgress() {
        return dashboardService.getClientsWithProgress();
    }

    @GetMapping("/recent-assessments")
    public List<?> getRecentAssessments() {
        return dashboardService.getRecentAssessments();
    }
}