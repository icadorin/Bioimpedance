import { useNavigate } from 'react-router-dom';
import { usePDFGenerator } from '../../pdf/hooks/usePDFGenerator';
import { useClients } from '../hooks/useClients';
import PDFButton from '../../pdf/components/PDFButton';

interface Props {
  clientId: string;
}

export default function ClientActions({ clientId }: Props) {
  const navigate = useNavigate();
  const { generateAssessmentPDF, isGenerating } = usePDFGenerator();
  const { getClientById, getClientAssessments } = useClients();

  function handleProfile() {
    navigate(`/clients/${clientId}`);
  }

  function handleNewAssessment() {
    navigate(`/new-assessment/${clientId}`);
  }

  const handlePDF = async () => {
    const client = getClientById(clientId);
    const assessments = getClientAssessments(clientId);
    const lastAssessment = assessments[0];

    if (!client || !lastAssessment) {
      alert('Nenhuma avaliação encontrada para gerar PDF.');
      return;
    }

    try {
      await generateAssessmentPDF(lastAssessment, client);
    } catch (error) {
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
