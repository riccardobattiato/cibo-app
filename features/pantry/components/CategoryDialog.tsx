import React from 'react';
import { View } from 'react-native';
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

interface CategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string;
  onCategoryNameChange: (name: string) => void;
  onSubmit: () => void;
  isEditing: boolean;
}

export const CategoryDialog: React.FC<CategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  categoryName,
  onCategoryNameChange,
  onSubmit,
  isEditing,
}) => {
  const [t] = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
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
              autoFocus
            />
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
