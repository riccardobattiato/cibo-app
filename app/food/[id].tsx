import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FoodDetailScreen } from '@/features/food-detail';

export default function FoodDetailRoute() {
  const { id, isCustom } = useLocalSearchParams<{ id: string; isCustom: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="bg-card flex-row items-center px-4 py-3">
        <Button variant="ghost" size="icon" onPress={() => router.back()}>
          <Icon as={ChevronLeft} />
        </Button>
      </View>

      <FoodDetailScreen id={id} isCustom={isCustom} />
    </View>
  );
}
