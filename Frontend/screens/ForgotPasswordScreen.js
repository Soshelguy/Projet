import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleResetPassword = async () => {
        try {
            const response = await fetch('https://8b7f-41-100-123-0.ngrok-free.app/api/forgot-password', { // Replace with your API URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", "Check your email for a password reset link.");
                navigation.navigate('Auth'); 
            } else {
                Alert.alert("Error", data.message || "An error occurred. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.overlay}>
                <Text style={styles.title}>Forgot Password</Text>
                <Text style={styles.subtitle}>Enter your email to reset your password.</Text>
                
                {/* Email Input */}
                <View style={styles.inputContainer}>
                    <TextInput 
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#B0B0B0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleResetPassword}
                >
                    <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Remembered your password? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
                        <Text style={[styles.footerText, styles.linkText]}>Log In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
    },
    title: {
        fontSize: 28,
        color: '#424b54',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 25,
        paddingHorizontal: 16,
        marginBottom: 16,
        elevation: 2,
    },
    input: {
        height: 50,
        flex: 1,
        fontSize: 16,
        paddingHorizontal: 10,
    },
    button: {
        height: 50,
        width: '100%',
        backgroundColor: '#f8c663',
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        marginTop: 16,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    footerText: {
        color: '#424b54',
        fontSize: 14,
    },
    footerText1: {
        color: '#009688',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;
