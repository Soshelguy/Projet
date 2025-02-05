import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from 'react-native';

// Create AuthContext for managing authentication state
const AuthContext = createContext();
const API_URL = 'http://192.168.1.2:5000'; 

// Provide authentication-related functionality to components
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null); // Stores current user info
    const [loading, setLoading] = useState(true); // Loading state for async operations
    const [userRole, setUserRole] = useState('CLIENT'); // Default role
    const [authToken, setAuthToken] = useState(null); // Authentication token

    const [user, setUser] = useState(null); // User state
    const [tempUser, setTempUser] = useState(null); // Temporary user data, if needed

    // Load user and token from storage, validate token, and fetch user profile
    const loadStoredUser = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('authToken');
      
            if (storedToken) {
                try {
                    // Validate token with backend
                    const response = await fetch(`${API_URL}/api/auth/validate-token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${storedToken}`,
                        },
                    });
              
                    if (response.ok) {
                        setAuthToken(storedToken);

                        // Fetch the latest user profile
                        const profileResponse = await fetch(`${API_URL}/api/users/profile`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${storedToken}`,
                            },
                        });

                        if (profileResponse.ok) {
                            const profileData = await profileResponse.json();
                            setUser(profileData);
                        } else {
                            // Failed to fetch profile data
                            await logout();
                        }
                    } else {
                        // Token is invalid, clear storage
                        await logout();
                    }
                } catch (validationError) {
                    console.error('Token validation error:', validationError);
                    await logout();
                }
            } else {
                setLoading(false); // No token found, loading complete
            }
        } catch (error) {
            console.error('Error loading stored user:', error);
        } finally {
            setLoading(false); // Ensure loading is set to false
        }
    };

    useEffect(() => {
        loadStoredUser();
    }, []);

    // Log in a user and store their data in AsyncStorage
    const login = async (userData) => {
        try {
            const token = userData.token || userData.authToken || 
                await generateToken(userData);

            // Store the token and user data
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('user', JSON.stringify({
                id: userData.id,
                email: userData.email,
                name: userData.fullName,
                phone: userData.phone,
                address: userData.address,
                profileImage: userData.profileImageUrl
            }));

            // Set user and token in context
            setUser({
                id: userData.id,
                email: userData.email,
                name: userData.fullName,
                phone: userData.phone,
                address: userData.address,
                profileImage: userData.profileImageUrl
            });
            setAuthToken(token);
            setUserRole(userData.role || 'CLIENT');

            return { success: true };
        } catch (error) {
            console.error('Error during login:', error);
            throw error;
        }
    };

    // Generate a token for a user
    const generateToken = async (userData) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/generate-token`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
                },
                body: JSON.stringify({
                    userId: userData.id || userData.userId,
                    email: userData.email
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate token');
            }

            const data = await response.json();
            return data.token;
        } catch (error) {
            console.error('Token generation error:', error);
            throw error;
        }
    };

    // Log out the user and clear data from AsyncStorage
    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['authToken', 'user']);
            setUser(null);
            setAuthToken(null);
            setUserRole('CLIENT');
            return { success: true };
        } catch (error) {
            console.error('Error during logout:', error);
            return { success: false };
        }
    };

    // Apply for deliverer role
    const becomeDeliverer = async () => {
        try {
            const response = await fetch(`${API_URL}/api/deliverer/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id })
            });

            const textResponse = await response.text();
            const data = response.headers.get("content-type")?.includes("application/json") ? JSON.parse(textResponse) : null;

            if (data?.success) {
                setUser(prev => ({ ...prev, deliverer_application_status: 'PENDING' }));
            }

            return data || { success: false, message: 'Unexpected response format' };
        } catch (error) {
            console.error('Error becoming deliverer:', error);
            return { success: false, message: 'Failed to submit application' };
        }
    };

    // Apply for service provider role
    const becomeServiceProvider = async () => {
        try {
            const response = await fetch(`${API_URL}/api/request-service-provider`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await response.json();

            if (data.success) {
                setUser(prev => ({ 
                    ...prev, 
                    service_provider_request: 'PENDING' 
                }));
            }

            return data;
        } catch (error) {
            console.error('Error becoming service provider:', error);
            return { success: false, message: 'Failed to submit application' };
        }
    };

    // Apply for catering business role
    const becomeCateringBusiness = async () => {
        try {
            const response = await fetch(`${API_URL}/api/request-catering-business`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await response.json();

            if (data.success) {
                setUser(prev => ({ 
                    ...prev, 
                    catering_business_request: 'PENDING' 
                }));
            }

            return data;
        } catch (error) {
            console.error('Error becoming catering business:', error);
            return { success: false, message: 'Failed to submit application' };
        }
    };

    // Update user information in AsyncStorage
    const updateUser = async (userData) => {
        try {
            const updatedUser = { ...currentUser, ...userData };
            await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            if (userData.role) {
                setUserRole(userData.role);
            }
            return { success: true };
        } catch (error) {
            console.error('Error updating user data:', error);
            return { success: false, error };
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            tempUser,
            setUser,
            setTempUser,
            currentUser,
            login,
            logout,
            updateUser,
            loading,
            userRole,
            becomeDeliverer,
            becomeServiceProvider,
            becomeCateringBusiness,
            authToken, 
            generateToken,
        }}>
            {loading ? (
                <Text>Loading...</Text> 
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

// Hook to use authentication-related functionality
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;

