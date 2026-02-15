import { Text } from '@/components/atoms/text';
import { View, ScrollView } from 'react-native';
import { useLanguage } from '@/locale/useLanguage';
import { usePantryFacade } from '@/features/pantry/usePantryFacade';
import { observer } from '@legendapp/state/react';

export default observer(function PantryScreen() {
  const [t] = useLanguage();
  const { categories, userCategories, isLoading, syncError } = usePantryFacade();

  return (
    <ScrollView className="bg-background flex-1">
      <View className="gap-4 p-4">
        <Text variant="h1">{t('pantry.title')}</Text>

        {isLoading && <Text className="text-muted-foreground italic">Initializing store...</Text>}
        {syncError && (
          <Text className="text-destructive">
            Error loading data:{' '}
            {typeof syncError === 'string' ? syncError : JSON.stringify(syncError)}
          </Text>
        )}

        {/* Default Categories Section */}
        <View className="gap-2">
          <Text variant="h3" className="mt-4">
            Default Categories (Read-Only)
          </Text>
          {categories.map((category) => (
            <View key={`def-${category.id}`} className="border-border border-b p-2">
              <Text>{category.name}</Text>
            </View>
          ))}
        </View>

        {/* User Categories Section */}
        <View className="gap-2">
          <Text variant="h3" className="text-primary mt-4">
            Your Custom Categories
          </Text>
          {userCategories.map((category) => (
            <View
              key={`user-${category.id}`}
              className="bg-secondary/20 border-border rounded border-b p-2">
              <Text className="font-medium">{category.name}</Text>
            </View>
          ))}
          {userCategories.length === 0 && (
            <Text className="text-muted-foreground pl-2 italic">No custom categories yet.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
});
