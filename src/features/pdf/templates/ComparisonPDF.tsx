import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Assessment } from '../../assessment/types/assessment.types';
import type { Client } from '../../clients/types/client.types';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    color: '#1e293b',
  },
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
  },
  clientInfo: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '2px solid #6139a5',
  },
  comparisonRow: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 6,
  },
  comparisonLabel: {
    width: '30%',
    fontSize: 9,
    color: '#64748b',
    fontWeight: 'bold',
  },
  comparisonOldValue: {
    width: '25%',
    fontSize: 9,
    color: '#64748b',
    textAlign: 'center',
  },
  comparisonArrow: {
    width: '10%',
    fontSize: 12,
    textAlign: 'center',
    color: '#6139a5',
  },
  comparisonNewValue: {
    width: '25%',
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  comparisonDiff: {
    width: '10%',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  diffPositive: {
    color: '#22c55e',
  },
  diffNegative: {
    color: '#ef4444',
  },
  datesRow: {
    flexDirection: 'row',
    marginBottom: 16,
    fontSize: 9,
    color: '#64748b',
  },
  dateOld: {
    width: '45%',
    textAlign: 'center',
  },
  dateNew: {
    width: '45%',
    textAlign: 'center',
    marginLeft: '10%',
  },
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

interface ComparisonData {
  label: string;
  oldValue: string;
  newValue: string;
  diff: number;
  unit: string;
  invertColors?: boolean;
}

interface Props {
  client: Client;
  latest: Assessment;
  previous: Assessment;
}

export default function ComparisonPDF({ client, latest, previous }: Props) {
  const hasBodyData =
    latest.results.bodyFat > 0 &&
    previous.results.bodyFat > 0 &&
    latest.method !== 'imc' &&
    previous.method !== 'imc';

  const comparisons: ComparisonData[] = [
    {
      label: 'Peso',
      oldValue: `${previous.weight.toFixed(1)} kg`,
      newValue: `${latest.weight.toFixed(1)} kg`,
      diff: latest.weight - previous.weight,
      unit: 'kg',
    },
    ...(hasBodyData
      ? [
          {
            label: '% Gordura',
            oldValue: `${previous.results.bodyFat.toFixed(1)}%`,
            newValue: `${latest.results.bodyFat.toFixed(1)}%`,
            diff: latest.results.bodyFat - previous.results.bodyFat,
            unit: '%',
            invertColors: true,
          },
          {
            label: 'Massa Magra',
            oldValue: `${previous.results.leanMass.toFixed(1)} kg`,
            newValue: `${latest.results.leanMass.toFixed(1)} kg`,
            diff: latest.results.leanMass - previous.results.leanMass,
            unit: 'kg',
          },
          {
            label: 'Massa Gorda',
            oldValue: `${previous.results.fatMass.toFixed(1)} kg`,
            newValue: `${latest.results.fatMass.toFixed(1)} kg`,
            diff: latest.results.fatMass - previous.results.fatMass,
            unit: 'kg',
            invertColors: true,
          },
        ]
      : []),
    {
      label: 'IMC',
      oldValue: previous.results.imc.toFixed(1),
      newValue: latest.results.imc.toFixed(1),
      diff: latest.results.imc - previous.results.imc,
      unit: '',
    },
    {
      label: 'TMB',
      oldValue: `${previous.results.bmr.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`,
      newValue: `${latest.results.bmr.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} kcal`,
      diff: latest.results.bmr - previous.results.bmr,
      unit: 'kcal',
    },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Comparação de Avaliações</Text>
          <Text style={styles.headerSubtitle}>Evolução corporal do aluno</Text>
        </View>

        <View style={styles.clientSection}>
          <Text style={styles.clientName}>{client.name}</Text>
          <Text style={styles.clientInfo}>{client.goal ? `Objetivo: ${client.goal}` : ''}</Text>
        </View>

        <Text style={styles.sectionTitle}>Período Comparado</Text>
        <View style={styles.datesRow}>
          <Text style={styles.dateOld}>{new Date(previous.date).toLocaleDateString('pt-BR')}</Text>
          <Text style={styles.dateNew}>{new Date(latest.date).toLocaleDateString('pt-BR')}</Text>
        </View>

        <Text style={styles.sectionTitle}>Resultados</Text>
        {comparisons.map((comp, index) => (
          <View key={index} style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>{comp.label}</Text>
            <Text style={styles.comparisonOldValue}>{comp.oldValue}</Text>
            <Text style={styles.comparisonArrow}>→</Text>
            <Text style={styles.comparisonNewValue}>{comp.newValue}</Text>
            <Text
              style={[
                styles.comparisonDiff,
                comp.diff > 0
                  ? comp.invertColors
                    ? styles.diffNegative
                    : styles.diffPositive
                  : comp.diff < 0
                    ? comp.invertColors
                      ? styles.diffPositive
                      : styles.diffNegative
                    : {},
              ]}
            >
              {comp.diff > 0 ? '+' : ''}
              {comp.diff.toFixed(1)} {comp.unit}
            </Text>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            BioImpedance App - Comparação de Avaliações | Gerado em{' '}
            {new Date().toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
