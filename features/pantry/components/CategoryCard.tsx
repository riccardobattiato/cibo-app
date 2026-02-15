import React from 'react';
import { CardIcon } from '@/components/molecules/CardIcon';

interface CategoryCardProps {
  name: string;
  icon?: string;
  onPress: () => void;
  className?: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, icon, onPress, className }) => {
  return <CardIcon title={name} icon={icon} onPress={onPress} className={className} />;
};
