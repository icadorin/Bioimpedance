import { useEffect, useState } from 'react';
import { api, type ClientProgressResponse } from '../../../services/api';
import type { Assessment } from '../../assessment/types/assessment.types';

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  assessmentsThisMonth: number;
  averageProgress: {
    weightChange: number;
    bodyFatChange: number;
    leanMassChange: number;
    clientCount: number;
  };
}

const EMPTY_STATS: DashboardStats = {
  totalClients: 0,
  activeClients: 0,
  assessmentsThisMonth: 0,
  averageProgress: {
    weightChange: 0,
    bodyFatChange: 0,
    leanMassChange: 0,
    clientCount: 0,
  },
};

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>(EMPTY_STATS);
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [clientsWithBestProgress, setClientsWithBestProgress] = useState<ClientProgressResponse[]>(
    []
  );

  useEffect(() => {
    let active = true;

    async function loadDashboardData() {
      try {
        const [dashboardStats, recent, progress] = await Promise.all([
          api.getDashboardStats(),
          api.getRecentAssessments(),
          api.getClientProgress(),
        ]);

        if (!active) return;

        setStats({
          totalClients: dashboardStats.totalClients,
          activeClients: dashboardStats.activeClients,
          assessmentsThisMonth: dashboardStats.assessmentsThisMonth,
          averageProgress: {
            weightChange: 0,
            bodyFatChange: dashboardStats.averageBodyFatChange,
            leanMassChange: dashboardStats.averageLeanMassChange,
            clientCount: dashboardStats.clientsWithProgress,
          },
        });
        setRecentAssessments(recent);
        setClientsWithBestProgress(progress);
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        if (active) {
          setStats(EMPTY_STATS);
          setRecentAssessments([]);
          setClientsWithBestProgress([]);
        }
      }
    }

    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  return {
    stats,
    recentAssessments,
    clientsWithBestProgress,
  };
}
