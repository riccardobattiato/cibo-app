import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/atoms/text';
import { Separator } from '@/components/atoms/separator';
import { cn } from '@/lib/utils';

interface NutrientRow {
  name: string;
  value: string | number;
  unit: string;
}

interface NutrientTableProps {
  title: string;
  nutrients: NutrientRow[];
  className?: string;
}

export const NutrientTable: React.FC<NutrientTableProps> = ({ title, nutrients, className }) => {
  if (nutrients.length === 0) return null;

  // Check if all values are effectively zero or null
  const hasData = nutrients.some((n) => {
    const val = typeof n.value === 'string' ? parseFloat(n.value) : n.value;
    return val !== 0 && val !== null && !isNaN(val as number);
  });

  if (!hasData) return null;

  return (
    <View className={cn('bg-card border-border mb-4 rounded-xl border p-4', className)}>
      <Text variant="h3" className="mb-4 text-lg">
        {title}
      </Text>
      <View className="min-w-full">
        {nutrients.map((nutrient, index) => (
          <React.Fragment key={`${nutrient.name}-${index}`}>
            <View className="flex-row items-center justify-between py-2 pr-4">
              <Text className="text-muted-foreground flex-1 pr-4">{nutrient.name}</Text>
              <View className="flex-row items-baseline gap-1">
                <Text className="font-semibold">{nutrient.value}</Text>
                <Text className="text-muted-foreground text-xs">{nutrient.unit}</Text>
              </View>
            </View>
            {index < nutrients.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};
