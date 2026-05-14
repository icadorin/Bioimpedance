import type { Assessment } from '../../../assessment/types';
import { getAssessmentComparison } from '../../../../service/database';

interface Props {
  assessments: Assessment[];
  clientId: string;
}

export default function ClientAssessmentSection({ assessments, clientId }: Props) {
  const comparison = getAssessmentComparison(clientId);

  return (
    <div className="client-assessment-section">
      <div className="client-assessment-section__header">
        <h2>Histórico de Avaliações</h2>
      </div>

      {/* Comparação rápida */}
      {comparison && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(97, 57, 165, 0.08)',
            borderRadius: '16px',
            border: '1px solid var(--accent)',
          }}
        >
          <ComparisonBadge
            label="Peso"
            current={comparison.latest.weight}
            diff={comparison.weightDiff}
            unit="kg"
            invertColors={false}
          />
          {/* Só mostra gordura se ambas as avaliações tiverem o dado */}
          {comparison.latest.results.bodyFat > 0 && comparison.previous.results.bodyFat > 0 ? (
            <>
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
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                color: 'var(--muted)',
                padding: '12px',
                fontSize: '13px',
              }}
            >
              Dados de composição corporal indisponíveis para comparação.
              <br />
              Realize avaliações com métodos que calculam % de gordura.
            </div>
          )}
        </div>
      )}

      {/* Lista de avaliações */}
      {!assessments.length ? (
        <div className="client-assessment-section__empty">
          <p>Nenhuma avaliação realizada ainda.</p>
        </div>
      ) : (
        <div className="client-assessment-section__list">
          {assessments.map((assessment) => (
            <div key={assessment.id} className="client-assessment-section__card">
              <div>
                <strong>{assessment.method.toUpperCase()}</strong>
                <p>{new Date(assessment.date).toLocaleDateString('pt-BR')}</p>
              </div>

              <div className="assessment-results">
                <p>
                  <strong>{assessment.weight} kg</strong>
                </p>
                <small>
                  {assessment.results.bodyFat > 0
                    ? `${assessment.results.bodyFat.toFixed(1)}% de gordura`
                    : assessment.method === 'imc'
                      ? `IMC ${assessment.results.imc.toFixed(1)}`
                      : '—'}
                </small>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    padding: '6px 12px',
                    margin: 0,
                    fontSize: '12px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                  onClick={() => {
                    // Duplicar avaliação (irá para Nova Avaliação)
                    window.location.href = `/new-assessment/${assessment.clientId}`;
                  }}
                >
                  📋 Duplicar
                </button>
                <button
                  style={{
                    padding: '6px 12px',
                    margin: 0,
                    fontSize: '12px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    borderRadius: '6px',
                  }}
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir esta avaliação?')) {
                      // @ts-ignore
                      window.db.deleteAssessment(assessment.id);
                      window.location.reload();
                    }
                  }}
                >
                  🗑️ Excluir
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
  const isPositive = diff > 0;
  const isNegative = diff < 0;
  const isGood = invertColors ? isNegative : isPositive;
  const color = !diff ? 'var(--muted)' : isGood ? '#22c55e' : '#ef4444';
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700 }}>
        {current.toFixed(1)} {unit}
      </div>
      {diff !== 0 && (
        <div style={{ fontSize: '13px', color, fontWeight: 600, marginTop: '2px' }}>
          {arrow} {Math.abs(diff).toFixed(1)} {unit}
        </div>
      )}
    </div>
  );
}
