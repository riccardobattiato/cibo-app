import { Text } from '@/components/atoms/text';
import { View } from 'react-native';
import { useLanguage } from '@/locale/useLanguage';

export default function PantryScreen() {
  const [t] = useLanguage();

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text variant="h1">{t('pantry.title')}</Text>
    </View>
  );
}
