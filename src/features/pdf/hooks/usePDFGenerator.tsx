import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import AssessmentPDF from '../templates/AssessmentPDF';
import ComparisonPDF from '../templates/ComparisonPDF';
import type { Assessment } from '../../assessment/types/assessment.types';
import type { Client } from '../../clients/types/client.types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function usePDFGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAssessmentPDF = useCallback(async (assessment: Assessment, client: Client) => {
    setIsGenerating(true);
    setError(null);

    try {
      const blob = await pdf(<AssessmentPDF assessment={assessment} client={client} />).toBlob();
      const filename = `${client.name.replace(/\s+/g, '_')}_avaliacao_${assessment.date}.pdf`;
      downloadBlob(blob, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar PDF';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateComparisonPDF = useCallback(
    async (client: Client, latest: Assessment, previous: Assessment) => {
      setIsGenerating(true);
      setError(null);

      try {
        const blob = await pdf(
          <ComparisonPDF client={client} latest={latest} previous={previous} />
        ).toBlob();
        const filename = `${client.name.replace(/\s+/g, '_')}_comparacao.pdf`;
        downloadBlob(blob, filename);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao gerar PDF';
        setError(message);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    generateAssessmentPDF,
    generateComparisonPDF,
    isGenerating,
    error,
  };
}
