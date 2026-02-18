import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/atoms/dialog';
import { Label } from '@/components/atoms/label';
import { Input } from '@/components/atoms/input';
import { Button } from '@/components/atoms/button';
import { Text } from '@/components/atoms/text';
import { useLanguage } from '@/locale/useLanguage';
import { UserFood } from '@/models/food';

interface FoodDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  food: Partial<UserFood>;
  onFoodChange: (food: Partial<UserFood>) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export const FoodDialog: React.FC<FoodDialogProps> = ({
  isOpen,
  onOpenChange,
  food,
  onFoodChange,
  onSubmit,
  isEditing,
}) => {
  const [t] = useLanguage();

  const updateField = <K extends keyof UserFood>(field: K, value: UserFood[K]) => {
    onFoodChange({ ...food, [field]: value });
  };

  const parseNumber = (value: string): number | null => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? t('food.editFood') : t('food.newFood')}</DialogTitle>
          <DialogDescription>
            {isEditing ? t('food.editFoodDescription') : t('food.newFoodDescription')}
          </DialogDescription>
        </DialogHeader>
        <ScrollView className="max-h-[400px]">
          <View className="gap-4 py-4">
            <View className="gap-2">
              <Label nativeID="foodName">{t('food.foodName')}</Label>
              <Input
                aria-labelledby="foodName"
                value={food.name || ''}
                onChangeText={(text) => updateField('name', text)}
              />
            </View>
            <View className="gap-2">
              <Label nativeID="energy">{t('food.calories')}</Label>
              <Input
                aria-labelledby="energy"
                keyboardType="numeric"
                value={food.energy_kcal?.toString() || ''}
                onChangeText={(text) => updateField('energy_kcal', parseNumber(text))}
              />
            </View>
            <View className="gap-2">
              <Label nativeID="protein">{t('food.protein')} (g)</Label>
              <Input
                aria-labelledby="protein"
                keyboardType="numeric"
                value={food.protein_g?.toString() || ''}
                onChangeText={(text) => updateField('protein_g', parseNumber(text))}
              />
            </View>
            <View className="gap-2">
              <Label nativeID="carbs">{t('food.carbs')} (g)</Label>
              <Input
                aria-labelledby="carbs"
                keyboardType="numeric"
                value={food.carbohydrates_g?.toString() || ''}
                onChangeText={(text) => updateField('carbohydrates_g', parseNumber(text))}
              />
            </View>
            <View className="gap-2">
              <Label nativeID="fat">{t('food.fat')} (g)</Label>
              <Input
                aria-labelledby="fat"
                keyboardType="numeric"
                value={food.fat_g?.toString() || ''}
                onChangeText={(text) => updateField('fat_g', parseNumber(text))}
              />
            </View>
            <View className="gap-2">
              <Label nativeID="fiber">{t('food.fiber')} (g)</Label>
              <Input
                aria-labelledby="fiber"
                keyboardType="numeric"
                value={food.fiber_g?.toString() || ''}
                onChangeText={(text) => updateField('fiber_g', parseNumber(text))}
              />
            </View>
            <View className="gap-2">
              <Label nativeID="sugar">{t('food.sugar')} (g)</Label>
              <Input
                aria-labelledby="sugar"
                keyboardType="numeric"
                value={food.sugar_g?.toString() || ''}
                onChangeText={(text) => updateField('sugar_g', parseNumber(text))}
              />
            </View>
            <View className="gap-2">
              <Label nativeID="sodium">{t('food.sodium')} (mg)</Label>
              <Input
                aria-labelledby="sodium"
                keyboardType="numeric"
                value={food.sodium_mg?.toString() || ''}
                onChangeText={(text) => updateField('sodium_mg', parseNumber(text))}
              />
            </View>
          </View>
        </ScrollView>
        <DialogFooter>
          <Button variant="outline" onPress={() => onOpenChange(false)}>
            <Text>{t('pantry.cancel')}</Text>
          </Button>
          <Button onPress={onSubmit}>
            <Text>{t('pantry.save')}</Text>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
