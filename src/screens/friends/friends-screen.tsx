import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export function FriendsScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIndicatorStyle: styles.tabIndicator,
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
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
  tabIndicator: {
    backgroundColor: '#6c63ff',
    height: 3,
  },
}); 