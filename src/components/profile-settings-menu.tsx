import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Main: undefined;
  Profile: undefined;
  AccountDetails: undefined;
  Notifications: undefined;
  BlockedUsers: undefined;
  Privacy: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingsMenuItem {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof RootStackParamList;
}

const settingsMenuItems: SettingsMenuItem[] = [
  {
    title: 'Account Details',
    icon: 'person-outline',
    screen: 'AccountDetails',
  },
  {
    title: 'Notifications',
    icon: 'notifications-outline',
    screen: 'Notifications',
  },
  {
    title: 'Blocked Users',
    icon: 'ban-outline',
    screen: 'BlockedUsers',
  },
  {
    title: 'Privacy',
    icon: 'lock-closed-outline',
    screen: 'Privacy',
  },
];

export function ProfileSettingsMenu() {
  const navigation = useNavigation<NavigationProp>();

  const getTestId = (title: string) => {
    // Convert title to kebab-case testID
    return title.toLowerCase().replace(/\s+/g, '-') + '-menu-item';
  };

  return (
    <View style={styles.container}>
      {settingsMenuItems.map((item, index) => (
        <TouchableOpacity
          key={item.title}
          style={[
            styles.menuItem,
            index === settingsMenuItems.length - 1 && styles.lastMenuItem,
          ]}
          onPress={() => navigation.navigate(item.screen)}
          accessibilityLabel={`Go to ${item.title}`}
          testID={getTestId(item.title)}
        >
          <View style={styles.menuItemContent}>
            <Ionicons name={item.icon} size={24} color="#6c63ff" />
            <Text style={styles.menuItemText}>{item.title}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#222',
    marginLeft: 12,
  },
}); 