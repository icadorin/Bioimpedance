import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
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

  const generateComparisonPDF = useCallback(
    async (client: Client, assessment: Assessment, previousAssessment: Assessment) => {
      setIsGenerating(true);
      setError(null);

      try {
        const blob = await pdf(<ComparisonPDF client={client} assessment={assessment} />).toBlob();
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
    generateComparisonPDF,
    isGenerating,
    error,
  };
}
