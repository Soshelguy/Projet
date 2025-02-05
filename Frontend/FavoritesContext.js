// FavoritesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

// Create a context for managing favorite services
const FavoritesContext = createContext();

// Provider component to manage and supply favorite services to the application
export const FavoritesProvider = ({ children }) => {
    const [favoriteServices, setFavoriteServices] = useState([]); // State to store user's favorite services
    const { currentUser } = useAuth(); // Get current user from auth context

    // Load favorites when the current user changes
    useEffect(() => {
        if (currentUser) {
            loadFavoriteServices();
        }
    }, [currentUser]);

    // Function to load favorite services from AsyncStorage
    const loadFavoriteServices = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem(`favorites_${currentUser.id}`);
            if (storedFavorites) {
                setFavoriteServices(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorite services:', error);
        }
    };

    // Check if a service is marked as favorite
    const isServiceFavorite = (serviceId) => {
        return favoriteServices.includes(serviceId);
    };

    // Toggle the favorite status of a service
    const toggleFavoriteService = async (serviceId) => {
        if (!currentUser) {
            Alert.alert('Error', 'Please login to manage favorites');
            return;
        }
        try {
            let updatedFavorites;
            if (favoriteServices.includes(serviceId)) {
                // Remove from favorites
                updatedFavorites = favoriteServices.filter(id => id !== serviceId);
            } else {
                // Add to favorites
                updatedFavorites = [...favoriteServices, serviceId];
            }
            
            // Persist changes to AsyncStorage
            await AsyncStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(updatedFavorites));
            setFavoriteServices(updatedFavorites);
            
            // Sync changes with server
            await fetch('http://192.168.1.2:5000/api/favorites/toggle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    serviceId: serviceId
                }),
            });
        } catch (error) {
            console.error('Error updating favorite services:', error);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favoriteServices, isServiceFavorite, toggleFavoriteService }}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Custom hook to access the favorites context
export const useFavorites = () => {
    return useContext(FavoritesContext);
};
