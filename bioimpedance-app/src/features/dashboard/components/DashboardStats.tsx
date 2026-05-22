import { Users, ClipboardCheck, TrendingUp, Target } from 'lucide-react';
import type { DashboardStats } from '../hooks/useDashboardData';

interface Props {
  stats: DashboardStats;
}

export default function DashboardStatsCards({ stats }: Props) {
  const formatBodyFatChange = () => {
    if (stats.averageProgress.clientCount === 0) return '—';
    const change = stats.averageProgress.bodyFatChange;
    const signal = change > 0 ? '+' : '';
    return `${signal}${change.toFixed(1)}%`;
  };

  const formatLeanMassChange = () => {
    if (stats.averageProgress.clientCount === 0) return '—';
    const change = stats.averageProgress.leanMassChange;
    const signal = change > 0 ? '+' : '';
    return `${signal}${change.toFixed(1)} kg`;
  };

  const cards = [
    {
      title: 'Total de Alunos',
      value: stats.totalClients,
      subtitle: `${stats.activeClients} ativos`,
      icon: <Users size={24} />,
      color: '#6139a5',
    },
    {
      title: 'Avaliações no Mês',
      value: stats.assessmentsThisMonth,
      subtitle: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      icon: <ClipboardCheck size={24} />,
      color: '#22c55e',
    },
    {
      title: 'Média de Gordura',
      value: formatBodyFatChange(),
      subtitle:
        stats.averageProgress.clientCount > 0
          ? `${stats.averageProgress.clientCount} alunos comparados`
          : 'Mínimo 2 avaliações válidas',
      icon: <TrendingUp size={24} />,
      color: '#f59e0b',
    },
    {
      title: 'Massa Magra Média',
      value: formatLeanMassChange(),
      subtitle:
        stats.averageProgress.clientCount > 0
          ? `${stats.averageProgress.clientCount} alunos`
          : 'Mínimo 2 avaliações válidas',
      icon: <Target size={24} />,
      color: '#3b82f6',
    },
  ];

  return (
    <div className="dashboard-stats">
      {cards.map((card, index) => (
        <div key={index} className="dashboard-stat-card">
          <div className="dashboard-stat-card__header">
            <div className="dashboard-stat-card__title">{card.title}</div>
            <div
              className="dashboard-stat-card__icon"
              style={{ backgroundColor: `${card.color}20`, color: card.color }}
            >
              {card.icon}
            </div>
          </div>
          <div className="dashboard-stat-card__value">{card.value}</div>
          <div className="dashboard-stat-card__subtitle">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
