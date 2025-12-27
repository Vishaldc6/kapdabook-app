import DrawerContent from '@/src/components/DrawerContent';
import LanguageProvider from '@/src/components/LanguageProvider';
import { loadAppOpenAd } from '@/src/utils/admob';
import { Drawer } from 'expo-router/drawer';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import mobileAds from 'react-native-google-mobile-ads';

export default function RootLayout() {

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(adapterStatuses => {
        console.log("Initialization complete!", { adapterStatuses });
      }).catch(e => {
        console.log({ e });
      });
  }, [])

  useEffect(() => {
    setTimeout(() => {
      loadAppOpenAd();
    }, 500);
  }, []);

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
          <Drawer.Screen name="account" options={{ title: 'Account' }} />
          <Drawer.Screen name="settings" options={{ title: 'Settings' }} />
          <Drawer.Screen name="+not-found" options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer>
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    </LanguageProvider>
  );
}
