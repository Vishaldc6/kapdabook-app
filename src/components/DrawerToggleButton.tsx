import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from 'expo-router';
import { DrawerActions } from "expo-router/react-navigation";
import { Menu } from 'lucide-react-native';

export default function DrawerToggleButton() {
  const navigation = useNavigation();

  return (
    <Pressable
      accessibilityRole="button"
      android_ripple={{ borderless: true, radius: 20 }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={styles.button}
    >
      <Menu size={24} color="#1F2937" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
