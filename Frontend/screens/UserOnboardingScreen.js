import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://8b7f-41-100-123-0.ngrok-free.app';

const UserOnboardingScreen = ({ route, navigation }) => {
    const { tempCredentials } = route.params;
    const { login, generateToken } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
        profileImage: null,
    });

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
                    setFormData(prev => ({
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
    
    const handleSubmit = async () => {
        if (!formData.fullName || !formData.phone || !formData.address) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
    
        try {
            const formDataObj = new FormData();
            
            formDataObj.append('email', tempCredentials.email);
            formDataObj.append('password', tempCredentials.password);
            formDataObj.append('fullName', formData.fullName);
            formDataObj.append('phone', formData.phone);
            formDataObj.append('address', formData.address);
    
            if (formData.profileImage) {
    const imageUri = formData.profileImage;
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
                {formData.profileImage ? (
                    <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
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
                    value={formData.fullName}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="#888888"
                    value={formData.phone}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                />
                <TextInput
                    style={[styles.input, styles.addressInput]}
                    placeholder="Address"
                    placeholderTextColor="#888888"
                    value={formData.address}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
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