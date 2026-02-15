import React from 'react';
import { View } from 'react-native';
import { Input } from '@/components/atoms/input';
import { Icon } from '@/components/atoms/icon';
import { useLanguage } from '@/locale/useLanguage';
import { Search, ChevronLeft, Plus } from 'lucide-react-native';
import { Button } from '@/components/atoms/button';

interface PantryHeaderProps {
  isDetailView: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onBack: () => void;
  onNewCategory: () => void;
}

export const PantryHeader: React.FC<PantryHeaderProps> = ({
  isDetailView,
  searchQuery,
  onSearchChange,
  onBack,
}) => {
  const [t] = useLanguage();

  return (
    <View className="bg-card gap-4 p-4">
      <View className="flex-row items-center gap-2">
        {isDetailView && (
          <Button variant="ghost" size="icon" onPress={onBack}>
            <Icon as={ChevronLeft} />
          </Button>
        )}
        <View className="relative flex-1">
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
    </View>
  );
};
