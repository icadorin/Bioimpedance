import type { Assessment } from '../../../assessment/types';

interface Props {
  assessments: Assessment[];
}

export default function ClientAssessmentSection({ assessments }: Props) {
  return (
    <div className="client-assessment-section">
      <div className="client-assessment-section__header">
        <h2>Histórico de Avaliações</h2>
      </div>

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
                <small>{assessment.results.bodyFat.toFixed(1)}% de gordura</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
