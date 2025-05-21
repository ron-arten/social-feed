import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

function FriendsListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Friends List</Text>
    </View>
  );
}

function RequestsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Friend Requests</Text>
    </View>
  );
}

// Custom tab bar component that handles the key prop correctly
function CustomTabBar({ state, descriptors, navigation, position }: any) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? options.title ?? route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[
              styles.tabItem,
              isFocused && styles.tabItemActive,
            ]}
          >
            <Text style={[
              styles.tabLabel,
              isFocused && styles.tabLabelActive,
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function FriendsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: '#6c63ff',
          tabBarInactiveTintColor: '#888',
        }}
      >
        <Tab.Screen 
          name="FriendsList" 
          component={FriendsListScreen}
          options={{
            tabBarLabel: 'Friends'
          }}
        />
        <Tab.Screen 
          name="Requests" 
          component={RequestsScreen}
          options={{
            tabBarLabel: 'Requests'
          }}
        />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#6c63ff',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  tabLabelActive: {
    color: '#6c63ff',
  },
}); 