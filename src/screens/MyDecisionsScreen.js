// src/screens/MyDecisionsScreen.js
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
import { getDecisions, deleteDecision } from '../utils/storage';
import { formatCurrency } from '../utils/financialCalculations';

const MyDecisionsScreen = ({ navigation }) => {
  const [decisions, setDecisions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadDecisions();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadDecisions();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDecisions = async () => {
    const savedDecisions = await getDecisions();
    setDecisions(savedDecisions.reverse());
  };

  const handleDelete = (decisionId, decisionName) => {
    Alert.alert(
      'حذف القرار',
      `هل أنت متأكد من حذف "${decisionName}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteDecision(decisionId);
            if (success) {
              loadDecisions();
            }
          },
        },
      ]
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

  const filterTypes = [
    { id: 'all', label: 'الكل', emoji: '📊' },
    { id: 'car', label: 'سيارات', emoji: '🚗' },
    { id: 'investment', label: 'استثمارات', emoji: '📈' },
    { id: 'property', label: 'عقارات', emoji: '🏠' },
  ];

  const filteredDecisions =
    filter === 'all' ? decisions : decisions.filter((d) => d.type === filter);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>قراراتي المالية</Text>
        <Text style={styles.headerSubtitle}>
          {decisions.length} {decisions.length === 1 ? 'قرار' : 'قرارات'} محفوظة
        </Text>
      </LinearGradient>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {filterTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[styles.filterTab, filter === type.id && styles.filterTabActive]}
            onPress={() => setFilter(type.id)}
          >
            <Text style={styles.filterEmoji}>{type.emoji}</Text>
            <Text
              style={[
                styles.filterLabel,
                filter === type.id && styles.filterLabelActive,
              ]}
            >
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Decisions List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredDecisions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📁</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all' ? 'لا توجد قرارات' : 'لا توجد قرارات في هذه الفئة'}
            </Text>
            <Text style={styles.emptyText}>
              قم بإنشاء قرار مالي جديد لتبدأ في محاكاة قراراتك المالية
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('NewDecision')}
            >
              <Text style={styles.emptyButtonText}>قرار جديد</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.decisionsList}>
            {filteredDecisions.map((decision) => (
              <TouchableOpacity
                key={decision.id}
                style={styles.decisionCard}
                onPress={() => {
                  // Navigate to decision details or re-run simulation
                  navigation.navigate('NewDecision');
                }}
              >
                <View style={styles.decisionHeader}>
                  <View style={styles.decisionInfo}>
                    <Text style={styles.decisionEmoji}>
                      {getDecisionEmoji(decision.type)}
                    </Text>
                    <View style={styles.decisionText}>
                      <Text style={styles.decisionName}>{decision.name}</Text>
                      <Text style={styles.decisionType}>
                        {getDecisionTypeLabel(decision.type)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(decision.id, decision.name)}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.decisionDetails}>
                  {decision.data.price && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>السعر:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(decision.data.price)} ريال
                      </Text>
                    </View>
                  )}
                  {decision.data.totalCost && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>التكلفة:</Text>
                      <Text style={styles.detailValue}>
                        {formatCurrency(decision.data.totalCost)} ريال
                      </Text>
                    </View>
                  )}
                  {decision.data.loanMonths && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>مدة التقسيط:</Text>
                      <Text style={styles.detailValue}>
                        {decision.data.loanMonths} شهر
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.decisionFooter}>
                  <Text style={styles.decisionDate}>
                    {new Date(decision.createdAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  filterTabs: {
    marginTop: SPACING.md,
  },
  filterTabsContent: {
    paddingHorizontal: SPACING.lg,
  },
  filterTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterEmoji: {
    fontSize: 16,
    marginLeft: SPACING.xs,
  },
  filterLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  filterLabelActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  content: {
    flex: 1,
  },
  decisionsList: {
    padding: SPACING.lg,
  },
  decisionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  decisionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  decisionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  decisionEmoji: {
    fontSize: 36,
    marginLeft: SPACING.md,
  },
  decisionText: {
    flex: 1,
  },
  decisionName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },
  decisionType: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  deleteIcon: {
    fontSize: 20,
  },
  decisionDetails: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.accent,
  },
  decisionFooter: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  decisionDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'left',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xxl * 2,
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

export default MyDecisionsScreen;
