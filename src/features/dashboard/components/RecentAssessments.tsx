import { useNavigate } from 'react-router-dom';
import { useClients } from '../../clients/hooks/useClients';
import type { Assessment } from '../../assessment/types/assessment.types';
import { Calendar, Scale, Activity } from 'lucide-react';

interface Props {
  assessments: Assessment[];
}

export default function RecentAssessments({ assessments }: Props) {
  const navigate = useNavigate();
  const { getClientById } = useClients();

  if (!assessments.length) {
    return (
      <div className="dashboard-card">
        <h2>Últimas Avaliações</h2>
        <div className="dashboard-empty">
          <p>Nenhuma avaliação realizada ainda.</p>
          <button onClick={() => navigate('/new-assessment')}>+ Nova Avaliação</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Últimas Avaliações</h2>
        <button className="dashboard-card__action" onClick={() => navigate('/history')}>
          Ver todas
        </button>
      </div>

      <div className="recent-assessments">
        {assessments.map((assessment) => {
          const client = getClientById(assessment.clientId || '');

          return (
            <div
              key={assessment.id}
              className="recent-assessment-item"
              onClick={() => client && navigate(`/clients/${client.id}`)}
            >
              <div className="recent-assessment-item__left">
                <div className="recent-assessment-avatar">
                  {client?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="recent-assessment-info">
                  <strong>{client?.name || 'Cliente removido'}</strong>
                  <div className="recent-assessment-meta">
                    <span>
                      <Calendar size={12} />
                      {new Date(assessment.date).toLocaleDateString('pt-BR')}
                    </span>
                    <span>
                      <Activity size={12} />
                      {assessment.method.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="recent-assessment-item__right">
                <div className="recent-assessment-metric">
                  <Scale size={14} />
                  <span>{assessment.weight} kg</span>
                </div>
                <div className="recent-assessment-metric secondary">
                  <span>
                    {assessment.results?.bodyFat > 0
                      ? `${assessment.results.bodyFat.toFixed(1)}% BF`
                      : assessment.method === 'imc'
                        ? `IMC ${assessment.results?.imc?.toFixed(1)}`
                        : '—'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
