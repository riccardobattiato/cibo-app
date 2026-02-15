import React, { useMemo } from 'react';
import { View } from 'react-native';
import { LegendList } from '@legendapp/list';
import { CategoryCard } from './CategoryCard';
import { FoodCategory, UserFoodCategory } from '@/models/food';
import { useLanguage } from '@/locale/useLanguage';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/atoms/dropdown-menu';
import { Button } from '@/components/atoms/button';
import { Icon } from '@/components/atoms/icon';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react-native';
import { Text } from '@/components/atoms/text';

type CategoryListItem =
  | { type: 'all'; id: string; name: string; icon: string }
  | (FoodCategory & { type: 'default' })
  | (UserFoodCategory & { type: 'user' })
  | { type: 'new'; id: string; name: string; icon: string };

interface CategoryGridProps {
  categories: FoodCategory[];
  userCategories: UserFoodCategory[];
  onSelectCategory: (id: number, isCustom: boolean) => void;
  onNewCategory: () => void;
  onEditCategory: (cat: UserFoodCategory) => void;
  onDeleteCategory: (id: number) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({
  categories,
  userCategories,
  onSelectCategory,
  onNewCategory,
  onEditCategory,
  onDeleteCategory,
}) => {
  const [t] = useLanguage();

  const items = useMemo(() => {
    const list: CategoryListItem[] = [
      { id: 'all', name: t('pantry.all'), icon: 'Layers', type: 'all' },
      ...categories.map((c) => ({ ...c, type: 'default' as const })),
      ...userCategories.map((c) => ({ ...c, type: 'user' as const })),
      { id: 'new', name: t('pantry.newCategory'), icon: 'Plus', type: 'new' },
    ];
    return list;
  }, [categories, userCategories, t]);

  return (
    <LegendList
      data={items}
      keyExtractor={(item) =>
        item.type === 'default'
          ? `def-${item.id}`
          : item.type === 'user'
            ? `user-${item.id}`
            : item.id.toString()
      }
      numColumns={2}
      contentContainerStyle={{ padding: 16 }}
      columnWrapperStyle={{ gap: 16 }}
      estimatedItemSize={120}
      renderItem={({ item }) => {
        if (item.type === 'user') {
          return (
            <View className="relative flex-1">
              <CategoryCard
                name={item.name}
                icon={item.icon}
                onPress={() => onSelectCategory(item.id, true)}
              />
              <View className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Icon as={MoreVertical} size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onPress={() => onEditCategory(item)}>
                      <Icon as={Edit2} size={14} className="mr-2" />
                      <Text>{t('pantry.edit')}</Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onPress={() => onDeleteCategory(item.id)}>
                      <Icon as={Trash2} size={14} className="text-destructive mr-2" />
                      <Text className="text-destructive">{t('pantry.delete')}</Text>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </View>
            </View>
          );
        }

        const onPress =
          item.type === 'all'
            ? () => onSelectCategory(0, false)
            : item.type === 'new'
              ? onNewCategory
              : () => onSelectCategory(item.id, false);

        return <CategoryCard name={item.name} icon={item.icon} onPress={onPress} />;
      }}
    />
  );
};
