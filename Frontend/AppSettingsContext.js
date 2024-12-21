import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const AppSettingsContext = createContext();

export const AppSettingsProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [location, setLocation] = useState(true);
    const [fastDelivery, setFastDelivery] = useState(false);
    const [contactlessDelivery, setContactlessDelivery] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const darkModeSetting = await AsyncStorage.getItem('darkMode');
            const notificationsSetting = await AsyncStorage.getItem('notifications');
            const locationSetting = await AsyncStorage.getItem('location');
            const fastDeliverySetting = await AsyncStorage.getItem('fastDelivery');
            const contactlessDeliverySetting = await AsyncStorage.getItem('contactlessDelivery');

            setDarkMode(darkModeSetting === 'true');
            setNotifications(notificationsSetting !== 'false');
            setLocation(locationSetting !== 'false');
            setFastDelivery(fastDeliverySetting === 'true');
            setContactlessDelivery(contactlessDeliverySetting !== 'false');
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSetting = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => {
            saveSetting('darkMode', !prev);
            return !prev;
        });
    };

    const toggleNotifications = () => {
        setNotifications(prev => {
            saveSetting('notifications', !prev);
            return !prev;
        });
    };

    const toggleLocation = () => {
        setLocation(prev => {
            saveSetting('location', !prev);
            return !prev;
        });
    };

    const toggleFastDelivery = () => {
        setFastDelivery(prev => {
            saveSetting('fastDelivery', !prev);
            return !prev;
        });
    };

    const toggleContactlessDelivery = () => {
        setContactlessDelivery(prev => {
            saveSetting('contactlessDelivery', !prev);
            return !prev;
        });
    };

    return (
        <AppSettingsContext.Provider
            value={{
                darkMode,
                toggleDarkMode,
                notifications,
                toggleNotifications,
                location,
                toggleLocation,
                fastDelivery,
                toggleFastDelivery,
                contactlessDelivery,
                toggleContactlessDelivery,
            }}
        >
            {children}
        </AppSettingsContext.Provider>
    );
};
