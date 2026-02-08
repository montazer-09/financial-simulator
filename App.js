// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY } from './src/theme/theme';
import { isOnboardingComplete } from './src/utils/storage';

// Import Screens
import HomeScreen from './src/screens/HomeScreen';
import ProfileSetupScreen from './src/screens/ProfileSetupScreen';
import NewDecisionScreen from './src/screens/NewDecisionScreen';
import DecisionResultsScreen from './src/screens/DecisionResultsScreen';
import CompareScreen from './src/screens/CompareScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: TYPOGRAPHY.sizes.xs,
          fontWeight: TYPOGRAPHY.weights.semibold,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="NewDecision"
        component={NewDecisionScreen}
        options={{
          tabBarLabel: 'قرار جديد',
          tabBarIcon: ({ color, size }) => (
            <View
              style={{
                backgroundColor: COLORS.accent,
                borderRadius: 30,
                width: 56,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -20,
                ...styles.tabIconShadow,
              }}
            >
              <Text style={{ fontSize: 28 }}>✨</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Compare"
        component={CompareScreen}
        options={{
          tabBarLabel: 'مقارنة',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: 24, color }}>⚖️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main App Component
export default function App() {
  const [loading, setLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const done = await isOnboardingComplete();
    setOnboardingDone(done);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingEmoji}>💰</Text>
        <Text style={styles.loadingText}>محاكي القرارات المالية</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: COLORS.background },
          }}
        >
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="DecisionResults" component={DecisionResultsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textDark,
  },
  tabIconShadow: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
