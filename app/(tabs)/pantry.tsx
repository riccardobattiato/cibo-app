import { Text } from '@/components/atoms/text';
import { View, ScrollView } from 'react-native';
import { useLanguage } from '@/locale/useLanguage';
import { usePantryFacade } from '@/features/pantry/usePantryFacade';

export default function PantryScreen() {
  const [t] = useLanguage();
  const { categories, isLoading, error } = usePantryFacade();

  return (
    <ScrollView className="bg-background flex-1">
      <View className="gap-4 p-4">
        <Text variant="h1">{t('pantry.title')}</Text>

        <View className="gap-2">
          <Text variant="h3" className="mt-4">
            Debug: Food Categories
          </Text>
          {isLoading && <Text>Loading categories...</Text>}
          {error && <Text className="text-destructive">Error: {error.message}</Text>}
          {categories.map((category) => (
            <View key={category.id} className="border-border border-b p-2">
              <Text>{category.name}</Text>
            </View>
          ))}
          {!isLoading && categories.length === 0 && <Text>No categories found.</Text>}
        </View>
      </View>
    </ScrollView>
  );
}
