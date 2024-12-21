import React from 'react';
import { StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Corrected import

import HomeScreen from '../screens/HomeScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => (
  <>
    <StatusBar barStyle="light-content" backgroundColor="#1E2541" translucent />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home-outline';
              break;
            case 'Services':
              iconName = 'construct-outline';
              break;
            case 'Order Summary':
              iconName = 'receipt-outline';
              break;
            case 'Settings':
              iconName = 'settings-outline';
              break;
            case 'Profile':
              iconName = 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          return <Icon name={iconName} size={size} color={color} />; // Use Icon here
        },
        tabBarActiveTintColor: '#A5F1E9',
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#1E2541',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Services" component={ServicesScreen} />
      <Tab.Screen name="Order Summary" component={OrderSummaryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  </>
);

export default MainTabNavigator;