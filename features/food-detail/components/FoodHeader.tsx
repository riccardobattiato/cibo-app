import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/atoms/text';
import { Badge } from '@/components/atoms/badge';
import { Icon } from '@/components/atoms/icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/atoms/tooltip';
import { Flame, Scale, Utensils } from 'lucide-react-native';
import { FoodWithCategory, UserFood } from '@/models/food';
import { useLanguage } from '@/locale/useLanguage';
import { LanguagesType } from '@/locale/localization.provider';

interface FoodHeaderProps {
  food: FoodWithCategory | UserFood;
  isCustom: boolean;
  locale: LanguagesType;
}

export const FoodHeader: React.FC<FoodHeaderProps> = ({ food, isCustom, locale }) => {
  const [t] = useLanguage();

  const displayName = locale === 'en' && food.english_name ? food.english_name : food.name;

  return (
    <>
      <View className="mb-6 items-center">
        <View className="flex-row items-center gap-2">
          <Text variant="h1" className="text-center text-3xl">
            {displayName}
          </Text>
        </View>
        {food.scientific_name && (
          <Text className="text-muted-foreground mt-1 italic">{food.scientific_name}</Text>
        )}
      </View>

      <View className="mb-6 flex-row justify-center gap-3">
        <Tooltip>
          <TooltipTrigger>
            <Badge className="bg-orange-500 dark:bg-orange-600">
              <Icon as={Flame} className="text-white" size={14} />
              <Text className="text-white">{food.energy_kcal} kcal</Text>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <Text>{t('food.energy')}</Text>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Badge className="bg-emerald-500 dark:bg-emerald-600">
              <Icon as={Scale} className="text-white" size={14} />
              <Text className="text-white">{food.edible_part_percentage}%</Text>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <Text>{t('food.ediblePart')}</Text>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Badge className="bg-sky-500 dark:bg-sky-600">
              <Icon as={Utensils} className="text-white" size={14} />
              <Text className="text-white">
                {food.portion_value} {food.portion_unit}
              </Text>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <Text>{t('food.portion')}</Text>
          </TooltipContent>
        </Tooltip>
      </View>
    </>
  );
};
