import { useNavigate } from 'react-router-dom';
import { ClipboardPlus, Users, FileText, History } from 'lucide-react';

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nova Avaliação',
      icon: <ClipboardPlus size={20} />,
      path: '/new-assessment',
      color: '#6139a5',
      description: 'Realizar avaliação corporal',
    },
    {
      label: 'Novo Cliente',
      icon: <Users size={20} />,
      path: '/clients',
      color: '#22c55e',
      description: 'Cadastrar novo aluno',
    },
    {
      label: 'Histórico',
      icon: <History size={20} />,
      path: '/history',
      color: '#3b82f6',
      description: 'Ver avaliações passadas',
    },
    {
      label: 'Gerar PDF',
      icon: <FileText size={20} />,
      path: '/pdfs',
      color: '#f59e0b',
      description: 'Exportar relatório',
    },
  ];

  return (
    <div className="dashboard-card">
      <h2>Ações Rápidas</h2>
      <div className="quick-actions-grid">
        {actions.map((action, index) => (
          <button
            key={index}
            className="quick-action-button"
            onClick={() => navigate(action.path)}
            style={{
              borderLeftColor: action.color,
            }}
          >
            <div className="quick-action-icon" style={{ color: action.color }}>
              {action.icon}
            </div>
            <div className="quick-action-content">
              <strong>{action.label}</strong>
              <span>{action.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
