import React from 'react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/atoms/text';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { ChevronLeft } from 'lucide-react-native';

export default function FoodDetailScreen() {
  const { id, isCustom } = useLocalSearchParams<{ id: string; isCustom: string }>();
  const router = useRouter();

  return (
    <View className="bg-background flex-1">
      <Stack.Screen
        options={{
          title: 'Food Details',
          headerShown: true,
          headerLeft: () => (
            <Button variant="ghost" size="icon" onPress={() => router.back()}>
              <Icon as={ChevronLeft} />
            </Button>
          ),
        }}
      />
      <View className="flex-1 items-center justify-center p-4">
        <Text variant="h1">Food Details</Text>
        <Text className="text-muted-foreground mt-2">
          ID: {id} ({isCustom === 'true' ? 'Custom' : 'Default'})
        </Text>
        <Text className="mt-4 text-center italic">
          Food detail information will be implemented here.
        </Text>
      </View>
    </View>
  );
}
