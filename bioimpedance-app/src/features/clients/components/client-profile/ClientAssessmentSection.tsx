import { useNavigate } from 'react-router-dom';
import { Copy, Trash2 } from 'lucide-react';
import type { Assessment } from '../../../assessment/types';
import { useBilling } from '../../../billing/hooks/useBilling';

interface Props {
  assessments: Assessment[];
  clientId: string;
}

export default function ClientAssessmentSection({ assessments, clientId }: Props) {
  const navigate = useNavigate();
  const { hasFeature } = useBilling();
  const canCompareBody = hasFeature('body_comparison');

  const hasBodyComposition =
    canCompareBody &&
    assessments.length >= 2 &&
    assessments[0].results?.bodyFat > 0 &&
    assessments[1].results?.bodyFat > 0;

  return (
    <div className="client-assessment-section">
      <div className="client-assessment-section__header">
        <h2>Histórico de Avaliações</h2>
      </div>

      {hasBodyComposition && (
        <div className="comparison-panel">
          <ComparisonBadge
            label="Peso"
            current={assessments[0].weight}
            diff={assessments[0].weight - assessments[1].weight}
            unit="kg"
            invertColors={false}
          />
          <ComparisonBadge
            label="% Gordura"
            current={assessments[0].results.bodyFat}
            diff={assessments[0].results.bodyFat - assessments[1].results.bodyFat}
            unit="%"
            invertColors
          />
          <ComparisonBadge
            label="Massa Magra"
            current={assessments[0].results.leanMass}
            diff={assessments[0].results.leanMass - assessments[1].results.leanMass}
            unit="kg"
            invertColors={false}
          />
        </div>
      )}

      {!hasBodyComposition && (
        <p className="comparison-panel__empty">
          {canCompareBody
            ? 'Dados de composição corporal indisponíveis para comparação.'
            : 'Comparação corporal disponível nos planos Pro e Studio.'}
          <br />
          {canCompareBody
            ? 'Realize pelo menos 2 avaliações com métodos que calculam % de gordura.'
            : 'Atualize o plano para comparar evoluções entre avaliações.'}
        </p>
      )}

      {!assessments.length ? (
        <div className="client-assessment-section__empty">
          <p>Nenhuma avaliação realizada ainda.</p>
        </div>
      ) : (
        <div className="client-assessment-section__list">
          <div className="client-assessment-section__list-header">
            <span>Método</span>
            <span>Data</span>
            <span>Peso</span>
            <span>Composição</span>
            <span></span>
          </div>

          {assessments.map((assessment) => (
            <div key={assessment.id} className="client-assessment-section__card">
              <span className="assessment-card__method">{assessment.method}</span>
              <span className="assessment-card__date">
                {new Date(assessment.date).toLocaleDateString('pt-BR')}
              </span>
              <span className="assessment-card__weight">{assessment.weight} kg</span>
              <span className="assessment-card__fat">
                {assessment.results?.bodyFat > 0
                  ? `${assessment.results.bodyFat.toFixed(1)}% gordura`
                  : assessment.method === 'imc'
                    ? `IMC ${assessment.results?.imc?.toFixed(1)}`
                    : '—'}
              </span>

              <div className="assessment-card__actions">
                <button
                  onClick={() => navigate(`/new-assessment/${clientId}`)}
                  title="Duplicar avaliação"
                >
                  <Copy size={14} />
                  Duplicar
                </button>
                <button disabled title="Endpoint de exclusão de avaliações indisponível">
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ComparisonBadge({
  label,
  current,
  diff,
  unit,
  invertColors,
}: {
  label: string;
  current: number;
  diff: number;
  unit: string;
  invertColors: boolean;
}) {
  const isGood = invertColors ? diff < 0 : diff > 0;
  const diffClass =
    diff === 0
      ? 'comparison-badge__diff--neutral'
      : isGood
        ? 'comparison-badge__diff--good'
        : 'comparison-badge__diff--bad';

  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';

  return (
    <div className="comparison-badge">
      <span className="comparison-badge__label">{label}</span>
      <span className="comparison-badge__value">
        {current.toFixed(1)} <span className="comparison-badge__unit">{unit}</span>
      </span>
      {diff !== 0 && (
        <span className={`comparison-badge__diff ${diffClass}`}>
          {arrow} {Math.abs(diff).toFixed(1)} {unit}
        </span>
      )}
    </div>
  );
}
