/**
 * UserOnboardingScreen.js
 * This screen is shown after the user completes the email and password registration
 * It collects the user's full name, phone number, address, and profile image
 * It sends a POST request to the server to register the user
 * If the request is successful, it logs the user in and navigates to the main screen
 * If the request fails, it shows an error message
 * 
 * @param {object} route - The route object from React Navigation
 * @param {object} navigation - The navigation object from React Navigation
 * @returns {ReactElement} - The UserOnboardingScreen component
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The API URL for the server
 * @type {string}
 */
const API_URL = 'https://cf8f-197-203-19-175.ngrok-free.app';

/**
 * The UserOnboardingScreen component
 * @param {object} props - The props object
 * @returns {ReactElement} - The UserOnboardingScreen component
 */
const UserOnboardingScreen = ({ route, navigation }) => {
    const { tempCredentials } = route.params;
    const { login, generateToken } = useAuth();
    const [userFormData, setUserFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        profileImage: null,
    });

    /**
     * Launches the image picker to select a profile image
     */
    const pickImage = async () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 800,
            maxWidth: 800,
        };
    
        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets[0].uri) {
                const imageUri = response.assets[0].uri;
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
    
                const formData = new FormData();
                formData.append('profileImage', {
                    uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
                    type: type,
                    name: filename
                });
    
                try {
                    setUserFormData(prev => ({
                        ...prev,
                        profileImage: imageUri // Store URI temporarily for display
                    }));
                } catch (error) {
                    console.error('Error handling image:', error);
                    Alert.alert('Error', 'Failed to process image');
                }
            }
        });
    };
    
    /**
     * Handles the form submission and sends a POST request to the server
     */
    const handleSubmit = async () => {
        if (!userFormData.fullName || !userFormData.phone || !userFormData.address) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
    
        try {
            const formDataObj = new FormData();
            
            formDataObj.append('email', tempCredentials.email);
            formDataObj.append('password', tempCredentials.password);
            formDataObj.append('fullName', userFormData.fullName);
            formDataObj.append('phone', userFormData.phone);
            formDataObj.append('address', userFormData.address);
    
            if (userFormData.profileImage) {
                const imageUri = userFormData.profileImage;
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                formDataObj.append('profileImage', {
                    uri: imageUri,
                    name: filename,
                    type,
                });
            }
            
            const response = await fetch(`${API_URL}/api/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                body: formDataObj,
            });

            // Log the raw response for debugging
            const responseText = await response.text();
            console.log('Raw Response:', responseText);

            // Try to parse the response
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Failed to parse response:', parseError);
                throw new Error('Invalid server response');
            }

            if (!response.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            // Ensure we have a token
            const authToken = data.authToken || 
                await generateToken({
                    id: data.user.id, 
                    email: data.user.email
                });

            // Prepare user data for login
            const userData = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.full_name,
                phone_number: data.user.phone,
                address: data.user.address,
                profile_image_url: data.user.profileImageUrl,
                token: authToken
            };
    
            // Use the login method from AuthContext
            await login(userData);
    
            navigation.replace('Main'); // Navigate to the main screen
    
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert('Error', error.message || 'Failed to complete registration. Please try again.');
        }
    };
    
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Let's get to know you better</Text>

            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                {userFormData.profileImage ? (
                    <Image source={{ uri: userFormData.profileImage }} style={styles.profileImage} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Icon name="camera" size={40} color="#666" />
                        <Text style={styles.uploadText}>Upload Photo</Text>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#888888"
                    value={userFormData.fullName}
                    onChangeText={(text) => setUserFormData(prev => ({ ...prev, fullName: text }))}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#888888"
                    value={userFormData.phone}
                    onChangeText={(text) => setUserFormData(prev => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={[styles.input, styles.addressInput]}
                    placeholder="Address"
                    placeholderTextColor="#888888"
                    value={userFormData.address}
                    onChangeText={(text) => setUserFormData(prev => ({ ...prev, address: text }))}
                    multiline
                />

                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                    <Text style={styles.buttonText}>Complete Profile</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2541',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#A5F1E9',
        textAlign: 'center',
        marginTop: 60,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 30,
    },
    imageContainer: {
        alignSelf: 'center',
        marginBottom: 30,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    placeholderImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#2C2C2C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadText: {
        color: '#666',
        marginTop: 10,
    },
    form: {
        marginTop: 20,
    },
    input: {
        backgroundColor: '#2C2C2C',
        borderRadius: 25,
        padding: 15,
        marginBottom: 15,
        color: '#FFFFFF',
        fontSize: 16,
    },
    addressInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#A5F1E9',
        borderRadius: 25,
        padding: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#1E2541',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default UserOnboardingScreen;


