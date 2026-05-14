import { useMemo } from 'react';
import {
  getAllClients,
  getAllAssessments,
  getAssessmentComparison,
} from '../../../service/database';
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

export interface RecentActivity {
  type: 'assessment' | 'client';
  clientName: string;
  clientId: string;
  date: string;
  description: string;
}

export function useDashboardData() {
  const clients = useMemo(() => getAllClients(), []);
  const assessments = useMemo(() => getAllAssessments(), []);

  const stats: DashboardStats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Total de clientes
    const totalClients = clients.length;
    const activeClients = clients.filter((c) => c.status === 'active').length;

    // Avaliações do mês
    const assessmentsThisMonth = assessments.filter((a) => {
      const assessmentDate = new Date(a.date);
      return (
        assessmentDate.getMonth() === currentMonth && assessmentDate.getFullYear() === currentYear
      );
    }).length;

    // Progresso médio dos clientes que têm 2+ avaliações VÁLIDAS
    let totalWeightChange = 0;
    let totalBodyFatChange = 0;
    let totalLeanMassChange = 0;
    let clientCount = 0;

    clients.forEach((client) => {
      const comparison = getAssessmentComparison(client.id);

      // Só conta se a comparação for válida
      if (comparison) {
        totalWeightChange += comparison.weightDiff;
        totalBodyFatChange += comparison.bodyFatDiff;
        totalLeanMassChange += comparison.leanMassDiff;
        clientCount++;
      }
    });

    return {
      totalClients,
      activeClients,
      assessmentsThisMonth,
      averageProgress: {
        weightChange: clientCount > 0 ? totalWeightChange / clientCount : 0,
        bodyFatChange: clientCount > 0 ? totalBodyFatChange / clientCount : 0,
        leanMassChange: clientCount > 0 ? totalLeanMassChange / clientCount : 0,
        clientCount,
      },
    };
  }, [clients, assessments]);

  const recentAssessments: Assessment[] = useMemo(() => {
    return assessments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [assessments]);

  const clientsWithBestProgress = useMemo(() => {
    return clients
      .map((client) => {
        const comparison = getAssessmentComparison(client.id);
        return {
          client,
          comparison,
        };
      })
      .filter((item) => item.comparison !== null)
      .sort((a, b) => {
        // Ordena por mudança absoluta (gordura + massa magra)
        const aScore = Math.abs(a.comparison!.bodyFatDiff) + Math.abs(a.comparison!.leanMassDiff);
        const bScore = Math.abs(b.comparison!.bodyFatDiff) + Math.abs(b.comparison!.leanMassDiff);
        return bScore - aScore; // Maior mudança primeiro
      })
      .slice(0, 4);
  }, [clients]);

  return {
    stats,
    recentAssessments,
    clientsWithBestProgress,
  };
}
