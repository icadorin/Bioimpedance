import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { Client } from '../../clients/types/client.types';
import type { Assessment } from '../../assessment/types/assessment.types';

interface Props {
  items: Array<{
    client: Client;
    comparison: {
      weightDiff: number;
      bodyFatDiff: number;
      leanMassDiff: number;
      fatMassDiff: number;
      imcDiff: number;
      latest: Assessment;
      previous: Assessment;
    } | null;
  }>;
}

export default function ClientProgressCard({ items }: Props) {
  const navigate = useNavigate();

  // Filtra itens com comparação válida E que tenham dados corporais
  const validItems = items.filter((item) => {
    if (!item.comparison) return false;

    const { latest, previous } = item.comparison;

    // Verifica se AMBAS as avaliações têm dados corporais completos
    return (
      latest.method !== 'imc' &&
      previous.method !== 'imc' &&
      latest.results.bodyFat > 0 &&
      previous.results.bodyFat > 0 &&
      latest.results.leanMass > 0 &&
      previous.results.leanMass > 0
    );
  });

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
        {validItems.map(({ client, comparison }) => {
          if (!comparison) return null;

          const bodyFatTrend =
            comparison.bodyFatDiff > 0 ? 'up' : comparison.bodyFatDiff < 0 ? 'down' : 'stable';

          const leanMassTrend =
            comparison.leanMassDiff > 0 ? 'up' : comparison.leanMassDiff < 0 ? 'down' : 'stable';

          const weightTrend =
            comparison.weightDiff > 0 ? 'up' : comparison.weightDiff < 0 ? 'down' : 'stable';

          return (
            <div
              key={client.id}
              className="client-progress-item"
              onClick={() => navigate(`/clients/${client.id}`)}
            >
              <div className="client-progress-item__header">
                <div className="client-progress-avatar">{client.name.charAt(0).toUpperCase()}</div>
                <div className="client-progress-info">
                  <strong>{client.name}</strong>
                  <span>{client.goal || 'Sem objetivo'}</span>
                </div>
              </div>

              <div className="client-progress-metrics">
                {/* Peso - sempre disponível */}
                <div className="client-progress-metric">
                  <span className="metric-label">Peso</span>
                  <span
                    className={`metric-value ${weightTrend === 'up' ? 'negative' : 'positive'}`}
                  >
                    {weightTrend === 'up' && <TrendingUp size={14} />}
                    {weightTrend === 'down' && <TrendingDown size={14} />}
                    {weightTrend === 'stable' && <Minus size={14} />}
                    {comparison.weightDiff > 0 ? '+' : ''}
                    {comparison.weightDiff.toFixed(1)} kg
                  </span>
                </div>

                {/* Gordura Corporal - só se disponível */}
                <div className="client-progress-metric">
                  <span className="metric-label">Gordura</span>
                  <span
                    className={`metric-value ${bodyFatTrend === 'down' ? 'positive' : 'negative'}`}
                  >
                    {bodyFatTrend === 'up' && <TrendingUp size={14} />}
                    {bodyFatTrend === 'down' && <TrendingDown size={14} />}
                    {bodyFatTrend === 'stable' && <Minus size={14} />}
                    {comparison.bodyFatDiff > 0 ? '+' : ''}
                    {comparison.bodyFatDiff.toFixed(1)}%
                  </span>
                </div>

                {/* Massa Magra - só se disponível */}
                <div className="client-progress-metric">
                  <span className="metric-label">Massa Magra</span>
                  <span
                    className={`metric-value ${leanMassTrend === 'up' ? 'positive' : 'negative'}`}
                  >
                    {leanMassTrend === 'up' && <TrendingUp size={14} />}
                    {leanMassTrend === 'down' && <TrendingDown size={14} />}
                    {leanMassTrend === 'stable' && <Minus size={14} />}
                    {comparison.leanMassDiff > 0 ? '+' : ''}
                    {comparison.leanMassDiff.toFixed(1)} kg
                  </span>
                </div>
              </div>

              <div className="client-progress-dates">
                <span>{new Date(comparison.previous.date).toLocaleDateString('pt-BR')}</span>
                <span>→</span>
                <span>{new Date(comparison.latest.date).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
