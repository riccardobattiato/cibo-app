import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { DonutChart as SkiaDonutChart } from 'expo-skia-charts';
import { Text } from '@/components/atoms/text';

interface MacroChartProps {
  value: number;
  color: string;
  label: string;
  chartSize: number;
}

export const MacroChart: React.FC<MacroChartProps> = ({ value, color, label, chartSize }) => {
  const percentage = Math.min(100, Math.max(0, value));
  const remainder = 100 - percentage;

  return (
    <View className="items-center">
      <View style={{ height: chartSize, width: chartSize }}>
        <SkiaDonutChart
          config={{
            data: [
              { value: percentage, label },
              { value: remainder, label: 'rest' },
            ],
            colors: [color, '#d4d4d8'],
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
                  <Text className="text-muted-foreground text-xs">{value.toFixed(1)}g</Text>
                </View>
              ),
            },
          }}
        />
      </View>
      <Text className="text-muted-foreground mt-2 text-sm font-medium">{label}</Text>
    </View>
  );
};
