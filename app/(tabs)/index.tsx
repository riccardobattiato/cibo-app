import { Text } from '@/components/atoms/text';
import * as React from 'react';
import { Image, type ImageStyle, View } from 'react-native';
import { useUniwind } from 'uniwind';
import { useLanguage } from '@/locale/useLanguage';

const LOGO = {
  light: require('@/assets/images/react_native_reusables_light.png'),
  dark: require('@/assets/images/react_native_reusables_dark.png'),
};

const IMAGE_STYLE: ImageStyle = {
  height: 76,
  width: 76,
};

export default function HomeScreen() {
  const { theme } = useUniwind();
  const [t] = useLanguage();

  return (
    <View className="flex-1 items-center justify-center gap-8 p-4">
      <Image source={LOGO[theme ?? 'light']} style={IMAGE_STYLE} resizeMode="contain" />
      <View className="items-center gap-2 p-4">
        <Text variant="h1">{t('home.title')}</Text>
        <Text variant="p" className="text-muted-foreground text-center">
          {t('home.welcome')}
        </Text>
      </View>
    </View>
  );
}
