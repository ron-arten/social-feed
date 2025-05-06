import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedScreen from './src/screens/feed/feed-screen';
import { ProfileScreen } from './src/screens/profile/profile-screen';
import { FriendsScreen } from './src/screens/friends/friends-screen';
import { MessagesScreen } from './src/screens/messages/messages-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from './src/contexts/user-context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { paddingVertical: 16, height: 70 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Feed') return <Ionicons name="home-outline" size={size} color={color} />;
          if (route.name === 'Friends') return <Ionicons name="people-outline" size={size} color={color} />;
          if (route.name === 'Messages') return <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />;
          return null;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator 
              screenOptions={{ 
                headerShown: false,
                animation: 'slide_from_left',
                animationDuration: 200,
              }}
            >
              <Stack.Screen name="Main" component={TabNavigator} />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{
                  animation: 'slide_from_right',
                  animationDuration: 200,
                }}
              />
            </Stack.Navigator>
            <StatusBar style="auto" />
          </NavigationContainer>
        </SafeAreaProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
} 