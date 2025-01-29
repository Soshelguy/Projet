/**
 * MainTabNavigator.js
 * This file contains the main tab navigator for the app.
 * It is responsible for rendering the bottom tab bar and the screens associated with each tab.
 * The screens are HomeScreen, ServicesScreen, OrderSummaryScreen, ProfileScreen, and SettingsScreen.
 * The bottom tab bar is customized with colors, icons, and label styles.
 * The StatusBar is also customized to match the app's theme.
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons'; // Corrected import

/**
 * Screens to be rendered by the tab navigator.
 */
import HomeScreen from '../screens/HomeScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProfileScreen from '../screens/ProfileScreen';

/**
 * Create the bottom tab navigator.
 */
const Tab = createBottomTabNavigator();

/**
 * Customize the tab bar icons and labels.
 * @param {Object} options - The options object from the tab navigator.
 * @return {JSX.Element} - The tab bar icon component.
 */
const getTabBarIcon = ({ route }) => ({ focused }) => {
  const { name } = route;
  let iconName;
  switch (name) {
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
  return <Icon name={iconName} size={focused ? 30 : 20} color={focused ? '#A5F1E9' : '#888888'} />;
};

/**
 * Render the tab navigator.
 * @return {JSX.Element} - The rendered tab navigator.
 */
const MainTabNavigator = () => (
  <>
    <StatusBar
      barStyle="light-content"
      backgroundColor="#1E2541"
      translucent
    />
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide the header on all screens
        tabBarIcon: getTabBarIcon({ route }), // Use the custom icon function
        tabBarStyle: {
          backgroundColor: '#1E2541', // Tab bar background color
          borderTopWidth: 0, // Hide the tab bar border
          elevation: 0, // Remove the shadow
          height: 60, // Tab bar height
        },
        tabBarLabelStyle: {
          fontSize: 12, // Label font size
          marginBottom: 5, // Label margin bottom
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

