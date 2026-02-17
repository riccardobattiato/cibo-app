import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { MacroChart } from './MacroChart';

interface Macro {
  key: string;
  value: number | null;
  color: string;
  label: string;
}

interface MacroChartsProps {
  macros: Macro[];
}

export const MacroCharts: React.FC<MacroChartsProps> = ({ macros }) => {
  const { width } = useWindowDimensions();
  const chartSize = Math.min(120, (width - 80) / 3);

  return (
    <View className="mb-6 flex-row justify-center gap-4">
      {macros.map((macro) => (
        <MacroChart
          key={macro.key}
          value={Number(macro.value) || 0}
          color={macro.color}
          label={macro.label}
          chartSize={chartSize}
        />
      ))}
    </View>
  );
};
