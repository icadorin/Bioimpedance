import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { Assessment } from '../../assessment/types/assessment.types';
import type { Client } from '../../clients/types/client.types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },

  // ── Header ─────────────────────────────────
  header: {
    backgroundColor: '#6139a5',
    padding: 20,
    marginBottom: 20,
    marginLeft: -30,
    marginRight: -30,
    marginTop: -30,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#c4b5fd',
    fontSize: 10,
    marginTop: 4,
  },

  // ── Client Info ────────────────────────────
  clientSection: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    border: '1px solid #e2e8f0',
  },
  clientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  clientInfo: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
  },
  assessmentDate: {
    fontSize: 10,
    color: '#1e293b',
    marginTop: 6,
    fontWeight: 'bold',
  },

  // ── Section Titles ────────────────────────
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '2px solid #6139a5',
  },

  // ── Metrics Grid ──────────────────────────
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  metricCard: {
    width: '31%',
    padding: 10,
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
    marginBottom: 8,
  },
  metricCardHighlight: {
    width: '31%',
    padding: 10,
    backgroundColor: '#6139a5',
    borderRadius: 6,
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 7,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricLabelHighlight: {
    fontSize: 7,
    color: '#c4b5fd',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  metricValueHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },

  // ── Method Details ────────────────────────
  methodText: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },

  // ── Classification ────────────────────────
  classificationLabel: {
    fontSize: 9,
    color: '#64748b',
  },
  classificationValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#6139a5',
    marginLeft: 4,
  },

  // ── Observations ──────────────────────────
  observationsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 12,
    marginBottom: 4,
  },
  observationsText: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.4,
  },

  // ── Footer ────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    borderTop: '1px solid #e2e8f0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: '#64748b',
    textAlign: 'center',
  },
});

interface Props {
  assessment: Assessment;
  client: Client;
}

export default function AssessmentPDF({ assessment, client }: Props) {
  const methodNames = {
    navy: 'US Navy (Circunferências)',
    bioimpedance: 'Bioimpedância Elétrica',
    skinfold: 'Dobras Cutâneas',
    imc: 'IMC Estimado',
  };

  const isImcOnly = assessment.method === 'imc';

  const metrics = [
    { label: 'Peso', value: `${assessment.weight.toFixed(1)} kg` },
    {
      label: '% Gordura',
      value: isImcOnly ? '—' : `${assessment.results.bodyFat.toFixed(1)}%`,
      highlight: true,
    },
    {
      label: 'Massa Magra',
      value: isImcOnly ? '—' : `${assessment.results.leanMass.toFixed(1)} kg`,
    },
    {
      label: 'Massa Gorda',
      value: isImcOnly ? '—' : `${assessment.results.fatMass.toFixed(1)} kg`,
    },
    { label: 'IMC', value: assessment.results.imc.toFixed(1) },
    {
      label: 'FFMI',
      value: isImcOnly || !assessment.results.ffmi ? '—' : assessment.results.ffmi.toFixed(1),
    },
  ];

  const metabolismMetrics = [
    {
      label: 'TMB',
      value: `${assessment.results.bmr.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`,
    },
    {
      label: 'TDEE',
      value: `${assessment.results.tdee.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`,
    },
    {
      label: 'Calorias Alvo',
      value: assessment.results.targetCalories
        ? `${assessment.results.targetCalories.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`
        : '—',
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Avaliação Física</Text>
          <Text style={styles.headerSubtitle}>Relatório profissional de composição corporal</Text>
        </View>

        {/* Client Info */}
        <View style={styles.clientSection}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientInfo}>
            {[
              client.email ? `Email: ${client.email}` : '',
              client.phone ? `Tel: ${client.phone}` : '',
              client.goal ? `Objetivo: ${client.goal}` : '',
            ]
              .filter(Boolean)
              .join(' | ')}
          </Text>
          <Text style={styles.assessmentDate}>
            Data: {new Date(assessment.date).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        {/* Method */}
        <Text style={styles.sectionTitle}>Método Utilizado</Text>
        <Text style={styles.methodText}>{methodNames[assessment.method]}</Text>

        {/* Body Composition */}
        <Text style={styles.sectionTitle}>Composição Corporal</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View
              key={index}
              style={metric.highlight ? styles.metricCardHighlight : styles.metricCard}
            >
              <Text style={metric.highlight ? styles.metricLabelHighlight : styles.metricLabel}>
                {metric.label}
              </Text>
              <Text style={metric.highlight ? styles.metricValueHighlight : styles.metricValue}>
                {metric.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Metabolism */}
        <Text style={styles.sectionTitle}>Metabolismo e Nutrição</Text>
        <View style={styles.metricsGrid}>
          {metabolismMetrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          ))}
        </View>

        {/* Classification */}
        {!isImcOnly &&
          assessment.results.bodyFatLevel &&
          assessment.results.bodyFatLevel !== '—' && (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.sectionTitle}>Classificação</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.classificationLabel}>Nível:</Text>
                <Text style={styles.classificationValue}>{assessment.results.bodyFatLevel}</Text>
              </View>
            </View>
          )}

        {/* Observations */}
        {assessment.observations && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={styles.observationsText}>{assessment.observations}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            BioImpedance App - Avaliação Profissional | Gerado em{' '}
            {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
