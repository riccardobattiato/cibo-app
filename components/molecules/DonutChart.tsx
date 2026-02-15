import React from 'react';
import { View } from 'react-native';
import { DonutChart as SkiaDonutChart } from 'expo-skia-charts';
import { Text } from '@/components/atoms/text';
import { cn } from '@/lib/utils';

interface ChartData {
  value: number;
  color: string;
  label: string;
}

interface DonutChartProps {
  data: ChartData[];
  totalKcal: number;
  title?: string;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, totalKcal, title, className }) => {
  const totalValue = data.reduce((acc, curr) => acc + curr.value, 0);

  if (totalValue === 0) return null;

  return (
    <View className={cn('bg-card border-border items-center rounded-xl border p-6', className)}>
      {title && (
        <Text variant="h3" className="mb-4 self-start text-lg">
          {title}
        </Text>
      )}
      <View style={{ height: 240, width: 240 }}>
        <SkiaDonutChart
          config={{
            data,
            colors: data.map((el) => el.color),
            strokeWidth: 25,
            gap: 5,
            roundedCorners: true,
            legend: { enabled: false },
            hover: {
              enabled: true,
              updateCenterOnHover: true,
            },
            centerValues: {
              enabled: true,
              renderContent: (_segments, _total, hoveredSegment) => {
                if (hoveredSegment) {
                  return (
                    <View className="items-center justify-center">
                      <Text
                        className="text-sm font-bold tracking-wider uppercase"
                        style={{ color: hoveredSegment.color }}>
                        {hoveredSegment.label}
                      </Text>
                      <Text className="text-2xl font-extrabold">
                        {hoveredSegment.value.toFixed(1)}g
                      </Text>
                    </View>
                  );
                }
                return (
                  <View className="items-center justify-center">
                    <Text className="text-3xl font-extrabold">{totalKcal}</Text>
                    <Text className="text-muted-foreground text-xs font-bold tracking-widest uppercase">
                      kcal
                    </Text>
                  </View>
                );
              },
            },
          }}
        />
      </View>
      <View className="mt-6 w-full flex-row flex-wrap justify-center gap-4">
        {data.map((item) => (
          <View key={item.label} className="flex-row items-center gap-2">
            <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <Text className="text-sm">
              {item.label}: <Text className="font-semibold">{item.value.toFixed(1)}g</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
