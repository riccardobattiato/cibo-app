import React from 'react';
import { View } from 'react-native';
import { DonutChart as SkiaDonutChart } from 'expo-skia-charts';
import { Text } from '@/components/atoms/text';
import { useCSSVariable } from 'uniwind';
import { cn } from '@/lib/utils';

interface MacroChartProps {
  colorVar: string;
  colorClass: string;
  label: string;
  chartSize: number;
  value: number;
}

const colorClassMap: Record<string, { bg: string; text: string }> = {
  rose: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-600 dark:text-rose-400',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-400',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-400',
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
    <View className={cn('items-center rounded-2xl px-1 py-2', styles.bg)}>
      <View style={{ height: chartSize, width: chartSize }}>
        <SkiaDonutChart
          config={{
            data: [
              { value: percentage, label },
              { value: remainder, label: 'rest' },
            ],
            colors: [chartColor as string, grayColor as string],
            strokeWidth: 8,
            gap: 0,
            roundedCorners: true,
            legend: { enabled: false },
            hover: { enabled: false },
            centerValues: {
              enabled: true,
              renderContent: () => (
                <View className="items-center justify-center">
                  <Text className="text-lg font-extrabold">{percentage.toFixed(0)}%</Text>
                  <Text className={cn('text-xs', styles.text)}>{value.toFixed(1)}g</Text>
                </View>
              ),
            },
          }}
        />
      </View>
      <Text className="text-foreground mt-2 text-sm font-medium">{label}</Text>
    </View>
  );
};
