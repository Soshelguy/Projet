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

const Stack = createNativeStackNavigator();

const MainNavigator = () => {
    const { user, loading } = useAuth();

    const logout = async (navigation) => {
        try {
            await AsyncStorage.clear();
            setCurrentUser(null);

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

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1F654C" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={user ? "Main" : "Auth"}
                screenOptions={{
                    headerShown: false
                }}
            >
                {/* Auth Screens */}
                <Stack.Screen name="Auth" component={AuthScreen} />
                <Stack.Screen name="SignUp" component={SignUpScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="UserOnboarding" component={UserOnboardingScreen} />

                {/* Main App Screens */}
                <Stack.Screen name="Main" component={MainTabNavigator} />
                <Stack.Screen name="HomeScreen" component={HomeScreen} />
                <Stack.Screen name="OrderSummaryScreen" component={OrderSummaryScreen} />
                <Stack.Screen name="ServicesScreen" component={ServicesScreen} />
                <Stack.Screen name="AllProductsScreen" component={AllProductsScreen} />
                <Stack.Screen name="ProductScreen" component={ProductScreen} />
                <Stack.Screen name="AddServiceScreen" component={AddServiceScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="Rating" component={RatingScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="ChatScreen" component={ChatScreen} />
                <Stack.Screen name="Category" component={CategoryScreen} />
                <Stack.Screen name="CategoryDetailScreen" component={CategoryDetailScreen} />
                <Stack.Screen name="SubcategoryScreen" component={SubcategoryScreen} />
                <Stack.Screen name="AllCategoriesScreen" component={AllCategoriesScreen} />
                <Stack.Screen name="ServiceDetailScreen" component={ServiceDetailScreen} />
                <Stack.Screen name="DelivererSelectionScreen" component={DelivererSelectionScreen} />
                <Stack.Screen name="OrderTrackingScreen" component={OrderTrackingScreen} />
                <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
                <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="OrderConfirmationScreen" component={OrderConfirmationScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default MainNavigator;
