import React from 'react';
import { Card, CardTitle } from '@/components/atoms/card';
import { Icon } from '@/components/atoms/icon';
import { Pressable } from 'react-native';
import * as icons from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface CardIconProps {
  title: string;
  icon?: string;
  onPress: () => void;
  className?: string;
}

const toPascalCase = (str: string) =>
  str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

export const CardIcon: React.FC<CardIconProps> = ({ title, icon, onPress, className }) => {
  const iconName = icon ? toPascalCase(icon) : 'CircleHelp';
  const LucideIcon = (icons as Record<string, any>)[iconName] || icons.CircleHelp;

  return (
    <Pressable onPress={onPress} className={cn('min-w-[150px] flex-1', className)}>
      <Card className="items-center justify-center py-8">
        <Icon as={LucideIcon} className="text-primary mb-2 size-8" />
        <CardTitle className="px-2 text-center">{title}</CardTitle>
      </Card>
    </Pressable>
  );
};
