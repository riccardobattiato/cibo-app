import React from 'react';
import { View, useWindowDimensions } from 'react-native';
import { MacroChart } from './MacroChart';

interface Macro {
  key: string;
  value: number | null;
  colorVar: string;
  colorClass: string;
  label: string;
}

interface MacroChartsProps {
  macros: Macro[];
}

export const MacroCharts: React.FC<MacroChartsProps> = ({ macros }) => {
  const { width } = useWindowDimensions();
  const chartSize = Math.min(120, (width - 128) / 3);

  return (
    <View className="mb-6 flex-row justify-center gap-3">
      {macros.map((macro) => (
        <MacroChart
          key={macro.key}
          value={Number(macro.value) || 0}
          colorVar={macro.colorVar}
          colorClass={macro.colorClass}
          label={macro.label}
          chartSize={chartSize}
        />
      ))}
    </View>
  );
};
