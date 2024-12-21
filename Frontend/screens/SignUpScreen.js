import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';

const SignUpScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleContinue = () => {
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        navigation.navigate('UserOnboarding', { tempCredentials: { email, password } });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E2541" />
            <Text style={styles.title}>Sign Up</Text>
            <Text style={styles.subtitle}>Create an account to get started!</Text>
            
            {/* Input Fields */}
            <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color="#A5F1E9" style={styles.icon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#888888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#A5F1E9" style={styles.icon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#888888"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
            </View>

            <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#A5F1E9" style={styles.icon} />
                <TextInput 
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor="#888888"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleContinue}>
                <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
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
        color: '#FFFFFF',
        marginBottom: 30,
        textAlign: 'center',
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
        color: '#FFFFFF',
        fontSize: 14,
    },
    linkText: {
        color: '#A5F1E9',
        fontWeight: 'bold',
    },
});

export default SignUpScreen;