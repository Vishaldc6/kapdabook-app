import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import DrawerContent from '@/src/components/DrawerContent';
import LanguageProvider from '@/src/components/LanguageProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {

  return (
    <LanguageProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer
          drawerContent={DrawerContent}
          screenOptions={{
            headerShown: false,
            // drawerType: 'front',
            drawerStyle: {
              backgroundColor: '#FFFFFF',
              width: 280,
            },
          }}
        >
          <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
          <Drawer.Screen name="buyers" options={{ title: 'Buyers' }} />
          <Drawer.Screen name="dalals" options={{ title: 'Dalals' }} />
          <Drawer.Screen name="materials" options={{ title: 'Materials' }} />
          <Drawer.Screen name="bills" options={{ title: 'Bills' }} />
          <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
          <Drawer.Screen name="+not-found" options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}
