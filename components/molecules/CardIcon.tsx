import React from 'react';
import { Card, CardTitle } from '@/components/atoms/card';
import { Icon } from '@/components/atoms/icon';
import { Pressable } from 'react-native';
import { HelpCircle } from 'lucide-react-native';
import * as LucideIcons from 'lucide-react-native';
import { cn } from '@/lib/utils';

interface CardIconProps {
  title: string;
  icon?: string;
  onPress: () => void;
  className?: string;
}

export const CardIcon: React.FC<CardIconProps> = ({ title, icon, onPress, className }) => {
  const IconComponent = (icon && (LucideIcons as any)[icon]) || HelpCircle;

  return (
    <Pressable onPress={onPress} className={cn('min-w-[150px] flex-1', className)}>
      <Card className="items-center justify-center py-8">
        <Icon as={IconComponent} className="text-primary mb-2 size-8" />
        <CardTitle className="px-2 text-center">{title}</CardTitle>
      </Card>
    </Pressable>
  );
};
