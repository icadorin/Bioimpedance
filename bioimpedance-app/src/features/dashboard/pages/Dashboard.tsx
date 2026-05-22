import { Sun, Sunset, Moon, Sparkles, TrendingUp, Target, Award, BarChart3 } from 'lucide-react';
import { useDashboardData } from '../hooks/useDashboardData';
import DashboardStatsCards from '../components/DashboardStats';
import RecentAssessments from '../components/RecentAssessments';
import QuickActions from '../components/QuickActions';
import ClientProgressCard from '../components/ClientProgressCard';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { stats, recentAssessments, clientsWithBestProgress } = useDashboardData();

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return {
        Icon: Sun,
        greeting: 'Bom dia',
        message: 'Hora de acompanhar o progresso dos seus alunos!',
        iconColor: '#f59e0b',
      };
    }

    if (hour >= 12 && hour < 18) {
      return {
        Icon: Sunset,
        greeting: 'Boa tarde',
        message: 'Continue transformando vidas através da avaliação física!',
        iconColor: '#f97316',
      };
    }

    return {
      Icon: Moon,
      greeting: 'Boa noite',
      message: 'Acompanhe os resultados e planeje o próximo passo dos seus alunos.',
      iconColor: '#6366f1',
    };
  };

  const { Icon, greeting, message, iconColor } = getGreeting();

  const motivationalMessages = [
    {
      text: 'Cada avaliação é um passo rumo à evolução!',
      Icon: TrendingUp,
    },
    {
      text: 'Seus alunos confiam no seu trabalho. Continue assim!',
      Icon: Award,
    },
    {
      text: 'Dados transformam treinos em resultados!',
      Icon: BarChart3,
    },
    {
      text: 'O progresso começa com uma boa avaliação!',
      Icon: Target,
    },
    {
      text: 'Profissionais que medem, evoluem!',
      Icon: Sparkles,
    },
  ];

  const randomMessage =
    motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div className="dashboard-welcome__header">
          <Icon
            size={36}
            color={iconColor}
            style={{
              backgroundColor: `${iconColor}15`,
              padding: '8px',
              borderRadius: '10px',
            }}
          />
          <h1>{greeting}!</h1>
        </div>
        <p className="welcome-text">{message}</p>
        <div className="welcome-quote">
          <randomMessage.Icon size={16} />
          <span>{randomMessage.text}</span>
        </div>
      </div>

      <DashboardStatsCards stats={stats} />

      <div className="dashboard-grid">
        <div className="dashboard-grid-full">
          <QuickActions />
        </div>

        <RecentAssessments assessments={recentAssessments} />

        <ClientProgressCard items={clientsWithBestProgress} />
      </div>
    </div>
  );
}
