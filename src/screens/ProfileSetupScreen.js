// src/screens/ProfileSetupScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { saveUserProfile, getUserProfile } from '../utils/storage';
import { formatCurrency } from '../utils/financialCalculations';

const ProfileSetupScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profile, setProfile] = useState({
    currentSavings: '',
    monthlyIncome: '',
    monthlyExpenses: '',
    financialGoals: [],
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const savedProfile = await getUserProfile();
    if (savedProfile) {
      setProfile({
        currentSavings: savedProfile.currentSavings.toString(),
        monthlyIncome: savedProfile.monthlyIncome.toString(),
        monthlyExpenses: savedProfile.monthlyExpenses.toString(),
        financialGoals: savedProfile.financialGoals || [],
      });
    }
  };

  const handleSave = async () => {
    const savings = parseFloat(profile.currentSavings) || 0;
    const income = parseFloat(profile.monthlyIncome) || 0;
    const expenses = parseFloat(profile.monthlyExpenses) || 0;

    if (savings < 0 || income < 0 || expenses < 0) {
      Alert.alert('خطأ', 'الرجاء إدخال قيم صحيحة');
      return;
    }

    if (expenses > income) {
      Alert.alert(
        'تنبيه',
        'مصاريفك الشهرية أكبر من دخلك. هذا قد يؤدي لمشاكل مالية.',
        [
          { text: 'تعديل', style: 'cancel' },
          {
            text: 'متابعة',
            onPress: async () => {
              await saveProfile();
            },
          },
        ]
      );
      return;
    }

    await saveProfile();
  };

  const saveProfile = async () => {
    const profileData = {
      currentSavings: parseFloat(profile.currentSavings) || 0,
      monthlyIncome: parseFloat(profile.monthlyIncome) || 0,
      monthlyExpenses: parseFloat(profile.monthlyExpenses) || 0,
      financialGoals: profile.financialGoals,
    };

    const saved = await saveUserProfile(profileData);
    if (saved) {
      Alert.alert('تم الحفظ', 'تم حفظ ملفك المالي بنجاح', [
        { text: 'حسناً', onPress: () => navigation.navigate('Home') },
      ]);
    }
  };

  const updateField = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const toggleGoal = (goal) => {
    const goals = profile.financialGoals.includes(goal)
      ? profile.financialGoals.filter((g) => g !== goal)
      : [...profile.financialGoals, goal];
    setProfile({ ...profile, financialGoals: goals });
  };

  const financialGoals = [
    { id: 'savings', label: 'بناء مدخرات طوارئ', emoji: '💰' },
    { id: 'investment', label: 'الاستثمار', emoji: '📈' },
    { id: 'property', label: 'شراء عقار', emoji: '🏠' },
    { id: 'car', label: 'شراء سيارة', emoji: '🚗' },
    { id: 'travel', label: 'السفر', emoji: '✈️' },
    { id: 'retirement', label: 'التقاعد المبكر', emoji: '🌴' },
    { id: 'education', label: 'التعليم', emoji: '🎓' },
    { id: 'business', label: 'بدء مشروع', emoji: '💼' },
  ];

  const steps = [
    { number: 1, title: 'المدخرات', subtitle: 'ما هي مدخراتك الحالية؟' },
    { number: 2, title: 'الدخل', subtitle: 'ما هو دخلك الشهري؟' },
    { number: 3, title: 'المصاريف', subtitle: 'ما هي مصاريفك الشهرية؟' },
    { number: 4, title: 'الأهداف', subtitle: 'ما هي أهدافك المالية؟' },
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>💰</Text>
            <Text style={styles.stepTitle}>مدخراتك الحالية</Text>
            <Text style={styles.stepDescription}>
              كم لديك من مدخرات حالياً؟ (في حسابك البنكي أو نقداً)
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={profile.currentSavings}
                onChangeText={(value) => updateField('currentSavings', value)}
              />
              <Text style={styles.inputSuffix}>ريال</Text>
            </View>
            {profile.currentSavings && (
              <Text style={styles.formattedValue}>
                {formatCurrency(parseFloat(profile.currentSavings) || 0)} ريال سعودي
              </Text>
            )}
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📊</Text>
            <Text style={styles.stepTitle}>الدخل الشهري</Text>
            <Text style={styles.stepDescription}>
              ما هو دخلك الشهري الصافي؟ (بعد الخصومات)
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={profile.monthlyIncome}
                onChangeText={(value) => updateField('monthlyIncome', value)}
              />
              <Text style={styles.inputSuffix}>ريال/شهر</Text>
            </View>
            {profile.monthlyIncome && (
              <Text style={styles.formattedValue}>
                {formatCurrency(parseFloat(profile.monthlyIncome) || 0)} ريال شهرياً
              </Text>
            )}
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>💸</Text>
            <Text style={styles.stepTitle}>المصاريف الشهرية</Text>
            <Text style={styles.stepDescription}>
              ما هو متوسط مصاريفك الشهرية؟ (إيجار، فواتير، طعام، وغيرها)
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="0"
                keyboardType="numeric"
                value={profile.monthlyExpenses}
                onChangeText={(value) => updateField('monthlyExpenses', value)}
              />
              <Text style={styles.inputSuffix}>ريال/شهر</Text>
            </View>
            {profile.monthlyExpenses && profile.monthlyIncome && (
              <View style={styles.savingsInfo}>
                <Text style={styles.savingsLabel}>الادخار الشهري:</Text>
                <Text
                  style={[
                    styles.savingsValue,
                    parseFloat(profile.monthlyIncome) - parseFloat(profile.monthlyExpenses) > 0
                      ? styles.positiveValue
                      : styles.negativeValue,
                  ]}
                >
                  {formatCurrency(
                    (parseFloat(profile.monthlyIncome) || 0) -
                      (parseFloat(profile.monthlyExpenses) || 0)
                  )}{' '}
                  ريال
                </Text>
              </View>
            )}
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.stepTitle}>أهدافك المالية</Text>
            <Text style={styles.stepDescription}>
              اختر أهدافك المالية (يمكنك اختيار أكثر من هدف)
            </Text>
            <View style={styles.goalsContainer}>
              {financialGoals.map((goal) => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    profile.financialGoals.includes(goal.id) && styles.goalCardSelected,
                  ]}
                  onPress={() => toggleGoal(goal.id)}
                >
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <Text
                    style={[
                      styles.goalLabel,
                      profile.financialGoals.includes(goal.id) && styles.goalLabelSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>إعداد الملف المالي</Text>
        <View style={styles.progressBar}>
          {steps.map((step) => (
            <View
              key={step.number}
              style={[styles.progressDot, currentStep >= step.number && styles.progressDotActive]}
            />
          ))}
        </View>
        <Text style={styles.headerSubtitle}>{steps[currentStep - 1].subtitle}</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.secondaryButtonText}>السابق</Text>
            </TouchableOpacity>
          )}

          {currentStep < 4 ? (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setCurrentStep(currentStep + 1)}
            >
              <Text style={styles.primaryButtonText}>التالي</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>حفظ الملف</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: SPACING.md,
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  progressDot: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  progressDotActive: {
    backgroundColor: COLORS.accent,
  },
  headerSubtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textDark,
    textAlign: 'center',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  stepContent: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  stepEmoji: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: TYPOGRAPHY.sizes.md * 1.5,
    paddingHorizontal: SPACING.md,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.medium,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  inputSuffix: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textLight,
    marginRight: SPACING.sm,
  },
  formattedValue: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.accent,
    marginTop: SPACING.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  savingsInfo: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  savingsValue: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  positiveValue: {
    color: COLORS.success,
  },
  negativeValue: {
    color: COLORS.error,
  },
  goalsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  goalCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  goalCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + '10',
  },
  goalEmoji: {
    fontSize: 32,
    marginBottom: SPACING.sm,
  },
  goalLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  goalLabelSelected: {
    color: COLORS.accent,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginRight: currentStep > 1 ? SPACING.sm : 0,
    ...SHADOWS.medium,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
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
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
});

export default ProfileSetupScreen;
