// src/screens/CompareScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { getDecisions, getUserProfile } from '../utils/storage';
import { compareDecisions, formatCurrency } from '../utils/financialCalculations';
import AdvancedChart from '../components/AdvancedChart';

const CompareScreen = ({ navigation }) => {
  const [decisions, setDecisions] = useState([]);
  const [selectedDecision1, setSelectedDecision1] = useState(null);
  const [selectedDecision2, setSelectedDecision2] = useState(null);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    const savedDecisions = await getDecisions();
    setDecisions(savedDecisions);
  };

  const handleCompare = async () => {
    if (!selectedDecision1 || !selectedDecision2) {
      Alert.alert('تنبيه', 'الرجاء اختيار قرارين للمقارنة');
      return;
    }

    if (selectedDecision1.id === selectedDecision2.id) {
      Alert.alert('تنبيه', 'الرجاء اختيار قرارين مختلفين');
      return;
    }

    const userProfile = await getUserProfile();
    if (!userProfile) {
      Alert.alert('خطأ', 'الرجاء إعداد ملفك المالي أولاً');
      return;
    }

    const result = compareDecisions(selectedDecision1, selectedDecision2, userProfile);
    setComparison(result);
  };

  const getDecisionEmoji = (type) => {
    const emojis = {
      car: '🚗',
      investment: '📈',
      travel: '✈️',
      property: '🏠',
      education: '🎓',
      business: '💼',
    };
    return emojis[type] || '💰';
  };

  const renderDecisionSelector = (selected, onSelect, label) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>{label}</Text>
      {selected ? (
        <TouchableOpacity
          style={styles.selectedDecision}
          onPress={() => onSelect(null)}
        >
          <Text style={styles.selectedEmoji}>{getDecisionEmoji(selected.type)}</Text>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedName}>{selected.name}</Text>
            <Text style={styles.selectedType}>
              {selected.data.price || selected.data.totalCost
                ? formatCurrency(selected.data.price || selected.data.totalCost) + ' ريال'
                : ''}
            </Text>
          </View>
          <Text style={styles.changeButton}>تغيير</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.decisionsScroll}
        >
          {decisions.map((decision) => (
            <TouchableOpacity
              key={decision.id}
              style={styles.decisionOption}
              onPress={() => onSelect(decision)}
            >
              <Text style={styles.decisionEmoji}>{getDecisionEmoji(decision.type)}</Text>
              <Text style={styles.decisionName} numberOfLines={2}>
                {decision.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderComparison = () => {
    if (!comparison) return null;

    const { decision1, decision2, difference } = comparison;

    return (
      <View style={styles.comparisonContainer}>
        {/* Summary Comparison */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>المقارنة المالية</Text>

          <View style={styles.comparisonCards}>
            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonCardTitle}>الرصيد النهائي</Text>
              <View style={styles.comparisonValues}>
                <View style={styles.comparisonValue}>
                  <Text style={styles.comparisonLabel}>القرار 1</Text>
                  <Text style={styles.comparisonAmount}>
                    {formatCurrency(decision1.summary.finalBalance)}
                  </Text>
                </View>
                <View style={styles.comparisonValue}>
                  <Text style={styles.comparisonLabel}>القرار 2</Text>
                  <Text style={styles.comparisonAmount}>
                    {formatCurrency(decision2.summary.finalBalance)}
                  </Text>
                </View>
              </View>
              <View style={styles.comparisonDifference}>
                <Text style={styles.differenceLabel}>الفرق:</Text>
                <Text
                  style={[
                    styles.differenceValue,
                    { color: difference.finalBalance >= 0 ? COLORS.success : COLORS.error },
                  ]}
                >
                  {difference.finalBalance >= 0 ? '+' : ''}
                  {formatCurrency(difference.finalBalance)}
                </Text>
              </View>
            </View>

            <View style={styles.comparisonCard}>
              <Text style={styles.comparisonCardTitle}>التكلفة الإجمالية</Text>
              <View style={styles.comparisonValues}>
                <View style={styles.comparisonValue}>
                  <Text style={styles.comparisonLabel}>القرار 1</Text>
                  <Text style={styles.comparisonAmount}>
                    {formatCurrency(decision1.summary.totalCost)}
                  </Text>
                </View>
                <View style={styles.comparisonValue}>
                  <Text style={styles.comparisonLabel}>القرار 2</Text>
                  <Text style={styles.comparisonAmount}>
                    {formatCurrency(decision2.summary.totalCost)}
                  </Text>
                </View>
              </View>
              <View style={styles.comparisonDifference}>
                <Text style={styles.differenceLabel}>الفرق:</Text>
                <Text
                  style={[
                    styles.differenceValue,
                    { color: difference.totalCost <= 0 ? COLORS.success : COLORS.error },
                  ]}
                >
                  {difference.totalCost >= 0 ? '+' : ''}
                  {formatCurrency(difference.totalCost)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chart Comparison */}
        <View style={styles.section}>
          <AdvancedChart
            data={{
              monthlyData: decision1.monthlyData,
              comparisonData: decision2.monthlyData,
            }}
            type="line"
            title="مقارنة التطور المالي"
            subtitle="الخط الذهبي: القرار 1 | الخط الأزرق: القرار 2"
            showComparison={true}
          />
        </View>

        {/* Recommendation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>التوصية</Text>
          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationEmoji}>
              {difference.finalBalance >= 0 ? '✅' : '⚠️'}
            </Text>
            <Text style={styles.recommendationText}>
              {difference.finalBalance >= 0
                ? `القرار الأول "${selectedDecision1.name}" أفضل مالياً بفرق ${formatCurrency(
                    Math.abs(difference.finalBalance)
                  )} ريال على المدى الطويل.`
                : `القرار الثاني "${selectedDecision2.name}" أفضل مالياً بفرق ${formatCurrency(
                    Math.abs(difference.finalBalance)
                  )} ريال على المدى الطويل.`}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>مقارنة القرارات</Text>
        <Text style={styles.headerSubtitle}>قارن بين قرارين ماليين لاختيار الأفضل</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {decisions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>لا توجد قرارات للمقارنة</Text>
            <Text style={styles.emptyText}>
              قم بإنشاء قرارين ماليين على الأقل لتتمكن من المقارنة بينهما
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('NewDecision')}
            >
              <Text style={styles.emptyButtonText}>إنشاء قرار جديد</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderDecisionSelector(selectedDecision1, setSelectedDecision1, 'القرار الأول')}
            
            <View style={styles.vsContainer}>
              <Text style={styles.vsText}>VS</Text>
            </View>

            {renderDecisionSelector(selectedDecision2, setSelectedDecision2, 'القرار الثاني')}

            {!comparison && (
              <TouchableOpacity
                style={[
                  styles.compareButton,
                  (!selectedDecision1 || !selectedDecision2) && styles.compareButtonDisabled,
                ]}
                onPress={handleCompare}
                disabled={!selectedDecision1 || !selectedDecision2}
              >
                <Text style={styles.compareButtonText}>قارن الآن</Text>
              </TouchableOpacity>
            )}

            {renderComparison()}
          </>
        )}
      </ScrollView>
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
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textDark,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  selectorContainer: {
    padding: SPACING.lg,
  },
  selectorLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  selectedDecision: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  selectedEmoji: {
    fontSize: 40,
    marginLeft: SPACING.md,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  selectedType: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  changeButton: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  decisionsScroll: {
    marginTop: SPACING.sm,
  },
  decisionOption: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginLeft: SPACING.sm,
    width: 120,
    alignItems: 'center',
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  decisionEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  decisionName: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  vsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  vsText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.extrabold,
    color: COLORS.accent,
  },
  compareButton: {
    backgroundColor: COLORS.accent,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  compareButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  compareButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  comparisonContainer: {
    paddingBottom: SPACING.xl,
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
  comparisonCards: {
    gap: SPACING.md,
  },
  comparisonCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  comparisonCardTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  comparisonValues: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.md,
  },
  comparisonValue: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
  },
  comparisonAmount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  comparisonDifference: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  differenceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  differenceValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  recommendationBox: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
    borderRightWidth: 4,
    borderRightColor: COLORS.accent,
  },
  recommendationEmoji: {
    fontSize: 32,
    marginLeft: SPACING.md,
  },
  recommendationText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    lineHeight: TYPOGRAPHY.sizes.md * 1.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.sizes.md * 1.5,
  },
  emptyButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  emptyButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
});

export default CompareScreen;
