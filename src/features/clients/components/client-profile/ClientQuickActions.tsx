import { useNavigate } from 'react-router-dom';
import { usePDFGenerator } from '../../../pdf/hooks/usePDFGenerator';
import { useClients } from '../../hooks/useClients';
import PDFButton from '../../../pdf/components/PDFButton';

interface Props {
  clientId: string;
}

export default function ClientQuickActions({ clientId }: Props) {
  const navigate = useNavigate();
  const { generateComparisonPDF, isGenerating } = usePDFGenerator();
  const { getClientById, getClientAssessments } = useClients();

  const handleNewAssessment = () => {
    navigate(`/new-assessment/${clientId}`);
  };

  const handleGeneratePDF = async () => {
    const client = getClientById(clientId);
    const assessments = getClientAssessments(clientId);
    const lastAssessment = assessments[0];
    const previousAssessment = assessments[1];

    if (!client || !lastAssessment) {
      alert('Cliente ou avaliação não encontrada.');
      return;
    }

    if (!previousAssessment) {
      alert('É necessário ter pelo menos 2 avaliações para gerar uma comparação.');
      return;
    }

    try {
      await generateComparisonPDF(client, lastAssessment, previousAssessment);
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
        label="Gerar PDF Comparativo"
        variant="secondary"
        size="md"
      />
    </div>
  );
}
