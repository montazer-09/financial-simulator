// src/utils/financialCalculations.js
import { format, addMonths, addYears, differenceInMonths } from 'date-fns';
import { ar } from 'date-fns/locale';

/**
 * حساب التأثير المالي طويل المدى لقرار معين
 */
export const calculateFinancialImpact = (decision, userProfile, months = 60) => {
  const monthlyData = [];
  let currentBalance = userProfile.currentSavings;
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalInvestmentReturn = 0;
  
  const startDate = new Date();
  
  for (let month = 0; month <= months; month++) {
    const currentDate = addMonths(startDate, month);
    
    // الدخل الشهري
    const monthlyIncome = userProfile.monthlyIncome;
    totalIncome += monthlyIncome;
    
    // المصاريف الأساسية
    let monthlyExpenses = userProfile.monthlyExpenses;
    
    // إضافة تكاليف القرار
    const decisionCost = calculateDecisionCost(decision, month);
    monthlyExpenses += decisionCost;
    totalExpenses += monthlyExpenses;
    
    // عوائد الاستثمار (إذا كان القرار استثماري)
    const investmentReturn = calculateInvestmentReturn(decision, month, currentBalance);
    totalInvestmentReturn += investmentReturn;
    
    // حساب الرصيد الجديد
    currentBalance += monthlyIncome - monthlyExpenses + investmentReturn;
    
    // حساب نسبة الادخار
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
    
    monthlyData.push({
      month,
      date: currentDate,
      dateLabel: format(currentDate, 'MMM yyyy', { locale: ar }),
      balance: Math.round(currentBalance),
      income: monthlyIncome,
      expenses: monthlyExpenses,
      decisionCost,
      investmentReturn: Math.round(investmentReturn),
      savingsRate: Math.round(savingsRate * 10) / 10,
      totalIncome: Math.round(totalIncome),
      totalExpenses: Math.round(totalExpenses),
      totalInvestmentReturn: Math.round(totalInvestmentReturn),
    });
  }
  
  return {
    monthlyData,
    summary: {
      finalBalance: Math.round(currentBalance),
      totalCost: Math.round(totalExpenses),
      totalIncome: Math.round(totalIncome),
      totalInvestmentReturn: Math.round(totalInvestmentReturn),
      netChange: Math.round(currentBalance - userProfile.currentSavings),
      avgMonthlySavings: Math.round((currentBalance - userProfile.currentSavings) / months),
    },
  };
};

/**
 * حساب تكلفة القرار في شهر معين
 */
const calculateDecisionCost = (decision, month) => {
  switch (decision.type) {
    case 'car':
      return calculateCarCost(decision, month);
    case 'investment':
      return calculateInvestmentCost(decision, month);
    case 'travel':
      return calculateTravelCost(decision, month);
    case 'property':
      return calculatePropertyCost(decision, month);
    case 'education':
      return calculateEducationCost(decision, month);
    case 'business':
      return calculateBusinessCost(decision, month);
    default:
      return 0;
  }
};

const calculateCarCost = (decision, month) => {
  const { price, downPayment, loanMonths, interestRate, monthlyMaintenance, insurance } = decision.data;
  
  if (month === 0) {
    return downPayment; // الدفعة الأولى
  }
  
  if (loanMonths && month <= loanMonths) {
    // حساب القسط الشهري
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanMonths)) / 
                          (Math.pow(1 + monthlyRate, loanMonths) - 1);
    
    return monthlyPayment + monthlyMaintenance + (month % 12 === 0 ? insurance : 0);
  }
  
  // بعد سداد القرض، فقط الصيانة والتأمين
  return monthlyMaintenance + (month % 12 === 0 ? insurance : 0);
};

const calculateInvestmentCost = (decision, month) => {
  const { initialAmount, monthlyContribution } = decision.data;
  
  if (month === 0) {
    return initialAmount;
  }
  
  return monthlyContribution || 0;
};

const calculateTravelCost = (decision, month) => {
  const { totalCost, monthlyPayment, duration } = decision.data;
  
  if (monthlyPayment && duration) {
    return month < duration ? monthlyPayment : 0;
  }
  
  return month === 0 ? totalCost : 0;
};

const calculatePropertyCost = (decision, month) => {
  const { price, downPayment, loanMonths, interestRate, monthlyFees } = decision.data;
  
  if (month === 0) {
    return downPayment;
  }
  
  if (loanMonths && month <= loanMonths) {
    const loanAmount = price - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, loanMonths)) / 
                          (Math.pow(1 + monthlyRate, loanMonths) - 1);
    
    return monthlyPayment + monthlyFees;
  }
  
  return monthlyFees;
};

const calculateEducationCost = (decision, month) => {
  const { totalCost, duration, monthlyPayment } = decision.data;
  
  if (monthlyPayment && duration) {
    return month < duration ? monthlyPayment : 0;
  }
  
  return month === 0 ? totalCost : 0;
};

const calculateBusinessCost = (decision, month) => {
  const { initialInvestment, monthlyExpenses, breakEvenMonth } = decision.data;
  
  if (month === 0) {
    return initialInvestment;
  }
  
  return monthlyExpenses;
};

/**
 * حساب عوائد الاستثمار
 */
const calculateInvestmentReturn = (decision, month, currentBalance) => {
  if (decision.type !== 'investment') return 0;
  
  const { annualReturn, riskLevel } = decision.data;
  const monthlyReturn = annualReturn / 100 / 12;
  
  // محاكاة التقلبات بناءً على مستوى المخاطرة
  const volatility = riskLevel === 'high' ? 0.3 : riskLevel === 'medium' ? 0.15 : 0.05;
  const randomFactor = 1 + (Math.random() - 0.5) * volatility;
  
  return currentBalance * monthlyReturn * randomFactor;
};

/**
 * مقارنة قرارين ماليين
 */
export const compareDecisions = (decision1, decision2, userProfile, months = 60) => {
  const impact1 = calculateFinancialImpact(decision1, userProfile, months);
  const impact2 = calculateFinancialImpact(decision2, userProfile, months);
  
  return {
    decision1: impact1,
    decision2: impact2,
    difference: {
      finalBalance: impact1.summary.finalBalance - impact2.summary.finalBalance,
      totalCost: impact1.summary.totalCost - impact2.summary.totalCost,
      netChange: impact1.summary.netChange - impact2.summary.netChange,
    },
  };
};

/**
 * حساب نقطة التعادل للقرار
 */
export const calculateBreakEvenPoint = (decision, userProfile) => {
  if (decision.type === 'business') {
    const { initialInvestment, monthlyRevenue, monthlyExpenses } = decision.data;
    const monthlyProfit = monthlyRevenue - monthlyExpenses;
    
    if (monthlyProfit <= 0) return null;
    
    return Math.ceil(initialInvestment / monthlyProfit);
  }
  
  return null;
};

/**
 * تحليل المخاطر
 */
export const analyzeRisk = (decision, userProfile) => {
  const costRatio = decision.data.price ? 
    (decision.data.price / userProfile.currentSavings) * 100 : 0;
  
  let riskLevel = 'low';
  let riskScore = 0;
  
  if (costRatio > 80) {
    riskLevel = 'high';
    riskScore = 8;
  } else if (costRatio > 50) {
    riskLevel = 'medium';
    riskScore = 5;
  } else {
    riskLevel = 'low';
    riskScore = 2;
  }
  
  // إضافة عوامل أخرى للمخاطر
  if (decision.type === 'investment' && decision.data.riskLevel === 'high') {
    riskScore += 3;
  }
  
  if (decision.data.loanMonths > 60) {
    riskScore += 2;
  }
  
  return {
    level: riskLevel,
    score: Math.min(10, riskScore),
    factors: [
      { name: 'نسبة التكلفة للمدخرات', value: `${Math.round(costRatio)}%` },
      { name: 'مدة الالتزام', value: `${decision.data.loanMonths || decision.data.duration || 0} شهر` },
      { name: 'نوع القرار', value: getDecisionTypeLabel(decision.type) },
    ],
  };
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

/**
 * توليد توصيات ذكية
 */
export const generateRecommendations = (decision, userProfile, impact) => {
  const recommendations = [];
  
  // تحليل نسبة الادخار
  const avgSavingsRate = impact.monthlyData.reduce((sum, m) => sum + m.savingsRate, 0) / 
                         impact.monthlyData.length;
  
  if (avgSavingsRate < 10) {
    recommendations.push({
      type: 'warning',
      title: 'معدل ادخار منخفض',
      description: 'هذا القرار قد يقلل من قدرتك على الادخار بشكل كبير. فكر في تأجيله أو تقليل التكاليف.',
      priority: 'high',
    });
  }
  
  // تحليل الرصيد النهائي
  if (impact.summary.finalBalance < userProfile.currentSavings * 0.5) {
    recommendations.push({
      type: 'warning',
      title: 'انخفاض كبير في المدخرات',
      description: 'سيؤدي هذا القرار إلى استنزاف أكثر من نصف مدخراتك. تأكد من وجود خطة طوارئ.',
      priority: 'high',
    });
  }
  
  // توصيات إيجابية
  if (decision.type === 'investment' && impact.summary.totalInvestmentReturn > 0) {
    recommendations.push({
      type: 'success',
      title: 'فرصة استثمارية جيدة',
      description: `العوائد المتوقعة من هذا الاستثمار تبلغ ${formatCurrency(impact.summary.totalInvestmentReturn)} ريال.`,
      priority: 'medium',
    });
  }
  
  // توصيات تحسين
  if (decision.type === 'car' && decision.data.loanMonths > 48) {
    recommendations.push({
      type: 'info',
      title: 'مدة قرض طويلة',
      description: 'حاول تقليل مدة القرض لتوفير الفوائد. زيادة الدفعة الشهرية قد توفر عليك الكثير.',
      priority: 'low',
    });
  }
  
  return recommendations;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPercentage = (value) => {
  return `${Math.round(value * 10) / 10}%`;
};
