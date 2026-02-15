import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
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
import { Icon } from '@/components/atoms/icon';
import * as LucideIcons from 'lucide-react-native';
import { cn } from '@/lib/utils';

const AVAILABLE_ICONS = [
  'Apple',
  'Banana',
  'Beef',
  'Beer',
  'Cake',
  'Carrot',
  'Cheese',
  'Coffee',
  'Egg',
  'Fish',
  'Grape',
  'IceCream',
  'Milk',
  'Pizza',
  'Soup',
  'Utensils',
  'Layers',
  'Package',
  'Leaf',
  'Cherry',
];

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  categoryIcon: string;
  onCategoryIconChange: (icon: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  categoryName,
  onCategoryNameChange,
  categoryIcon,
  onCategoryIconChange,
  onSubmit,
  isEditing,
}) => {
  const [t] = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('pantry.editCategory') : t('pantry.newCategory')}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t('pantry.editCategoryDescription') : t('pantry.newCategoryDescription')}
          </DialogDescription>
        </DialogHeader>
        <View className="gap-4 py-4">
          <View className="gap-2">
            <Label nativeID="catName">{t('pantry.categoryName')}</Label>
            <Input
              aria-labelledby="catName"
              value={categoryName}
              onChangeText={onCategoryNameChange}
            />
          </View>
          <View className="gap-2">
            <Label>{t('pantry.icon')}</Label>
            <View className="flex-row flex-wrap gap-2">
              {AVAILABLE_ICONS.map((iconName) => {
                const IconComp = (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
                const isSelected = categoryIcon === iconName;
                return (
                  <Pressable
                    key={iconName}
                    onPress={() => onCategoryIconChange(iconName)}
                    className={cn(
                      'border-border items-center justify-center rounded-md border p-2',
                      isSelected && 'bg-primary/10 border-primary'
                    )}>
                    <Icon
                      as={IconComp}
                      size={20}
                      className={isSelected ? 'text-primary' : 'text-muted-foreground'}
                    />
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
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
