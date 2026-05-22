import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import { usePDFGenerator } from '../../pdf/hooks/usePDFGenerator';

interface Props {
  clientId: string;
}

export default function ClientActions({ clientId }: Props) {
  const navigate = useNavigate();
  const { generateComparisonPDF, isGenerating } = usePDFGenerator();

  function handleProfile() {
    navigate(`/clients/${clientId}`);
  }

  function handleNewAssessment() {
    navigate(`/new-assessment/${clientId}`);
  }

  const handlePDF = async () => {
    try {
      const [client, assessments] = await Promise.all([
        api.getClientById(clientId),
        api.getClientAssessments(clientId),
      ]);
      const lastAssessment = assessments[0];
      const previousAssessment = assessments[1];

      if (!lastAssessment) {
        alert('Nenhuma avaliação encontrada para gerar PDF.');
        return;
      }

      if (!previousAssessment) {
        alert('São necessárias pelo menos 2 avaliações para gerar uma comparação.');
        return;
      }

      await generateComparisonPDF(client, lastAssessment, previousAssessment);
    } catch (error) {
      console.error(error);
      alert('Erro ao gerar PDF.');
    }
  };

  return (
    <div className="client-actions">
      <button onClick={handleProfile}>Perfil</button>
      <button onClick={handleNewAssessment}>Avaliar</button>
      <button onClick={handlePDF} disabled={isGenerating}>
        {isGenerating ? '...' : 'PDF'}
      </button>
    </div>
  );
}
