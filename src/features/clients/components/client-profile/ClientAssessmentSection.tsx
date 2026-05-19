import { useNavigate } from 'react-router-dom';
import { Copy, Trash2 } from 'lucide-react';
import type { Assessment } from '../../../assessment/types';
import { getAssessmentComparison } from '../../../../service/database';

interface Props {
  assessments: Assessment[];
  clientId: string;
}

export default function ClientAssessmentSection({ assessments, clientId }: Props) {
  const navigate = useNavigate();
  const comparison = getAssessmentComparison(clientId);

  const hasBodyComposition =
    comparison && comparison.latest.results.bodyFat > 0 && comparison.previous.results.bodyFat > 0;

  return (
    <div className="client-assessment-section">
      <div className="client-assessment-section__header">
        <h2>Histórico de Avaliações</h2>
      </div>

      {/* ── Comparison panel ── */}
      {comparison && (
        <div className="comparison-panel">
          {hasBodyComposition ? (
            <>
              <ComparisonBadge
                label="Peso"
                current={comparison.latest.weight}
                diff={comparison.weightDiff}
                unit="kg"
                invertColors={false}
              />
              <ComparisonBadge
                label="% Gordura"
                current={comparison.latest.results.bodyFat}
                diff={comparison.bodyFatDiff}
                unit="%"
                invertColors={true}
              />
              <ComparisonBadge
                label="Massa Magra"
                current={comparison.latest.results.leanMass}
                diff={comparison.leanMassDiff}
                unit="kg"
                invertColors={false}
              />
              <ComparisonBadge
                label="Massa Gorda"
                current={comparison.latest.results.fatMass}
                diff={comparison.fatMassDiff}
                unit="kg"
                invertColors={true}
              />
            </>
          ) : (
            <p className="comparison-panel__empty">
              Dados de composição corporal indisponíveis para comparação.
              <br />
              Realize avaliações com métodos que calculam % de gordura.
            </p>
          )}
        </div>
      )}

      {/* ── Assessment list ── */}
      {!assessments.length ? (
        <div className="client-assessment-section__empty">
          <p>Nenhuma avaliação realizada ainda.</p>
        </div>
      ) : (
        <div className="client-assessment-section__list">
          {/* Header row */}
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
                {assessment.results.bodyFat > 0
                  ? `${assessment.results.bodyFat.toFixed(1)}% gordura`
                  : assessment.method === 'imc'
                    ? `IMC ${assessment.results.imc.toFixed(1)}`
                    : '—'}
              </span>

              <div className="assessment-card__actions">
                <button
                  onClick={() => navigate(`/new-assessment/${assessment.clientId}`)}
                  title="Duplicar avaliação"
                >
                  <Copy size={14} />
                  Duplicar
                </button>
                <button
                  title="Excluir avaliação"
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
                      // @ts-ignore
                      window.db.deleteAssessment(assessment.id);
                      window.location.reload();
                    }
                  }}
                >
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
