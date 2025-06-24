import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { View, Platform, useWindowDimensions, DevSettings, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FeedScreen from './src/screens/feed/feed-screen';
import { ProfileScreen } from './src/screens/profile/profile-screen';
import { FriendsScreen } from './src/screens/friends/friends-screen';
import { MessagesScreen } from './src/screens/messages/messages-screen';
import { ChatScreen } from './src/screens/messages/chat-screen';
import { AccountDetailsScreen } from './src/screens/settings/account-details-screen';
import { NotificationsScreen } from './src/screens/settings/notifications-screen';
import { BlockedUsersScreen } from './src/screens/settings/blocked-users-screen';
import { PrivacyScreen } from './src/screens/settings/privacy-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserProvider } from './src/contexts/user-context';
import { DatabaseProvider } from './src/contexts/database-context';
import { resetDatabase, initDatabase } from './src/services/database';
import {PendoSDK, NavigationLibraryType} from "rn-pendo-sdk";
import {WithPendoReactNavigation} from 'rn-pendo-sdk'    
function initPendo() {
    const navigationOptions = { 'library': NavigationLibraryType.ReactNavigation };
    const key = 'YOUR_API_KEY_HERE';
    //note the following API will only setup initial configuration, to start collect analytics use start session
    PendoSDK.setDebugMode(true);
    PendoSDK.setup(key, navigationOptions);
}

initPendo();


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();   
const PendoNavigationContainer = WithPendoReactNavigation(NavigationContainer);    

function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  
  // Calculate dynamic tab bar height based on device
  const getTabBarHeight = () => {
    if (Platform.OS === 'android') {
      return 70;
    }
    
    // iOS dynamic height calculation
    const baseHeight = 49; // Standard iOS tab bar height
    const bottomInset = insets.bottom;
    const hasHomeIndicator = bottomInset > 20; // Devices with home indicator have larger bottom inset
    
    return baseHeight + (hasHomeIndicator ? bottomInset : 0);
  };

  // Calculate dynamic padding based on device
  const getTabBarPadding = () => {
    if (Platform.OS === 'android') {
      return 8;
    }
    
    // iOS dynamic padding
    const basePadding = 8;
    const hasHomeIndicator = insets.bottom > 20;
    return hasHomeIndicator ? basePadding : 12;
  };

  return (
    <Tab.Navigator
      initialRouteName="Feed"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#6c63ff',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: getTabBarHeight(),
          paddingVertical: getTabBarPadding(),
          paddingBottom: getTabBarPadding(),
          backgroundColor: '#fff',
          borderTopWidth: 0.5,
          borderTopColor: '#e0e0e0',
          elevation: 0, // Remove Android shadow
          shadowOpacity: 0, // Remove iOS shadow
        },
        tabBarLabelStyle: {
          fontSize: Math.min(12, width * 0.03), // Responsive font size
          fontWeight: '600',
          marginBottom: Platform.select({
            ios: 0,
            android: 4,
          }),
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = Platform.select({
            ios: Math.min(24, width * 0.06), // Responsive icon size for iOS
            android: 24,
          });
          
          if (route.name === 'Feed') return <Ionicons name="home-outline" size={iconSize} color={color} />;
          if (route.name === 'Friends') return <Ionicons name="people-outline" size={iconSize} color={color} />;
          if (route.name === 'Messages') return <Ionicons name="chatbubble-ellipses-outline" size={iconSize} color={color} />;
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
  // Register dev menu items when the app starts
  React.useEffect(() => {
    if (__DEV__) {
      console.log('Registering dev menu items...');
      DevSettings.addMenuItem('Reset Database', async () => {
        console.log('Reset Database option selected');
        try {
          await resetDatabase();
          await initDatabase();
          console.log('Database reset and reinitialized successfully');
          // Reload the app to ensure clean state
          DevSettings.reload();
        } catch (error) {
          console.error('Error resetting database:', error);
        }
      });
      console.log('Dev menu items registered successfully');
    }
  }, []); // Empty dependency array means this runs once when the app starts

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DatabaseProvider>
        <UserProvider>
          <SafeAreaProvider>
            {/* <NavigationContainer> */}
            <PendoNavigationContainer>
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
                <Stack.Screen 
                  name="Chat" 
                  component={ChatScreen}
                  options={{
                    headerShown: true,
                    animation: 'slide_from_right',
                    animationDuration: 200,
                    headerStyle: {
                      backgroundColor: '#f6f7fb',
                    },
                    contentStyle: {
                      backgroundColor: '#f6f7fb',
                    },
                  }}
                />
                <Stack.Screen 
                  name="AccountDetails" 
                  component={AccountDetailsScreen}
                  options={{
                    animation: 'slide_from_right',
                    animationDuration: 200,
                  }}
                />
                <Stack.Screen 
                  name="Notifications" 
                  component={NotificationsScreen}
                  options={{
                    animation: 'slide_from_right',
                    animationDuration: 200,
                  }}
                />
                <Stack.Screen 
                  name="BlockedUsers" 
                  component={BlockedUsersScreen}
                  options={{
                    animation: 'slide_from_right',
                    animationDuration: 200,
                  }}
                />
                <Stack.Screen 
                  name="Privacy" 
                  component={PrivacyScreen}
                  options={{
                    animation: 'slide_from_right',
                    animationDuration: 200,
                  }}
                />
              </Stack.Navigator>
              <ExpoStatusBar style="auto" />
              {/* Normal NavigationContainer goes here */}
            </PendoNavigationContainer>
          </SafeAreaProvider>
        </UserProvider>
      </DatabaseProvider>
    </GestureHandlerRootView>
  );
} 