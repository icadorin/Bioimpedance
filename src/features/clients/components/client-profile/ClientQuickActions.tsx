import { useNavigate } from 'react-router-dom';
import { usePDFGenerator } from '../../../pdf/hooks/usePDFGenerator';
import { useClients } from '../../hooks/useClients';
import PDFButton from '../../../pdf/components/PDFButton';

interface Props {
  clientId: string;
}

export default function ClientQuickActions({ clientId }: Props) {
  const navigate = useNavigate();
  const { generateAssessmentPDF, isGenerating } = usePDFGenerator();
  const { getClientById, getClientAssessments } = useClients();

  const handleNewAssessment = () => {
    navigate(`/new-assessment/${clientId}`);
  };

  const handleGeneratePDF = async () => {
    const client = getClientById(clientId);
    const assessments = getClientAssessments(clientId);
    const lastAssessment = assessments[0];

    if (!client || !lastAssessment) {
      alert('Cliente ou avaliação não encontrada.');
      return;
    }

    try {
      await generateAssessmentPDF(lastAssessment, client);
    } catch (error) {
      alert('Erro ao gerar PDF. Tente novamente.');
    }
  };

  return (
    <div className="client-quick-actions">
      <button onClick={handleNewAssessment}>+ Nova Avaliação</button>
      <PDFButton
        onClick={handleGeneratePDF}
        isLoading={isGenerating}
        label="Gerar PDF da Última Avaliação"
        variant="secondary"
        size="md"
      />
    </div>
  );
}
