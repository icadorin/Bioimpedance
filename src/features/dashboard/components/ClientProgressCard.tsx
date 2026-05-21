import { useNavigate } from 'react-router-dom';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type { ClientProgressResponse } from '../../../services/api';

interface Props {
  items: ClientProgressResponse[];
}

export default function ClientProgressCard({ items }: Props) {
  const navigate = useNavigate();
  const validItems = items.filter(
    (item) => Number.isFinite(item.bodyFatDiff) && Number.isFinite(item.leanMassDiff)
  );

  if (!validItems.length) {
    return (
      <div className="dashboard-card">
        <h2>Evolução dos Alunos</h2>
        <div className="dashboard-empty">
          <p>Realize 2 ou mais avaliações corporais para ver a evolução.</p>
          <small style={{ color: 'var(--muted)', marginTop: '8px' }}>
            Avaliações apenas de IMC não são consideradas para comparação.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Evolução dos Alunos</h2>
        <span className="dashboard-card__badge">{validItems.length} alunos</span>
      </div>

      <div className="client-progress-list">
        {validItems.map((item) => {
          const bodyFatTrend =
            item.bodyFatDiff > 0 ? 'up' : item.bodyFatDiff < 0 ? 'down' : 'stable';
          const leanMassTrend =
            item.leanMassDiff > 0 ? 'up' : item.leanMassDiff < 0 ? 'down' : 'stable';
          const weightTrend =
            item.weightDiff > 0 ? 'up' : item.weightDiff < 0 ? 'down' : 'stable';

          return (
            <div
              key={item.clientId}
              className="client-progress-item"
              onClick={() => navigate(`/clients/${item.clientId}`)}
            >
              <div className="client-progress-item__header">
                <div className="client-progress-avatar">
                  {item.clientName.charAt(0).toUpperCase()}
                </div>
                <div className="client-progress-info">
                  <strong>{item.clientName}</strong>
                  <span>{item.clientGoal || 'Sem objetivo'}</span>
                </div>
              </div>

              <div className="client-progress-metrics">
                <div className="client-progress-metric">
                  <span className="metric-label">Peso</span>
                  <span
                    className={`metric-value ${weightTrend === 'up' ? 'negative' : 'positive'}`}
                  >
                    {weightTrend === 'up' && <TrendingUp size={14} />}
                    {weightTrend === 'down' && <TrendingDown size={14} />}
                    {weightTrend === 'stable' && <Minus size={14} />}
                    {item.weightDiff > 0 ? '+' : ''}
                    {item.weightDiff.toFixed(1)} kg
                  </span>
                </div>

                <div className="client-progress-metric">
                  <span className="metric-label">Gordura</span>
                  <span
                    className={`metric-value ${bodyFatTrend === 'down' ? 'positive' : 'negative'}`}
                  >
                    {bodyFatTrend === 'up' && <TrendingUp size={14} />}
                    {bodyFatTrend === 'down' && <TrendingDown size={14} />}
                    {bodyFatTrend === 'stable' && <Minus size={14} />}
                    {item.bodyFatDiff > 0 ? '+' : ''}
                    {item.bodyFatDiff.toFixed(1)}%
                  </span>
                </div>

                <div className="client-progress-metric">
                  <span className="metric-label">Massa Magra</span>
                  <span
                    className={`metric-value ${leanMassTrend === 'up' ? 'positive' : 'negative'}`}
                  >
                    {leanMassTrend === 'up' && <TrendingUp size={14} />}
                    {leanMassTrend === 'down' && <TrendingDown size={14} />}
                    {leanMassTrend === 'stable' && <Minus size={14} />}
                    {item.leanMassDiff > 0 ? '+' : ''}
                    {item.leanMassDiff.toFixed(1)} kg
                  </span>
                </div>
              </div>

              <div className="client-progress-dates">
                <span>{new Date(item.previousDate).toLocaleDateString('pt-BR')}</span>
                <span>→</span>
                <span>{new Date(item.latestDate).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
