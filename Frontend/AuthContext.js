
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from 'react-native';

const AuthContext = createContext();
const API_URL = 'https://8b7f-41-100-123-0.ngrok-free.app'; 

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('CLIENT');
    const [authToken, setAuthToken] = useState(null);

    const [user, setUser] = useState(null);
    const [tempUser, setTempUser] = useState(null);

    
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
            setLoading(false);
          }
        } catch (error) {
          console.error('Error loading stored user:', error);
        } finally {
          setLoading(false);
        }
      };
      
      useEffect(() => {
        loadStoredUser();
      }, []);


    const login = async (userData) => {
        try {
            // Ensure we have a token
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

    const becomeDeliverer = async () => {
        try {
            const response = await fetch(`${API_URL}/api/deliverer/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.id })
            });
    
            console.log('Status:', response.status); 
            console.log('Headers:', response.headers); 
            const textResponse = await response.text();
            console.log('Raw response:', textResponse);
    
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
    const approveDelivererRequest = async (req, res) => {
        try {
            const { userId } = req.body;
            
            await pool.query(
                'UPDATE users SET role = $1, deliverer_request = FALSE WHERE id = $2',
                ['DELIVERER', userId]
            );
    
            return res.status(200).json({
                success: true,
                message: 'Deliverer request approved successfully'
            });
        } catch (error) {
            console.error('Error in approveDelivererRequest:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    };

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

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthProvider;
