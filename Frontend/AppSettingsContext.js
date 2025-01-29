import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create a context for app settings
export const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
    // State variables for different settings
    const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);
    const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(true);
    const [isLocationEnabled, setIsLocationEnabled] = useState(true);
    const [isFastDeliveryEnabled, setIsFastDeliveryEnabled] = useState(false);
    const [isContactlessDeliveryEnabled, setIsContactlessDeliveryEnabled] = useState(true);

    // Load settings from AsyncStorage on component mount
    useEffect(() => {
        loadSettings();
    }, []);

    // Function to load settings from AsyncStorage
    const loadSettings = async () => {
        try {
            const darkModeSetting = await AsyncStorage.getItem('darkMode');
            const notificationsSetting = await AsyncStorage.getItem('notifications');
            const locationSetting = await AsyncStorage.getItem('location');
            const fastDeliverySetting = await AsyncStorage.getItem('fastDelivery');
            const contactlessDeliverySetting = await AsyncStorage.getItem('contactlessDelivery');

            // Parse settings and update state
            setIsDarkModeEnabled(darkModeSetting === 'true');
            setAreNotificationsEnabled(notificationsSetting !== 'false');
            setIsLocationEnabled(locationSetting !== 'false');
            setIsFastDeliveryEnabled(fastDeliverySetting === 'true');
            setIsContactlessDeliveryEnabled(contactlessDeliverySetting !== 'false');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    // Function to save a setting to AsyncStorage
    const saveSetting = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    };

    // Toggle functions to update settings
    const toggleDarkMode = () => {
        setIsDarkModeEnabled(prev => {
            saveSetting('darkMode', !prev);
            return !prev;
        });
    };

    const toggleNotifications = () => {
        setAreNotificationsEnabled(prev => {
            saveSetting('notifications', !prev);
            return !prev;
        });
    };

    const toggleLocation = () => {
        setIsLocationEnabled(prev => {
            saveSetting('location', !prev);
            return !prev;
        });
    };

    const toggleFastDelivery = () => {
        setIsFastDeliveryEnabled(prev => {
            saveSetting('fastDelivery', !prev);
            return !prev;
        });
    };

    const toggleContactlessDelivery = () => {
        setIsContactlessDeliveryEnabled(prev => {
            saveSetting('contactlessDelivery', !prev);
            return !prev;
        });
    };

    // Provide state and toggle functions to context consumers
    return (
        <AppSettingsContext.Provider
            value={{
                isDarkModeEnabled,
                toggleDarkMode,
                areNotificationsEnabled,
                toggleNotifications,
                isLocationEnabled,
                toggleLocation,
                isFastDeliveryEnabled,
                toggleFastDelivery,
                isContactlessDeliveryEnabled,
                toggleContactlessDelivery,
            }}
        >
            {children}
        </AppSettingsContext.Provider>
    );
};

