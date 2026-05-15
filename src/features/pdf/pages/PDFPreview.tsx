import { useState, useRef, useEffect } from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import ComparisonPDF from '../templates/ComparisonPDF';
import { useClients } from '../../clients/hooks/useClients';
import { getAllClients } from '../../../service/database';

export default function PDFPreview() {
  const { getClientById, getClientAssessments } = useClients();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(800);

  const clients = getAllClients();
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '1');
  const [template, setTemplate] = useState<'assessment' | 'railway' | 'comparison'>('railway');
  const [zoom, setZoom] = useState(55);

  const client = getClientById(selectedClientId);
  const assessments = selectedClientId ? getClientAssessments(selectedClientId) : [];
  const assessment = assessments[0];
  const previousAssessment = assessments[1];

  // Atualiza a altura do container quando a janela redimensiona
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // Altura disponível para o scroll do PDF
        setContainerHeight(rect.height);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

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
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0a0a0a',
      }}
    >
      {/* Toolbar estilo Railway */}
      <div
        style={{
          padding: '12px 24px',
          background: '#13111a',
          borderBottom: '1px solid #2a2a2a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minHeight: '52px',
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#e4e4e7' }}>
          Preview PDF
        </h2>

        {/* Seletor de cliente */}
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
            maxWidth: '200px',
          }}
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Seletor de template */}
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
            maxWidth: '200px',
          }}
        >
          <option value="railway">🎨 Railway (Dark)</option>
          <option value="assessment">📄 Padrão (Light)</option>
          {previousAssessment && <option value="comparison">📊 Comparação</option>}
        </select>

        <span style={{ color: '#6b6b6b', fontSize: '11px' }}>
          {assessment.method.toUpperCase()} •{' '}
          {new Date(assessment.date).toLocaleDateString('pt-BR')}
        </span>

        <div style={{ flex: 1 }} />

        {/* Zoom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setZoom(Math.max(25, zoom - 10))}
            style={{
              padding: '4px 10px',
              background: '#1a1825',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e4e4e7',
              fontSize: '13px',
            }}
          >
            −
          </button>
          <span
            style={{ fontSize: '11px', color: '#6b6b6b', minWidth: '36px', textAlign: 'center' }}
          >
            {zoom}%
          </span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            style={{
              padding: '4px 10px',
              background: '#1a1825',
              border: '1px solid #2a2a2a',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#e4e4e7',
              fontSize: '13px',
            }}
          >
            +
          </button>
        </div>
      </div>

      {/* Área do PDF com scroll */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          background: '#525659',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: `${zoom}%`,
            minWidth: '600px',
            maxWidth: '100%',
            margin: '0 auto',
            padding: '20px 0',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            transition: 'width 0.2s ease',
          }}
        >
          <PDFViewer
            width="100%"
            height={containerHeight}
            showToolbar={false}
            style={{
              border: 'none',
              borderRadius: '8px',
            }}
          >
            <ComparisonPDF client={client} assessment={assessment} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
