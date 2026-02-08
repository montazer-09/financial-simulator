// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { getUserProfile, getDecisions } from '../utils/storage';
import { formatCurrency } from '../utils/financialCalculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const profile = await getUserProfile();
    const savedDecisions = await getDecisions();
    setUserProfile(profile);
    setDecisions(savedDecisions);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.gradient}
        >
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateEmoji}>💰</Text>
            <Text style={styles.emptyStateTitle}>مرحباً بك!</Text>
            <Text style={styles.emptyStateText}>
              لنبدأ بإعداد ملفك المالي لمحاكاة قراراتك المالية
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('ProfileSetup')}
            >
              <Text style={styles.primaryButtonText}>ابدأ الآن</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  const savingsRate = userProfile.monthlyIncome > 0
    ? ((userProfile.monthlyIncome - userProfile.monthlyExpenses) / userProfile.monthlyIncome) * 100
    : 0;

  const quickActions = [
    {
      id: 1,
      title: 'قرار جديد',
      icon: '✨',
      color: COLORS.accent,
      onPress: () => navigation.navigate('NewDecision'),
    },
    {
      id: 2,
      title: 'مقارنة',
      icon: '⚖️',
      color: COLORS.secondary,
      onPress: () => navigation.navigate('Compare'),
    },
    {
      id: 3,
      title: 'قراراتي',
      icon: '📊',
      color: COLORS.chartNeutral,
      onPress: () => navigation.navigate('MyDecisions'),
    },
    {
      id: 4,
      title: 'الملف المالي',
      icon: '👤',
      color: COLORS.warning,
      onPress: () => navigation.navigate('ProfileSetup'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Gradient */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryLight]}
          style={styles.header}
        >
          <Text style={styles.greeting}>مرحباً 👋</Text>
          <Text style={styles.headerTitle}>نظرة على وضعك المالي</Text>

          {/* Financial Summary Cards */}
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>المدخرات الحالية</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(userProfile.currentSavings)}
              </Text>
              <Text style={styles.summaryCurrency}>ريال</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>الدخل الشهري</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(userProfile.monthlyIncome)}
              </Text>
              <Text style={styles.summaryCurrency}>ريال</Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>معدل الادخار</Text>
              <Text style={[
                styles.summaryValue,
                savingsRate > 20 ? styles.positiveValue : styles.warningValue
              ]}>
                {Math.round(savingsRate)}%
              </Text>
              <Text style={styles.summaryCurrency}>شهرياً</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCard}
                onPress={action.onPress}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <Text style={styles.actionEmoji}>{action.icon}</Text>
                </View>
                <Text style={styles.actionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Decisions */}
        {decisions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>القرارات الأخيرة</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MyDecisions')}>
                <Text style={styles.seeAllText}>عرض الكل</Text>
              </TouchableOpacity>
            </View>

            {decisions.slice(0, 3).map((decision) => (
              <TouchableOpacity
                key={decision.id}
                style={styles.decisionCard}
                onPress={() => navigation.navigate('DecisionDetails', { decision })}
              >
                <View style={styles.decisionHeader}>
                  <Text style={styles.decisionEmoji}>
                    {getDecisionEmoji(decision.type)}
                  </Text>
                  <View style={styles.decisionInfo}>
                    <Text style={styles.decisionTitle}>{decision.name}</Text>
                    <Text style={styles.decisionType}>
                      {getDecisionTypeLabel(decision.type)}
                    </Text>
                  </View>
                </View>
                <View style={styles.decisionFooter}>
                  <Text style={styles.decisionAmount}>
                    {formatCurrency(decision.data.price || decision.data.totalCost || 0)} ريال
                  </Text>
                  <Text style={styles.decisionDate}>
                    {new Date(decision.createdAt).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Financial Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>نصائح مالية</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipEmoji}>💡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>
                {savingsRate < 10
                  ? 'حسّن معدل ادخارك'
                  : savingsRate < 20
                  ? 'أنت على الطريق الصحيح'
                  : 'معدل ادخار ممتاز!'}
              </Text>
              <Text style={styles.tipText}>
                {savingsRate < 10
                  ? 'حاول توفير 10-20% من دخلك الشهري. ابدأ بتقليل المصاريف غير الضرورية.'
                  : savingsRate < 20
                  ? 'معدل ادخارك جيد. حاول الوصول لـ 20% لمستقبل مالي أفضل.'
                  : 'معدل ادخارك ممتاز! استمر على هذا النهج وفكر في استثمار جزء من مدخراتك.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
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

const getDecisionTypeLabel = (type) => {
  const labels = {
    car: 'شراء سيارة',
    investment: 'استثمار',
    travel: 'سفر',
    property: 'عقار',
    education: 'تعليم',
    business: 'مشروع تجاري',
  };
  return labels[type] || type;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textLight,
  },
  gradient: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textDark,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    opacity: 0.8,
    lineHeight: TYPOGRAPHY.sizes.lg * 1.5,
  },
  primaryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.glow,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xxl,
    borderBottomLeftRadius: BORDER_RADIUS.xl,
    borderBottomRightRadius: BORDER_RADIUS.xl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.textDark,
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textDark,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textDark,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textDark,
  },
  summaryCurrency: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textDark,
    opacity: 0.7,
    marginTop: SPACING.xs / 2,
  },
  positiveValue: {
    color: COLORS.success,
  },
  warningValue: {
    color: COLORS.warning,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  actionCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.xs * 2) / 2,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionEmoji: {
    fontSize: 32,
  },
  actionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  decisionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  decisionEmoji: {
    fontSize: 32,
    marginLeft: SPACING.sm,
  },
  decisionInfo: {
    flex: 1,
  },
  decisionTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  decisionType: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
  },
  decisionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  decisionAmount: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.accent,
  },
  decisionDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
  },
  tipCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    ...SHADOWS.small,
    borderRightWidth: 4,
    borderRightColor: COLORS.accent,
  },
  tipEmoji: {
    fontSize: 32,
    marginLeft: SPACING.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  tipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    lineHeight: TYPOGRAPHY.sizes.sm * 1.5,
  },
});

export default HomeScreen;
