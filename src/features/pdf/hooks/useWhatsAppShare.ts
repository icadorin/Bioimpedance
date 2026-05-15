import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import type { ReactElement } from 'react';

export function useWhatsAppShare() {
  const [isSharing, setIsSharing] = useState(false);

  const shareViaWhatsApp = useCallback(
    async (pdfDocument: ReactElement<DocumentProps>, filename: string, clientName: string) => {
      setIsSharing(true);
      try {
        const blob = await pdf(pdfDocument).toBlob();
        const file = new File([blob], filename, { type: 'application/pdf' });

        const canShare = !!navigator.share && !!navigator.canShare?.({ files: [file] });

        if (canShare) {
          await navigator.share({
            title: `Avaliação - ${clientName}`,
            text: `Segue sua avaliação física, ${clientName}!`,
            files: [file],
          });
        } else {
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);

          const waUrl = `https://wa.me/?text=${encodeURIComponent(
            `Olá ${clientName}, segue sua avaliação física em anexo!`
          )}`;
          window.open(waUrl, '_blank');
        }
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  return { shareViaWhatsApp, isSharing };
}
