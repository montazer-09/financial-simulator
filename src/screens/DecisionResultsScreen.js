// src/screens/DecisionResultsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { formatCurrency, formatPercentage } from '../utils/financialCalculations';
import AdvancedChart from '../components/AdvancedChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DecisionResultsScreen = ({ route, navigation }) => {
  const { decision, impact, risk, recommendations } = route.params;
  const [selectedView, setSelectedView] = useState('summary');

  const getRiskColor = (level) => {
    switch (level) {
      case 'high':
        return COLORS.error;
      case 'medium':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.textLight;
    }
  };

  const getRiskLabel = (level) => {
    switch (level) {
      case 'high':
        return 'مرتفعة';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return level;
    }
  };

  const renderSummary = () => (
    <View>
      {/* Impact Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>التأثير المالي</Text>
        
        <View style={styles.impactCards}>
          <View style={[styles.impactCard, { borderColor: COLORS.accent }]}>
            <Text style={styles.impactLabel}>الرصيد النهائي</Text>
            <Text style={[styles.impactValue, { color: COLORS.accent }]}>
              {formatCurrency(impact.summary.finalBalance)}
            </Text>
            <Text style={styles.impactCurrency}>ريال</Text>
          </View>

          <View style={[styles.impactCard, { borderColor: COLORS.secondary }]}>
            <Text style={styles.impactLabel}>التغير الصافي</Text>
            <Text
              style={[
                styles.impactValue,
                {
                  color:
                    impact.summary.netChange >= 0 ? COLORS.success : COLORS.error,
                },
              ]}
            >
              {impact.summary.netChange >= 0 ? '+' : ''}
              {formatCurrency(impact.summary.netChange)}
            </Text>
            <Text style={styles.impactCurrency}>ريال</Text>
          </View>

          <View style={[styles.impactCard, { borderColor: COLORS.chartNeutral }]}>
            <Text style={styles.impactLabel}>التكلفة الإجمالية</Text>
            <Text style={[styles.impactValue, { color: COLORS.chartNeutral }]}>
              {formatCurrency(impact.summary.totalCost)}
            </Text>
            <Text style={styles.impactCurrency}>ريال</Text>
          </View>
        </View>
      </View>

      {/* Risk Analysis */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>تحليل المخاطر</Text>
        <View style={[styles.riskCard, { borderColor: getRiskColor(risk.level) }]}>
          <View style={styles.riskHeader}>
            <View style={styles.riskLevelContainer}>
              <Text style={styles.riskLevelLabel}>مستوى المخاطرة</Text>
              <Text style={[styles.riskLevelValue, { color: getRiskColor(risk.level) }]}>
                {getRiskLabel(risk.level)}
              </Text>
            </View>
            <View style={styles.riskScoreContainer}>
              <Text style={styles.riskScore}>{risk.score}</Text>
              <Text style={styles.riskScoreMax}>/10</Text>
            </View>
          </View>

          <View style={styles.riskFactors}>
            {risk.factors.map((factor, index) => (
              <View key={index} style={styles.riskFactor}>
                <Text style={styles.riskFactorName}>{factor.name}:</Text>
                <Text style={styles.riskFactorValue}>{factor.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التوصيات</Text>
          {recommendations.map((rec, index) => (
            <View
              key={index}
              style={[
                styles.recommendationCard,
                {
                  borderRightColor:
                    rec.type === 'success'
                      ? COLORS.success
                      : rec.type === 'warning'
                      ? COLORS.warning
                      : COLORS.secondary,
                },
              ]}
            >
              <Text style={styles.recommendationEmoji}>
                {rec.type === 'success'
                  ? '✅'
                  : rec.type === 'warning'
                  ? '⚠️'
                  : '💡'}
              </Text>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
                <Text style={styles.recommendationDescription}>{rec.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Monthly Breakdown Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>نظرة سريعة</Text>
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>الادخار الشهري المتوسط</Text>
            <Text
              style={[
                styles.quickStatValue,
                {
                  color:
                    impact.summary.avgMonthlySavings >= 0
                      ? COLORS.success
                      : COLORS.error,
                },
              ]}
            >
              {formatCurrency(impact.summary.avgMonthlySavings)} ريال
            </Text>
          </View>

          {impact.summary.totalInvestmentReturn > 0 && (
            <View style={styles.quickStat}>
              <Text style={styles.quickStatLabel}>العوائد الاستثمارية</Text>
              <Text style={[styles.quickStatValue, { color: COLORS.success }]}>
                {formatCurrency(impact.summary.totalInvestmentReturn)} ريال
              </Text>
            </View>
          )}

          <View style={styles.quickStat}>
            <Text style={styles.quickStatLabel}>إجمالي الدخل</Text>
            <Text style={styles.quickStatValue}>
              {formatCurrency(impact.summary.totalIncome)} ريال
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderChart = () => (
    <View style={styles.section}>
      <AdvancedChart
        data={impact}
        type="line"
        title="تطور رصيدك المالي"
        subtitle="محاكاة على مدى 5 سنوات"
      />
    </View>
  );

  const renderMonthlyDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>التفاصيل الشهرية</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.monthlyTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: 80 }]}>الشهر</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>الرصيد</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>الدخل</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>المصاريف</Text>
            <Text style={[styles.tableHeaderCell, { width: 100 }]}>نسبة الادخار</Text>
          </View>
          {impact.monthlyData.slice(0, 24).map((month) => (
            <View key={month.month} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: 80 }]}>{month.dateLabel}</Text>
              <Text style={[styles.tableCell, { width: 100 }]}>
                {formatCurrency(month.balance)}
              </Text>
              <Text style={[styles.tableCell, { width: 100 }]}>
                {formatCurrency(month.income)}
              </Text>
              <Text style={[styles.tableCell, { width: 100 }]}>
                {formatCurrency(month.expenses)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  { width: 100 },
                  month.savingsRate > 20
                    ? { color: COLORS.success }
                    : month.savingsRate < 10
                    ? { color: COLORS.error }
                    : {},
                ]}
              >
                {month.savingsRate.toFixed(1)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const views = [
    { id: 'summary', label: 'ملخص', icon: '📊' },
    { id: 'chart', label: 'رسم بياني', icon: '📈' },
    { id: 'details', label: 'تفاصيل', icon: '📋' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>نتائج المحاكاة</Text>
        <Text style={styles.decisionName}>{decision.name}</Text>
      </LinearGradient>

      {/* View Selector */}
      <View style={styles.viewSelector}>
        {views.map((view) => (
          <TouchableOpacity
            key={view.id}
            style={[
              styles.viewButton,
              selectedView === view.id && styles.viewButtonActive,
            ]}
            onPress={() => setSelectedView(view.id)}
          >
            <Text style={styles.viewEmoji}>{view.icon}</Text>
            <Text
              style={[
                styles.viewLabel,
                selectedView === view.id && styles.viewLabelActive,
              ]}
            >
              {view.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedView === 'summary' && renderSummary()}
        {selectedView === 'chart' && renderChart()}
        {selectedView === 'details' && renderMonthlyDetails()}
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.secondaryButtonText}>الرئيسية</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('NewDecision')}
        >
          <Text style={styles.primaryButtonText}>قرار جديد</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.xxl + 20,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textDark,
    opacity: 0.9,
    textAlign: 'center',
  },
  decisionName: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textDark,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    ...SHADOWS.small,
  },
  viewButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
  },
  viewButtonActive: {
    backgroundColor: COLORS.accent,
  },
  viewEmoji: {
    fontSize: 20,
    marginBottom: SPACING.xs / 2,
  },
  viewLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  viewLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  impactCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs / 2,
    alignItems: 'center',
    borderRightWidth: 4,
    ...SHADOWS.small,
  },
  impactLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  impactValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  impactCurrency: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginTop: SPACING.xs / 2,
  },
  riskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderRightWidth: 4,
    ...SHADOWS.small,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  riskLevelContainer: {
    flex: 1,
  },
  riskLevelLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
  },
  riskLevelValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  riskScoreContainer: {
    alignItems: 'center',
  },
  riskScore: {
    fontSize: TYPOGRAPHY.sizes.xxxl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.accent,
  },
  riskScoreMax: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
  },
  riskFactors: {
    gap: SPACING.sm,
  },
  riskFactor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskFactorName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
  },
  riskFactorValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  recommendationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    borderRightWidth: 4,
    ...SHADOWS.small,
  },
  recommendationEmoji: {
    fontSize: 24,
    marginLeft: SPACING.sm,
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  recommendationDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
  quickStats: {
    gap: SPACING.md,
  },
  quickStat: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  quickStatLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
  },
  quickStatValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  monthlyTable: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    ...SHADOWS.small,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.accent,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tableHeaderCell: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tableCell: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  secondaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
});

export default DecisionResultsScreen;
