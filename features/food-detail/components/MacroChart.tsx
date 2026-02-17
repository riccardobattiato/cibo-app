import React from 'react';
import { View } from 'react-native';
import { DonutChart as SkiaDonutChart } from 'expo-skia-charts';
import { Text } from '@/components/atoms/text';
import { useCSSVariable } from 'uniwind';

interface MacroChartProps {
  colorVar: string;
  colorClass: string;
  label: string;
  chartSize: number;
  value: number;
}

const colorClassMap: Record<string, { bg: string; text: string }> = {
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-600 dark:text-amber-400',
  },
};

export const MacroChart: React.FC<MacroChartProps> = ({
  value,
  colorVar,
  colorClass,
  label,
  chartSize,
}) => {
  const percentage = Math.min(100, Math.max(0, value));
  const remainder = 100 - percentage;
  const styles = colorClassMap[colorClass] || colorClassMap.red;
  const chartColor = useCSSVariable(colorVar);
  const grayColor = useCSSVariable('--color-zinc-300');

  return (
    <View className={`items-center rounded-2xl p-3 ${styles.bg}`}>
      <View style={{ height: chartSize, width: chartSize }}>
        <SkiaDonutChart
          config={{
            data: [
              { value: percentage, label },
              { value: remainder, label: 'rest' },
            ],
            colors: [chartColor as string, grayColor as string],
            strokeWidth: 14,
            gap: 0,
            roundedCorners: true,
            legend: { enabled: false },
            hover: { enabled: false },
            centerValues: {
              enabled: true,
              renderContent: () => (
                <View className="items-center justify-center">
                  <Text className="text-lg font-extrabold">{percentage.toFixed(0)}%</Text>
                  <Text className="text-muted-foreground text-xs">{value.toFixed(1)}g</Text>
                </View>
              ),
            },
          }}
        />
      </View>
      <Text className={`mt-2 text-sm font-medium ${styles.text}`}>{label}</Text>
    </View>
  );
};
