import { useNavigate } from 'react-router-dom';
import { api } from '../../../../services/api';
import PDFButton from '../../../pdf/components/PDFButton';
import { usePDFGenerator } from '../../../pdf/hooks/usePDFGenerator';

interface Props {
  clientId: string;
}

export default function ClientQuickActions({ clientId }: Props) {
  const navigate = useNavigate();
  const { generateComparisonPDF, isGenerating } = usePDFGenerator();

  const handleNewAssessment = () => {
    navigate(`/new-assessment/${clientId}`);
  };

  const handleGeneratePDF = async () => {
    try {
      const [client, assessments] = await Promise.all([
        api.getClientById(clientId),
        api.getClientAssessments(clientId),
      ]);
      const lastAssessment = assessments[0];
      const previousAssessment = assessments[1];

      if (!lastAssessment) {
        alert('Cliente ou avaliação não encontrada.');
        return;
      }

      if (!previousAssessment) {
        alert('É necessário ter pelo menos 2 avaliações para gerar uma comparação.');
        return;
      }

      await generateComparisonPDF(client, lastAssessment, previousAssessment);
    } catch (error) {
      console.error(error);
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
