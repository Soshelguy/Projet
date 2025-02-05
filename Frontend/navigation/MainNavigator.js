import React from 'react';
import { CommonActions } from '@react-navigation/native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MainTabNavigator from './MainTabNavigator';
import AuthScreen from '../screens/AuthScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import UserOnboardingScreen from '../screens/UserOnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import OrderSummaryScreen from '../screens/OrderSummaryScreen';
import ServicesScreen from '../screens/ServicesScreen';
import ProductScreen from '../screens/ProductScreen';
import AllProductsScreen from '../screens/AllProductsScreen';
import AddServiceScreen from '../screens/AddServiceScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import RatingScreen from '../screens/RatingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ChatScreen from '../screens/ChatScreen';
import CategoryScreen from '../screens/CategoryScreen';
import CategoryDetailScreen from '../screens/CategoryDetailScreen';
import SubcategoryScreen from '../screens/SubcategoryScreen';
import AllCategoriesScreen from '../screens/AllCategoriesScreen';
import ServiceDetailScreen from '../screens/ServiceDetailScreen';
import DelivererSelectionScreen from '../screens/DelivererSelectionScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import { useAuth } from '../AuthContext';

// Initialize the stack navigator
const Stack = createNativeStackNavigator();

const MainNavigator = () => {
    // Retrieve user authentication state and loading state
    const { user, loading } = useAuth();

    // Function to handle user logout
    const handleLogout = async (navigation) => {
        try {
            await AsyncStorage.clear();
            setCurrentUser(null);

            // Reset navigation stack and direct user to the Auth screen
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                })
            );
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    // Display loading indicator while checking authentication state
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1F654C" />
            </View>
        );
    }

    // Main navigation container
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={user ? "Main" : "Auth"}
                screenOptions={{
                    headerShown: false
                }}
            >
                {/* Authentication Screens */}
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="UserOnboarding" component={UserOnboardingScreen} />

                {/* Main Application Screens */}
                <Stack.Screen name="Main" component={MainTabNavigator} />
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} />
                <Stack.Screen name="Services" component={ServicesScreen} />
                <Stack.Screen name="AllProducts" component={AllProductsScreen} />
                <Stack.Screen name="ProductDetails" component={ProductScreen} />
                <Stack.Screen name="AddService" component={AddServiceScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="Rating" component={RatingScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="Categories" component={CategoryScreen} />
                <Stack.Screen name="CategoryDetailScreen" component={CategoryDetailScreen} />
                <Stack.Screen name="SubcategoryScreen" component={SubcategoryScreen} />
                <Stack.Screen name="AllCategories" component={AllCategoriesScreen} />
                <Stack.Screen name="ServiceDetailScreen" component={ServiceDetailScreen} />
                <Stack.Screen name="DelivererSelection" component={DelivererSelectionScreen} />
                <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
                <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default MainNavigator;

