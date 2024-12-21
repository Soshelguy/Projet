// FavoritesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            loadFavorites();
        }
    }, [currentUser]);

    const loadFavorites = async () => {
        try {
            const storedFavorites = await AsyncStorage.getItem(`favorites_${currentUser.id}`);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
    };

    const checkIfFavorite = (serviceId) => {
        return favorites.includes(serviceId);
    };

    const toggleFavorite = async (serviceId) => {
        if (!user) {
            Alert.alert('Error', 'Please login to add favorites');
            return;
        }
        try {
            let newFavorites;
            if (favorites.includes(serviceId)) {
                newFavorites = favorites.filter(id => id !== serviceId);
            } else {
                newFavorites = [...favorites, serviceId];
            }
            
            await AsyncStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(newFavorites));
            setFavorites(newFavorites);
            
            try {
                await fetch('https://8b7f-41-100-123-0.ngrok-free.app/api/favorites/toggle', {
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
                console.error('Error syncing favorites with server:', error);
            }
        } catch (error) {
            console.error('Error updating favorites:', error);
        }
    };

    return (
        <FavoritesContext.Provider value={{ favorites, checkIfFavorite, toggleFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    return useContext(FavoritesContext);
};