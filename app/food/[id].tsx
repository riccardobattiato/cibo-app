import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { ChevronLeft, MoreVertical, Edit2, Copy, Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FoodDetailScreen } from '@/features/food-detail';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/atoms/dropdown-menu';
import { Text } from '@/components/atoms/text';
import { useLanguage } from '@/locale/useLanguage';
import { useFoodFacade } from '@/features/pantry/facades/useFoodFacade';
import { FoodDialog } from '@/features/pantry/components/FoodDialog';
import { UserFood } from '@/models/food';
import { observer } from '@legendapp/state/react';

const FoodDetailHeader = observer(function FoodDetailHeader({
  isUserFood,
  foodId,
  onEdit,
  onCreateVariation,
  onDelete,
}: {
  isUserFood: boolean;
  foodId: number;
  onEdit: (food: UserFood) => void;
  onCreateVariation: () => void;
  onDelete: () => void;
}) {
  const [t] = useLanguage();
  const { userFoods } = useFoodFacade();
  const food = userFoods.find((f) => f.id === foodId);
  const router = useRouter();

  return (
    <View className="bg-card flex-row items-center justify-between px-4 py-3">
      <Button variant="ghost" size="icon" onPress={() => router.back()}>
        <Icon as={ChevronLeft} />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Icon as={MoreVertical} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isUserFood && food && (
            <DropdownMenuItem onPress={() => onEdit(food)}>
              <Icon as={Edit2} size={14} className="mr-2" />
              <Text>{t('food.editFood')}</Text>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onPress={onCreateVariation}>
            <Icon as={Copy} size={14} className="mr-2" />
            <Text>{t('food.createVariation')}</Text>
          </DropdownMenuItem>
          {isUserFood && (
            <DropdownMenuItem variant="destructive" onPress={onDelete}>
              <Icon as={Trash2} size={14} className="text-destructive mr-2" />
              <Text className="text-destructive">{t('food.deleteFood')}</Text>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </View>
  );
});

export default function FoodDetailRoute() {
  const { id, isCustom } = useLocalSearchParams<{ id: string; isCustom: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [t] = useLanguage();
  const { updateFood, deleteFood, createVariation } = useFoodFacade();

  const [isFoodDialogOpen, setIsFoodDialogOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Partial<UserFood>>({});

  const isUserFood = isCustom === 'true';
  const foodId = Number(id);

  const handleEdit = (food: UserFood) => {
    setEditingFood(food);
    setIsFoodDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingFood.id && editingFood.name?.trim()) {
      updateFood(editingFood.id, editingFood);
      setIsFoodDialogOpen(false);
      setEditingFood({});
    }
  };

  const handleCreateVariation = async () => {
    try {
      await createVariation(foodId, isUserFood);
      router.back();
    } catch (error) {
      console.error('Failed to create variation:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(t('food.deleteFood'), 'Are you sure you want to delete this food?', [
      { text: t('pantry.cancel'), style: 'cancel' },
      {
        text: t('pantry.delete'),
        style: 'destructive',
        onPress: () => {
          deleteFood(foodId);
          router.back();
        },
      },
    ]);
  };

  return (
    <View
      style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
      className="bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      <FoodDetailHeader
        isUserFood={isUserFood}
        foodId={foodId}
        onEdit={handleEdit}
        onCreateVariation={handleCreateVariation}
        onDelete={handleDelete}
      />

      <FoodDetailScreen id={id} isCustom={isCustom} />

      <FoodDialog
        isOpen={isFoodDialogOpen}
        onOpenChange={setIsFoodDialogOpen}
        food={editingFood}
        onFoodChange={setEditingFood}
        onSubmit={handleSaveEdit}
        isEditing={true}
      />
    </View>
  );
}
