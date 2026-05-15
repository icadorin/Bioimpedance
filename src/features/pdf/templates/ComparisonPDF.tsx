import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Assessment } from '../../assessment/types/assessment.types';
import type { Client } from '../../clients/types/client.types';

// ─────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────

const palette = {
  purple1: '#120f1b',
  purple2: '#191525',
  purple3: '#2a1e42',
  purple4: '#362459',
  purple5: '#402c66',
  purple6: '#4b3774',
  purple7: '#5a4589',
  purple8: '#7156aa',
  purple9: '#553f83',
  purple10: '#45326c',
  purple11: '#bfa5ff',
  purple12: '#e4dcfd',
};

const theme = {
  // ─────────────────────────
  // BRAND
  // ─────────────────────────

  primary: palette.purple8,

  separator: palette.purple7,

  // ─────────────────────────
  // ACCENT
  // ─────────────────────────

  accentBg: '#f6f3ff',
  accentBgHover: '#efe9ff',

  accentBgDark: palette.purple2,
  accentBgStrong: palette.purple4,

  accentText: palette.purple8,
  accentTextSoft: palette.purple11,
  accentTextLight: palette.purple12,
  accentTextDark: palette.purple5,

  // ─────────────────────────
  // BASE
  // ─────────────────────────

  bg: '#fcfcfd',
  surface: '#ffffff',

  // ─────────────────────────
  // TEXT
  // ─────────────────────────

  text: '#16131d',
  textSoft: '#625f6b',
  textMuted: '#8d8899',

  // ─────────────────────────
  // BORDER
  // ─────────────────────────

  border: '#ece8f5',

  // ─────────────────────────
  // STATUS
  // ─────────────────────────

  success: '#16A34A',
  danger: '#DC2626',
  warning: '#F59E0B',
};

// ─────────────────────────────────────────────
// ESTILOS BASE (REUTILIZÁVEIS)
// ─────────────────────────────────────────────

const cardAccent = {
  backgroundColor: theme.accentBg,
  borderRadius: 3,
};

const accentLeftBorder = {
  borderLeftWidth: 3,
  borderLeftColor: theme.accentText,
  borderTopWidth: 0,
  borderRightWidth: 0,
  borderBottomWidth: 0,
};

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: theme.bg,
    padding: 0,
    fontFamily: 'Helvetica',
  },

  // ─── TOP BAR ───
  topBar: {
    backgroundColor: theme.accentBgDark,
    paddingVertical: 12,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderBottomWidth: 1,
    borderBottomColor: theme.separator,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  topBarBadge: {
    backgroundColor: palette.purple6,
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 2,
    letterSpacing: 0.8,
  },
  topBarRight: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: 'bold',
  },

  // ─── CONTENT ───
  content: {
    paddingHorizontal: 32,
    paddingTop: 28,
    paddingBottom: 24,
  },

  // ─── CLIENT HEADER ───
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  clientName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 2,
  },
  clientGoal: {
    fontSize: 9,
    color: theme.textSoft,
    marginTop: 2,
  },
  dateBox: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 7,
    color: theme.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.text,
  },

  // ─── DIVIDER ───
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  dividerFade: {
    flex: 1,
    height: 1,
    backgroundColor: palette.purple7,
    opacity: 0.08,
  },

  dividerCenter: {
    flex: 4,
    height: 2,
    backgroundColor: palette.purple7,
    borderRadius: 999,
  },

  // ─── HERO STATS ───
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    gap: 12,
  },
  heroCard: {
    ...cardAccent,
    ...accentLeftBorder,
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  heroCardCenter: {
    flex: 1,
    backgroundColor: palette.purple4,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 3,
  },
  heroLabel: {
    fontSize: 7,
    color: theme.accentText,
    letterSpacing: 1.2,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  heroLabelLight: {
    fontSize: 7,
    color: theme.accentTextSoft,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.accentTextDark,
  },
  heroValueLight: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroUnit: {
    fontSize: 10,
    color: theme.accentText,
    fontWeight: 'normal',
  },
  heroUnitLight: {
    fontSize: 10,
    color: theme.accentTextLight,
    fontWeight: 'normal',
  },

  // ─── SECTION TITLE ───
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  sectionDot: {
    width: 6,
    height: 6,
    backgroundColor: theme.accentText,
    marginRight: 8,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  // ─── METRICS GRID ───
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  metricItem: {
    ...cardAccent,
    width: '31%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  metricItemHighlight: {
    backgroundColor: theme.accentBgHover,
    width: '31%',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 3,
  },
  metricLabel: {
    fontSize: 7,
    color: theme.accentText,
    letterSpacing: 0.8,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  metricLabelAccent: {
    fontSize: 7,
    color: theme.accentTextDark,
    letterSpacing: 0.8,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.text,
  },
  metricValueAccent: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.accentTextDark,
  },
  metricUnit: {
    fontSize: 8,
    color: theme.textSoft,
  },

  // ─── BOTTOM CARDS ───
  bottomCard: {
    ...cardAccent,
    ...accentLeftBorder,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  bottomCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomCardDot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    marginRight: 12,
  },
  bottomCardInfo: {
    flex: 1,
  },
  bottomCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.text,
  },
  bottomCardSub: {
    fontSize: 8,
    color: theme.textSoft,
    marginTop: 2,
  },
  bottomCardText: {
    fontSize: 8.5,
    color: theme.textSoft,
    lineHeight: 1.6,
    marginTop: 4,
  },

  // ─── FOOTER ───
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.accentBgDark,
    paddingVertical: 14,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    separator: palette.purple6,
  },
  footerText: {
    fontSize: 8,
    color: theme.accentTextSoft,
    letterSpacing: 0.5,
    fontWeight: 'bold',
  },
  footerRight: {
    fontSize: 8,
    color: theme.accentTextLight,
    letterSpacing: 0.5,
  },
});

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

interface Props {
  assessment: Assessment;
  client: Client;
}

export default function AssessmentPDF({ assessment, client }: Props) {
  const isImcOnly = assessment.method === 'imc';
  const date = new Date(assessment.date);
  const now = new Date();

  const methodNames: Record<string, string> = {
    navy: 'US Navy',
    bioimpedance: 'Bioimpedância',
    skinfold: 'Dobras',
    imc: 'IMC',
  };

  const formatNumber = (num: number) => num.toLocaleString('pt-BR', { maximumFractionDigits: 0 });

  const bodyFatColor =
    assessment.results.bodyFatLevel === 'Normal' || assessment.results.bodyFatLevel === 'Atleta'
      ? theme.success
      : assessment.results.bodyFatLevel === 'Alto' ||
          assessment.results.bodyFatLevel === 'Muito alto'
        ? theme.danger
        : theme.warning;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.topBarLeft}>
            <Text style={styles.logoText}>Bio</Text>
            <Text style={styles.topBarBadge}>{methodNames[assessment.method]}</Text>
          </View>
          <Text style={styles.topBarRight}>RELATÓRIO DE AVALIAÇÃO</Text>
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          {/* CABEÇALHO DO CLIENTE */}
          <View style={styles.clientRow}>
            <View>
              <Text style={styles.clientName}>{client.name}</Text>
              <Text style={styles.clientGoal}>{client.goal || 'Sem objetivo definido'}</Text>
            </View>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>DATA DA AVALIAÇÃO</Text>
              <Text style={styles.dateValue}>
                {date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* DIVISOR */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerFade} />
            <View style={styles.dividerCenter} />
            <View style={styles.dividerFade} />
          </View>

          {/* CARDS PRINCIPAIS */}
          <View style={styles.heroRow}>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>PESO</Text>
              <Text style={styles.heroValue}>
                {assessment.weight.toFixed(1)}
                <Text style={styles.heroUnit}> kg</Text>
              </Text>
            </View>
            <View style={styles.heroCardCenter}>
              <Text style={styles.heroLabelLight}>% GORDURA</Text>
              <Text style={styles.heroValueLight}>
                {isImcOnly ? '—' : assessment.results.bodyFat.toFixed(1)}
                {!isImcOnly && <Text style={styles.heroUnitLight}> %</Text>}
              </Text>
            </View>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>IMC</Text>
              <Text style={styles.heroValue}>{assessment.results.imc.toFixed(1)}</Text>
            </View>
          </View>

          {/* COMPOSIÇÃO CORPORAL */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Composição Corporal</Text>
          </View>

          <View style={styles.metricsRow}>
            {[
              { label: 'Peso', value: assessment.weight.toFixed(1), unit: 'kg', highlight: false },
              {
                label: '% Gordura',
                value: isImcOnly ? '—' : assessment.results.bodyFat.toFixed(1),
                unit: '%',
                highlight: true,
              },
              {
                label: 'IMC',
                value: assessment.results.imc.toFixed(1),
                unit: '',
                highlight: false,
              },
              {
                label: 'Massa Magra',
                value: isImcOnly ? '—' : assessment.results.leanMass.toFixed(1),
                unit: 'kg',
                highlight: false,
              },
              {
                label: 'Massa Gorda',
                value: isImcOnly ? '—' : assessment.results.fatMass.toFixed(1),
                unit: 'kg',
                highlight: false,
              },
              {
                label: 'FFMI',
                value:
                  isImcOnly || !assessment.results.ffmi ? '—' : assessment.results.ffmi.toFixed(1),
                unit: '',
                highlight: false,
              },
            ].map((m, i) => (
              <View key={i} style={m.highlight ? styles.metricItemHighlight : styles.metricItem}>
                <Text style={m.highlight ? styles.metricLabelAccent : styles.metricLabel}>
                  {m.label}
                </Text>
                <Text style={m.highlight ? styles.metricValueAccent : styles.metricValue}>
                  {m.value}
                  {m.unit ? <Text style={styles.metricUnit}> {m.unit}</Text> : null}
                </Text>
              </View>
            ))}
          </View>

          {/* METABOLISMO ENERGÉTICO */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionTitle}>Metabolismo Energético</Text>
          </View>

          <View style={styles.metricsRow}>
            {[
              { label: 'TMB', value: formatNumber(assessment.results.bmr), unit: 'kcal' },
              { label: 'TDEE', value: formatNumber(assessment.results.tdee), unit: 'kcal' },
              {
                label: 'Meta',
                value: assessment.results.targetCalories
                  ? formatNumber(assessment.results.targetCalories)
                  : '—',
                unit: 'kcal',
              },
            ].map((m, i) => (
              <View key={i} style={styles.metricItem}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricValue}>
                  {m.value}
                  <Text style={styles.metricUnit}> {m.unit}</Text>
                </Text>
              </View>
            ))}
          </View>

          {/* CLASSIFICAÇÃO */}
          {!isImcOnly &&
            assessment.results.bodyFatLevel &&
            assessment.results.bodyFatLevel !== '—' && (
              <View style={[styles.bottomCard, { borderLeftColor: bodyFatColor }]}>
                <View style={styles.bottomCardRow}>
                  <View style={[styles.bottomCardDot, { backgroundColor: bodyFatColor }]} />
                  <View style={styles.bottomCardInfo}>
                    <Text style={styles.bottomCardTitle}>{assessment.results.bodyFatLevel}</Text>
                    <Text style={styles.bottomCardSub}>
                      Percentual de gordura: {assessment.results.bodyFat.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            )}

          {/* OBSERVAÇÕES */}
          {/* OBSERVAÇÕES */}
          {assessment.observations && (
            <View style={styles.bottomCard}>
              <View style={styles.bottomCardRow}>
                <View style={[styles.bottomCardDot, { backgroundColor: theme.accentText }]} />

                <View style={styles.bottomCardInfo}>
                  <Text style={styles.bottomCardTitle}>Observações</Text>

                  <Text style={styles.bottomCardText}>{assessment.observations.slice(0, 280)}</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* RODAPÉ */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bio App • Avaliação Física</Text>
          <Text style={styles.footerRight}>
            Gerado em {now.toLocaleDateString('pt-BR')} às{' '}
            {now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
