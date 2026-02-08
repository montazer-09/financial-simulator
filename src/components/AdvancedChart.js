// src/components/AdvancedChart.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { formatCurrency } from '../utils/financialCalculations';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - SPACING.lg * 2;

const AdvancedChart = ({ data, type = 'line', title, subtitle, showComparison = false }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [showDetails, setShowDetails] = useState(false);

  // تصفية البيانات بناءً على الفترة المختارة
  const getFilteredData = () => {
    if (!data || !data.monthlyData) return [];
    
    const periods = {
      '3m': 3,
      '6m': 6,
      '1y': 12,
      '3y': 36,
      'all': data.monthlyData.length,
    };
    
    const monthsToShow = periods[selectedPeriod] || data.monthlyData.length;
    return data.monthlyData.slice(0, monthsToShow);
  };

  const filteredData = getFilteredData();

  if (!filteredData || filteredData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>لا توجد بيانات لعرضها</Text>
      </View>
    );
  }

  // إعداد بيانات الرسم البياني
  const chartData = {
    labels: filteredData
      .filter((_, index) => index % Math.ceil(filteredData.length / 6) === 0)
      .map(item => item.dateLabel.split(' ')[0]),
    datasets: [
      {
        data: filteredData.map(item => item.balance),
        color: (opacity = 1) => `rgba(244, 185, 66, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // إضافة خط المقارنة إذا كان موجودًا
  if (showComparison && data.comparisonData) {
    chartData.datasets.push({
      data: data.comparisonData.map(item => item.balance),
      color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})`,
      strokeWidth: 3,
    });
  }

  const chartConfig = {
    backgroundColor: COLORS.primary,
    backgroundGradientFrom: COLORS.primary,
    backgroundGradientTo: COLORS.primaryLight,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: BORDER_RADIUS.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.accent,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: COLORS.primaryLight,
      strokeWidth: 1,
    },
  };

  const periods = [
    { key: '3m', label: '3 أشهر' },
    { key: '6m', label: '6 أشهر' },
    { key: '1y', label: 'سنة' },
    { key: '3y', label: '3 سنوات' },
    { key: 'all', label: 'الكل' },
  ];

  // حساب الإحصائيات
  const stats = {
    highest: Math.max(...filteredData.map(d => d.balance)),
    lowest: Math.min(...filteredData.map(d => d.balance)),
    average: filteredData.reduce((sum, d) => sum + d.balance, 0) / filteredData.length,
    change: filteredData[filteredData.length - 1].balance - filteredData[0].balance,
    changePercent: ((filteredData[filteredData.length - 1].balance - filteredData[0].balance) / 
                   filteredData[0].balance) * 100,
  };

  return (
    <View style={styles.container}>
      {/* العنوان */}
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}

      {/* اختيار الفترة الزمنية */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.periodSelector}
        contentContainerStyle={styles.periodContent}
      >
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodText,
                selectedPeriod === period.key && styles.periodTextActive,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* الرسم البياني */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartContainer}>
          {type === 'line' ? (
            <LineChart
              data={chartData}
              width={Math.max(CHART_WIDTH, filteredData.length * 40)}
              height={280}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withDots={filteredData.length < 20}
              withShadow={false}
              withInnerLines={true}
              withOuterLines={true}
              yAxisSuffix=""
              formatYLabel={(value) => {
                const num = parseFloat(value);
                if (num >= 1000000) return `${(num / 1000000).toFixed(1)}م`;
                if (num >= 1000) return `${(num / 1000).toFixed(0)}ك`;
                return num.toFixed(0);
              }}
            />
          ) : (
            <BarChart
              data={chartData}
              width={Math.max(CHART_WIDTH, filteredData.length * 40)}
              height={280}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={false}
              fromZero
            />
          )}
        </View>
      </ScrollView>

      {/* الإحصائيات */}
      <TouchableOpacity 
        style={styles.statsContainer}
        onPress={() => setShowDetails(!showDetails)}
      >
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>التغير</Text>
            <Text style={[
              styles.statValue,
              stats.change >= 0 ? styles.positive : styles.negative
            ]}>
              {stats.change >= 0 ? '+' : ''}{formatCurrency(stats.change)}
            </Text>
            <Text style={[
              styles.statPercent,
              stats.change >= 0 ? styles.positive : styles.negative
            ]}>
              {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>أعلى قيمة</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.highest)}</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>أقل قيمة</Text>
            <Text style={styles.statValue}>{formatCurrency(stats.lowest)}</Text>
          </View>
        </View>

        {showDetails && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>المتوسط:</Text>
              <Text style={styles.detailValue}>{formatCurrency(stats.average)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>عدد الأشهر:</Text>
              <Text style={styles.detailValue}>{filteredData.length} شهر</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>الرصيد الحالي:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(filteredData[0].balance)}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>الرصيد النهائي:</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(filteredData[filteredData.length - 1].balance)}
              </Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginVertical: SPACING.md,
    ...SHADOWS.medium,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    textAlign: 'right',
  },
  periodSelector: {
    marginBottom: SPACING.md,
  },
  periodContent: {
    paddingRight: SPACING.sm,
  },
  periodButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  periodButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  periodText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  periodTextActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  statsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text,
  },
  statPercent: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: SPACING.xs / 2,
  },
  positive: {
    color: COLORS.success,
  },
  negative: {
    color: COLORS.error,
  },
  detailsContainer: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  detailLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textLight,
  },
  detailValue: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text,
  },
  noDataText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textLight,
    textAlign: 'center',
    padding: SPACING.xl,
  },
});

export default AdvancedChart;
