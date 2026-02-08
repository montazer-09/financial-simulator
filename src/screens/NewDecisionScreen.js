// src/screens/NewDecisionScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { saveDecision, getUserProfile } from '../utils/storage';
import {
  calculateFinancialImpact,
  analyzeRisk,
  generateRecommendations,
} from '../utils/financialCalculations';

const NewDecisionScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [decisionType, setDecisionType] = useState(null);
  const [decisionData, setDecisionData] = useState({
    name: '',
    price: '',
    downPayment: '',
    loanMonths: '',
    interestRate: '',
    monthlyMaintenance: '',
    insurance: '',
    monthlyContribution: '',
    annualReturn: '',
    riskLevel: 'low',
    totalCost: '',
    duration: '',
    monthlyPayment: '',
    monthlyFees: '',
    initialInvestment: '',
    monthlyExpenses: '',
    monthlyRevenue: '',
    breakEvenMonth: '',
  });

  const decisionTypes = [
    { id: 'car', label: 'شراء سيارة', emoji: '🚗', color: COLORS.chartNeutral },
    { id: 'property', label: 'شراء عقار', emoji: '🏠', color: COLORS.secondary },
    { id: 'investment', label: 'استثمار', emoji: '📈', color: COLORS.success },
    { id: 'travel', label: 'سفر', emoji: '✈️', color: COLORS.warning },
    { id: 'education', label: 'تعليم', emoji: '🎓', color: COLORS.accent },
    { id: 'business', label: 'مشروع تجاري', emoji: '💼', color: COLORS.error },
  ];

  const updateData = (field, value) => {
    setDecisionData({ ...decisionData, [field]: value });
  };

  const handleSubmit = async () => {
    if (!decisionData.name.trim()) {
      Alert.alert('خطأ', 'الرجاء إدخال اسم للقرار');
      return;
    }

    const userProfile = await getUserProfile();
    if (!userProfile) {
      Alert.alert('خطأ', 'الرجاء إعداد ملفك المالي أولاً', [
        { text: 'إعداد الملف', onPress: () => navigation.navigate('ProfileSetup') },
      ]);
      return;
    }

    const decision = {
      name: decisionData.name,
      type: decisionType,
      data: convertToNumbers(decisionData),
    };

    const impact = calculateFinancialImpact(decision, userProfile);
    const risk = analyzeRisk(decision, userProfile);
    const recommendations = generateRecommendations(decision, userProfile, impact);

    const savedDecision = await saveDecision(decision);
    if (savedDecision) {
      navigation.navigate('DecisionResults', {
        decision: savedDecision,
        impact,
        risk,
        recommendations,
      });
    }
  };

  const convertToNumbers = (data) => {
    const converted = {};
    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string' && data[key].trim() !== '') {
        const num = parseFloat(data[key]);
        converted[key] = isNaN(num) ? data[key] : num;
      } else {
        converted[key] = data[key];
      }
    });
    return converted;
  };

  const renderTypeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>اختر نوع القرار</Text>
      <Text style={styles.stepDescription}>ما هو القرار المالي الذي تريد محاكاته؟</Text>
      <View style={styles.typesGrid}>
        {decisionTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.typeCard,
              decisionType === type.id && styles.typeCardSelected,
              { borderColor: type.color },
            ]}
            onPress={() => {
              setDecisionType(type.id);
              setStep(2);
            }}
          >
            <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
              <Text style={styles.typeEmoji}>{type.emoji}</Text>
            </View>
            <Text style={styles.typeLabel}>{type.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCarForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>🚗 تفاصيل شراء السيارة</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>اسم السيارة</Text>
        <TextInput
          style={styles.textInput}
          placeholder="مثال: تويوتا كامري 2024"
          value={decisionData.name}
          onChangeText={(value) => updateData('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>سعر السيارة (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.price}
          onChangeText={(value) => updateData('price', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الدفعة الأولى (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.downPayment}
          onChangeText={(value) => updateData('downPayment', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>مدة التقسيط (شهر)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.loanMonths}
          onChangeText={(value) => updateData('loanMonths', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>نسبة الفائدة السنوية (%)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.interestRate}
          onChangeText={(value) => updateData('interestRate', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الصيانة الشهرية (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.monthlyMaintenance}
          onChangeText={(value) => updateData('monthlyMaintenance', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>التأمين السنوي (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.insurance}
          onChangeText={(value) => updateData('insurance', value)}
        />
      </View>
    </View>
  );

  const renderInvestmentForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>📈 تفاصيل الاستثمار</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>اسم الاستثمار</Text>
        <TextInput
          style={styles.textInput}
          placeholder="مثال: صندوق استثماري"
          value={decisionData.name}
          onChangeText={(value) => updateData('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>المبلغ الأولي (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.price}
          onChangeText={(value) => updateData('price', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>المساهمة الشهرية (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.monthlyContribution}
          onChangeText={(value) => updateData('monthlyContribution', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>العائد السنوي المتوقع (%)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.annualReturn}
          onChangeText={(value) => updateData('annualReturn', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>مستوى المخاطرة</Text>
        <View style={styles.riskButtons}>
          {['low', 'medium', 'high'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.riskButton,
                decisionData.riskLevel === level && styles.riskButtonActive,
              ]}
              onPress={() => updateData('riskLevel', level)}
            >
              <Text
                style={[
                  styles.riskButtonText,
                  decisionData.riskLevel === level && styles.riskButtonTextActive,
                ]}
              >
                {level === 'low' ? 'منخفض' : level === 'medium' ? 'متوسط' : 'عالي'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderTravelForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>✈️ تفاصيل السفر</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>وجهة السفر</Text>
        <TextInput
          style={styles.textInput}
          placeholder="مثال: دبي - 5 أيام"
          value={decisionData.name}
          onChangeText={(value) => updateData('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>التكلفة الإجمالية (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.totalCost}
          onChangeText={(value) => updateData('totalCost', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>هل ستدفع على أقساط؟</Text>
        <View style={styles.riskButtons}>
          <TouchableOpacity
            style={[
              styles.riskButton,
              !decisionData.monthlyPayment && styles.riskButtonActive,
            ]}
            onPress={() => updateData('monthlyPayment', '')}
          >
            <Text
              style={[
                styles.riskButtonText,
                !decisionData.monthlyPayment && styles.riskButtonTextActive,
              ]}
            >
              دفعة واحدة
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.riskButton,
              decisionData.monthlyPayment && styles.riskButtonActive,
            ]}
            onPress={() => updateData('monthlyPayment', '1000')}
          >
            <Text
              style={[
                styles.riskButtonText,
                decisionData.monthlyPayment && styles.riskButtonTextActive,
              ]}
            >
              أقساط شهرية
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {decisionData.monthlyPayment && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>القسط الشهري (ريال)</Text>
            <TextInput
              style={styles.numberInput}
              placeholder="0"
              keyboardType="numeric"
              value={decisionData.monthlyPayment}
              onChangeText={(value) => updateData('monthlyPayment', value)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>عدد الأقساط (شهر)</Text>
            <TextInput
              style={styles.numberInput}
              placeholder="0"
              keyboardType="numeric"
              value={decisionData.duration}
              onChangeText={(value) => updateData('duration', value)}
            />
          </View>
        </>
      )}
    </View>
  );

  const renderPropertyForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>🏠 تفاصيل العقار</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>نوع العقار</Text>
        <TextInput
          style={styles.textInput}
          placeholder="مثال: شقة 3 غرف"
          value={decisionData.name}
          onChangeText={(value) => updateData('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>سعر العقار (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.price}
          onChangeText={(value) => updateData('price', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الدفعة الأولى (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.downPayment}
          onChangeText={(value) => updateData('downPayment', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>مدة التمويل (شهر)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.loanMonths}
          onChangeText={(value) => updateData('loanMonths', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>نسبة الفائدة السنوية (%)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.interestRate}
          onChangeText={(value) => updateData('interestRate', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الرسوم الشهرية (صيانة، خدمات) (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.monthlyFees}
          onChangeText={(value) => updateData('monthlyFees', value)}
        />
      </View>
    </View>
  );

  const renderEducationForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>🎓 تفاصيل التعليم</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>البرنامج التعليمي</Text>
        <TextInput
          style={styles.textInput}
          placeholder="مثال: ماجستير إدارة أعمال"
          value={decisionData.name}
          onChangeText={(value) => updateData('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>التكلفة الإجمالية (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.totalCost}
          onChangeText={(value) => updateData('totalCost', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>مدة الدراسة (شهر)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.duration}
          onChangeText={(value) => updateData('duration', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>القسط الشهري (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.monthlyPayment}
          onChangeText={(value) => updateData('monthlyPayment', value)}
        />
      </View>
    </View>
  );

  const renderBusinessForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>💼 تفاصيل المشروع</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>اسم المشروع</Text>
        <TextInput
          style={styles.textInput}
          placeholder="مثال: متجر إلكتروني"
          value={decisionData.name}
          onChangeText={(value) => updateData('name', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الاستثمار الأولي (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.initialInvestment}
          onChangeText={(value) => updateData('initialInvestment', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>المصاريف الشهرية (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.monthlyExpenses}
          onChangeText={(value) => updateData('monthlyExpenses', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>الإيرادات الشهرية المتوقعة (ريال)</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.monthlyRevenue}
          onChangeText={(value) => updateData('monthlyRevenue', value)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>شهر التعادل المتوقع</Text>
        <TextInput
          style={styles.numberInput}
          placeholder="0"
          keyboardType="numeric"
          value={decisionData.breakEvenMonth}
          onChangeText={(value) => updateData('breakEvenMonth', value)}
        />
      </View>
    </View>
  );

  const renderForm = () => {
    switch (decisionType) {
      case 'car':
        return renderCarForm();
      case 'investment':
        return renderInvestmentForm();
      case 'travel':
        return renderTravelForm();
      case 'property':
        return renderPropertyForm();
      case 'education':
        return renderEducationForm();
      case 'business':
        return renderBusinessForm();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[COLORS.primary, COLORS.primaryLight]} style={styles.header}>
        <Text style={styles.headerTitle}>
          {step === 1 ? 'قرار مالي جديد' : 'التفاصيل'}
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {step === 1 ? renderTypeSelection() : renderForm()}
      </ScrollView>

      {step === 2 && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
            <Text style={styles.backButtonText}>رجوع</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>محاكاة القرار</Text>
          </TouchableOpacity>
        </View>
      )}
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
  content: {
    flex: 1,
  },
  stepContainer: {
    padding: SPACING.lg,
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
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    ...SHADOWS.small,
  },
  typeCardSelected: {
    ...SHADOWS.medium,
  },
  typeIcon: {
    width: 60,
    height: 60,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeEmoji: {
    fontSize: 32,
  },
  typeLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    textAlign: 'center',
  },
  formContainer: {
    padding: SPACING.lg,
  },
  formTitle: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  numberInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  riskButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginHorizontal: SPACING.xs / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  riskButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  riskButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text,
  },
  riskButtonTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    flex: 1,
    backgroundColor: COLORS.border,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginRight: SPACING.sm,
    ...SHADOWS.medium,
  },
  submitButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
});

export default NewDecisionScreen;
