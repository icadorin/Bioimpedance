import type { AssessmentMethod } from '../types/assessment.types';
import type { PhysicResult, RecommendationResult } from '../types/result.types';
import { DEFAULT_METHOD_DETAILS } from '../constants/methodDetails';

type Result = PhysicResult & RecommendationResult;

interface ResultCardsProps {
  result: Result | null;
  method: AssessmentMethod;
}

export default function ResultCards({ result, method }: ResultCardsProps) {
  const methodDetails = result?.methodDetails ?? DEFAULT_METHOD_DETAILS[method];

  return (
    <div className="results">
      <div className="results-section">
        <h2>Composição corporal</h2>
        <div className="dashboard">
          <div className="card card--highlight">
            <h3>% Gordura</h3>
            <div className="value">{result?.bodyFat ? `${result.bodyFat.toFixed(1)}%` : '—'}</div>
            {(result?.bodyFat ?? 0) > 0 && <small>{result?.bodyFatLevel}</small>}
          </div>
          <div className="card">
            <h3>IMC</h3>
            <div className="value">{result?.imc?.toFixed(1) ?? '—'}</div>
          </div>
          <div className="card">
            <h3>FFMI</h3>
            <div className="value">{result?.ffmi ? result.ffmi.toFixed(1) : '—'}</div>
          </div>
          <div className="card">
            <h3>Massa magra</h3>
            <div className="value">
              {result?.leanMass ? (
                <>
                  {result.leanMass.toFixed(1)}
                  <span className="unit"> kg</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="card">
            <h3>Massa gorda</h3>
            <div className="value">
              {result?.fatMass ? (
                <>
                  {result.fatMass.toFixed(1)}
                  <span className="unit"> kg</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="results-section">
        <h2>Energia e nutrição</h2>
        <div className="dashboard">
          <div className="card card--highlight">
            <h3>Calorias alvo</h3>
            <div className="value">
              {result?.targetCalories ? (
                <>
                  {result.targetCalories.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  <span className="unit"> kcal</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="card">
            <h3>TMB</h3>
            <div className="value">
              {result?.bmr ? (
                <>
                  {result.bmr.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  <span className="unit"> kcal</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="card">
            <h3>TDEE</h3>
            <div className="value">
              {result?.tdee ? (
                <>
                  {result.tdee.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  <span className="unit"> kcal</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
          <div className="card">
            <h3>Proteína</h3>
            <div className="value">
              {result?.protein ? (
                <>
                  {result.protein.toFixed(0)}
                  <span className="unit"> g</span>
                </>
              ) : (
                '—'
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="results-section results-section--compact">
        <h2>{methodDetails.title}</h2>

        <div className="method-details">
          {methodDetails.items.map((item) => (
            <div className="method-detail" key={item.label}>
              <span className="method-detail__label">{item.label}</span>

              <strong>{item.value}</strong>

              {item.description && <p className="method-detail__description">{item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
