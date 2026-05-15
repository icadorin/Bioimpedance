import { useState, useRef, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { useWhatsAppShare } from '../hooks/useWhatsAppShare';
import ComparisonPDF from '../templates/ComparisonPDF';
import { useClients } from '../../clients/hooks/useClients';
import { getAllClients } from '../../../service/database';

function getInitialZoom(width: number) {
  if (width < 768) return 95;
  if (width < 1024) return 75;
  return 60;
}

export default function PDFPreview() {
  const { getClientById, getClientAssessments } = useClients();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(800);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const clients = getAllClients();
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '1');
  const [template, setTemplate] = useState<'assessment' | 'railway' | 'comparison'>('railway');
  const { shareViaWhatsApp, isSharing } = useWhatsAppShare();
  const [zoom, setZoom] = useState(() => getInitialZoom(window.innerWidth));

  const client = getClientById(selectedClientId);
  const assessments = selectedClientId ? getClientAssessments(selectedClientId) : [];
  const assessment = assessments[0];
  const previousAssessment = assessments[1];
  const [pdfReady, setPdfReady] = useState(false);

  useEffect(() => {
    const updateLayout = () => {
      setWindowWidth(window.innerWidth);
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerHeight(rect.height);
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  useEffect(() => {
    setZoom(getInitialZoom(windowWidth));
  }, [windowWidth]);

  useEffect(() => {
    setPdfReady(false);
    const timer = setTimeout(() => setPdfReady(true), 500);
    return () => clearTimeout(timer);
  }, [selectedClientId]);

  const handleWhatsAppShare = async () => {
    if (!client || !assessment) return;
    const safeName = client.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');
    await shareViaWhatsApp(
      <ComparisonPDF client={client} assessment={assessment} />,
      `${safeName}_avaliacao.pdf`,
      client.name
    );
  };

  if (!client || !assessment) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0a0a0a',
          color: '#e4e4e7',
        }}
      >
        <h2>Sem dados para preview</h2>
        <p style={{ color: '#6b6b6b' }}>Crie um cliente e uma avaliação primeiro.</p>
        <button
          onClick={() => (window.location.href = '/clients')}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: '#6c47ff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Ir para Clientes
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        paddingTop: isMobile ? '56px' : isTablet ? '0px' : 0,
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: '#13111a',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, flexWrap: 'wrap' }}
        >
          {!isMobile && (
            <h2
              style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: '#e4e4e7',
                whiteSpace: 'nowrap',
              }}
            >
              Preview PDF
            </h2>
          )}

          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #2a2a2a',
              background: '#0a0a0a',
              color: '#e4e4e7',
              fontSize: '12px',
              flex: 1,
              maxWidth: isMobile ? '100%' : '180px',
            }}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {!isMobile && (
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #2a2a2a',
                background: '#0a0a0a',
                color: '#e4e4e7',
                fontSize: '12px',
                maxWidth: '180px',
              }}
            >
              <option value="railway">🎨 Railway (Dark)</option>
              <option value="assessment">📄 Padrão (Light)</option>
              {previousAssessment && <option value="comparison">📊 Comparação</option>}
            </select>
          )}

          {!isMobile && (
            <span style={{ color: '#6b6b6b', fontSize: '11px', whiteSpace: 'nowrap' }}>
              {assessment.method.toUpperCase()} •{' '}
              {new Date(assessment.date).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {/* Linha inferior (mobile) ou direita (desktop): zoom + botão */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isMobile ? 'space-between' : 'flex-end',
            gap: '6px',
          }}
        >
          {/* Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => setZoom(Math.max(25, zoom - 10))}
              style={{
                padding: '6px 12px',
                background: '#1a1825',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#e4e4e7',
                fontSize: '14px',
              }}
            >
              −
            </button>
            <span
              style={{ fontSize: '12px', color: '#6b6b6b', minWidth: '40px', textAlign: 'center' }}
            >
              {zoom}%
            </span>
            <button
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              style={{
                padding: '6px 12px',
                background: '#1a1825',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#e4e4e7',
                fontSize: '14px',
              }}
            >
              +
            </button>
          </div>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsAppShare}
            disabled={isSharing}
            style={{
              padding: isMobile ? '8px 16px' : '6px 14px',
              background: isSharing ? '#1a3a2a' : '#25D366',
              border: 'none',
              borderRadius: '6px',
              cursor: isSharing ? 'not-allowed' : 'pointer',
              color: 'white',
              fontSize: isMobile ? '13px' : '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: isSharing ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {isSharing ? 'Gerando...' : isMobile ? 'Enviar' : 'WhatsApp'}
          </button>
        </div>
      </div>

      {/* Área do PDF */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          background: '#525659',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: `${zoom}%`,
            minWidth: 0,
            maxWidth: '100%',
            margin: '0 auto',
            padding: isMobile ? '12px' : '20px',
            transition: 'width 0.2s ease',
          }}
        >
          <div style={{ position: 'relative' }}>
            {!pdfReady && (
              <div
                style={{
                  height: containerHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#3a3a3a',
                  borderRadius: '8px',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '3px solid rgba(255,255,255,0.15)',
                    borderTopColor: '#9f7dff',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span style={{ color: '#e4e4e7', fontSize: '13px', opacity: 0.7 }}>
                  Gerando PDF...
                </span>
              </div>
            )}

            <div
              style={{
                opacity: pdfReady ? 1 : 0,
                visibility: pdfReady ? 'visible' : 'hidden',
                transition: 'opacity 0.4s ease',
                width: '100%',
                height: containerHeight,
              }}
            >
              <PDFViewer
                width="100%"
                height={containerHeight * 0.85}
                showToolbar={false}
                style={{ border: 'none', borderRadius: '8px' }}
              >
                <ComparisonPDF client={client} assessment={assessment} />
              </PDFViewer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
