import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';
import { DatabaseProvider } from '@/contexts/DatabaseContext';
import { StorageProvider } from '@/contexts/StorageProvider/storage.provider';
import { StorageHandler } from '@/portability/StorageHandler/StorageHandler';
import { IT, LocalizationProvider } from '@/locale/localization.provider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { theme } = useUniwind();

  return (
    <DatabaseProvider>
      <StorageProvider StorageImplementation={StorageHandler}>
        <LocalizationProvider preferredLanguage={IT}>
          <ThemeProvider value={NAV_THEME[theme ?? 'light']}>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            <Stack />
            <PortalHost />
          </ThemeProvider>
        </LocalizationProvider>
      </StorageProvider>
    </DatabaseProvider>
  );
}
