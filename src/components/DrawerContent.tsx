import { usePathname, useRouter } from 'expo-router';
import { BadgePercent, Building2, Clock, Chrome as Home, Package, ReceiptIndianRupee, Settings, User, Users } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../hook/useLanguage';


const drawerItems = [
  { name: 'index', titleKey: 'dashboard', icon: Home, route: '/' },
  { name: 'buyers', titleKey: 'buyers', icon: Users, route: '/buyers' },
  { name: 'dalals', titleKey: 'dalals', icon: User, route: '/dalals' },
  { name: 'materials', titleKey: 'materials', icon: Package, route: '/materials' },
  { name: 'dhara', titleKey: 'dhara', icon: Clock, route: '/dhara' },
  { name: 'taxes', titleKey: 'taxes', icon: BadgePercent, route: '/taxes' },
  { name: 'bills', titleKey: 'bills', icon: ReceiptIndianRupee, route: '/bills' },
  { name: 'settings', titleKey: 'settings', icon: Settings, route: '/settings' },
];


export default function DrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const handleNavigation = (route: string) => {
    router.push(route as any);
  };

  const isActive = (route: string) => {
    if (route === '/' && pathname === '/') return true;
    if (route !== '/' && pathname.includes(route.slice(1))) return true;
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.brandSection}>
        <View style={styles.brandIcon}>
          <Building2 size={32} color="#2563EB" />
        </View>
        <Text style={styles.brandTitle}>Textile Billing</Text>
        <Text style={styles.brandSubtitle}>Business Management</Text>
      </View>

      <View style={styles.navigation}>
        {drawerItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.route);

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => handleNavigation(item.route)}
            >
              <IconComponent
                size={24}
                color={active ? '#2563EB' : '#6B7280'}
              />
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {t(item.titleKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('version')} 1.0.0</Text>
        <Text style={styles.footerSubtext}>Built with React Native</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  brandIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  navigation: {
    flex: 1,
    paddingTop: 20,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
  },
  navText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 16,
  },
  navTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#D1D5DB',
    marginTop: 2,
  },
});