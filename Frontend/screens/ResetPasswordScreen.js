import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ResetPasswordScreen = ({ navigation, route }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const { token } = route.params;

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }

        try {
            const response = await fetch(`https://8b7f-41-100-123-0.ngrok-free.app/api/reset-password/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to reset password.');
            }

            const data = await response.json();

            Alert.alert('Success', 'Password has been reset successfully.');
            navigation.navigate('Auth');
        } catch (error) {
            console.error('Error resetting password:', error);
            Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E2541" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#A5F1E9" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reset Password</Text>
            </View>
            <Text style={styles.subtitle}>Enter your new password.</Text>

            <View style={styles.inputContainer}>
                <Icon name="lock-closed" size={20} color="#A5F1E9" style={styles.icon} />
                <TextInput 
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock-closed" size={20} color="#A5F1E9" style={styles.icon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            <TouchableOpacity 
                style={styles.button} 
                onPress={handleResetPassword}
            >
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Remembered your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
                    <Text style={[styles.footerText, styles.linkText]}>Log In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2541',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#A5F1E9',
        marginLeft: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#A5F1E9',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        borderRadius: 10,
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#fff',
    },
    button: {
        height: 50,
        backgroundColor: '#A5F1E9',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    buttonText: {
        color: '#2C2C2C',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
    },
    footerText: {
        color: '#A5F1E9',
        fontSize: 14,
    },
    linkText: {
        fontWeight: 'bold',
    },
});

export default ResetPasswordScreen;