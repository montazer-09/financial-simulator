// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@user_profile',
  DECISIONS: '@decisions',
  COMPARISONS: '@comparisons',
  ONBOARDING_COMPLETE: '@onboarding_complete',
};

/**
 * حفظ ملف المستخدم المالي
 */
export const saveUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

/**
 * جلب ملف المستخدم المالي
 */
export const getUserProfile = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * حفظ قرار مالي
 */
export const saveDecision = async (decision) => {
  try {
    const decisions = await getDecisions();
    const newDecision = {
      ...decision,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    decisions.push(newDecision);
    await AsyncStorage.setItem(KEYS.DECISIONS, JSON.stringify(decisions));
    return newDecision;
  } catch (error) {
    console.error('Error saving decision:', error);
    return null;
  }
};

/**
 * جلب جميع القرارات المحفوظة
 */
export const getDecisions = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.DECISIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting decisions:', error);
    return [];
  }
};

/**
 * حذف قرار
 */
export const deleteDecision = async (decisionId) => {
  try {
    const decisions = await getDecisions();
    const filtered = decisions.filter(d => d.id !== decisionId);
    await AsyncStorage.setItem(KEYS.DECISIONS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting decision:', error);
    return false;
  }
};

/**
 * تحديث قرار
 */
export const updateDecision = async (decisionId, updates) => {
  try {
    const decisions = await getDecisions();
    const index = decisions.findIndex(d => d.id === decisionId);
    
    if (index !== -1) {
      decisions[index] = {
        ...decisions[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(KEYS.DECISIONS, JSON.stringify(decisions));
      return decisions[index];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating decision:', error);
    return null;
  }
};

/**
 * حفظ مقارنة
 */
export const saveComparison = async (comparison) => {
  try {
    const comparisons = await getComparisons();
    const newComparison = {
      ...comparison,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    comparisons.push(newComparison);
    await AsyncStorage.setItem(KEYS.COMPARISONS, JSON.stringify(comparisons));
    return newComparison;
  } catch (error) {
    console.error('Error saving comparison:', error);
    return null;
  }
};

/**
 * جلب جميع المقارنات
 */
export const getComparisons = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMPARISONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting comparisons:', error);
    return [];
  }
};

/**
 * علامة إكمال التعريف بالتطبيق
 */
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
    return true;
  } catch (error) {
    console.error('Error setting onboarding complete:', error);
    return false;
  }
};

/**
 * التحقق من إكمال التعريف
 */
export const isOnboardingComplete = async () => {
  try {
    const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return data === 'true';
  } catch (error) {
    console.error('Error checking onboarding:', error);
    return false;
  }
};

/**
 * مسح جميع البيانات
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};
