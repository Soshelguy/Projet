import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, generateToken } = useAuth(); 


    const handleLogin = async () => {
        try {
            const response = await fetch('https://8b7f-41-100-123-0.ngrok-free.app/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
            const data = await response.json();
    
            if (response.ok) {
                // Ensure we have a token
                const authToken = data.token || 
                    await generateToken({
                        userId: data.user.id, 
                        email: data.user.email
                    });
    
                // Prepare user data for login
                const userData = {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    phone_number: data.user.phone_number,
                    address: data.user.address,
                    profile_image_url: data.user.profile_image_url,
                    token: authToken
                };
    
                // Use the login method from AuthContext
                await login(userData);
                navigation.navigate('Main');
            } else {
                Alert.alert('Login Failed', data.message || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            Alert.alert('Login Failed', 'An error occurred. Please try again later.');
        }
    };
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E2541" />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to your account</Text>

            <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color="#A5F1E9" style={styles.icon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#888888"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            
            <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#A5F1E9" style={styles.icon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#888888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.footerText}>Forgot Password?</Text>
                </TouchableOpacity>
                <Text style={styles.footerText}> | </Text>
                <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.footerText}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1E2541',
        padding: 20,
    },
    title: {
        fontSize: 28,
        color: '#A5F1E9',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#A5F1E9',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        borderRadius: 25,
        paddingHorizontal: 16,
        marginBottom: 16,
        width: '100%',
    },
    input: {
        height: 50,
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        paddingHorizontal: 10,
    },
    icon: {
        marginRight: 10,
    },
    button: {
        height: 50,
        width: '100%',
        backgroundColor: '#A5F1E9',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#1E2541',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    footerText: {
        color: '#A5F1E9',
        fontSize: 14,
    },
});

export default AuthScreen;