import React from 'react';
import { View } from 'react-native';
import { Input } from '@/components/atoms/input';
import { Icon } from '@/components/atoms/icon';
import { useLanguage } from '@/locale/useLanguage';
import { Search } from 'lucide-react-native';

interface PantryHeaderProps {
  isDetailView: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
  onNewCategory: () => void;
}

export const PantryHeader: React.FC<PantryHeaderProps> = ({ searchQuery, onSearchChange }) => {
  const [t] = useLanguage();

  return (
    <View className="bg-card gap-4 p-4">
      <View className="relative">
        <View className="absolute top-2.5 left-3 z-10">
          <Icon as={Search} size={18} className="text-muted-foreground" />
        </View>
        <Input
          placeholder={t('pantry.searchPlaceholder')}
          placeholderTextColorClassName="text-muted-foreground"
          className="pl-10"
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>
    </View>
  );
};
