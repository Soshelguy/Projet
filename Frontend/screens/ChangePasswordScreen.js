import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Base URL for API requests
const API_URL = 'https://cf8f-197-203-19-175.ngrok-free.app';

// Main component for the Change Password screen
const ChangePasswordScreen = ({ navigation }) => {
    // State variables for form inputs and loading state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    // Function to validate the form input
    const validateFormInput = () => {
        let validationErrors = {};
        if (!currentPassword) validationErrors.currentPassword = "Current password is required";
        if (!newPassword) validationErrors.newPassword = "New password is required";
        if (newPassword.length < 8) validationErrors.newPassword = "Password must be at least 8 characters long";
        if (newPassword !== confirmPassword) validationErrors.confirmPassword = "Passwords do not match";
        setFormErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    // Function to handle the password change logic
    const handlePasswordChange = async () => {
        if (!validateFormInput()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/users/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to change password');
            }

            Alert.alert('Success', 'Password changed successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Error', `Failed to change password: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#A5F1E9" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.form}>
                    <TextInput
                        style={styles.input}
                        placeholder="Current Password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                    />
                    {formErrors.currentPassword && <Text style={styles.errorText}>{formErrors.currentPassword}</Text>}

                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    {formErrors.newPassword && <Text style={styles.errorText}>{formErrors.newPassword}</Text>}

                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    {formErrors.confirmPassword && <Text style={styles.errorText}>{formErrors.confirmPassword}</Text>}

                    <TouchableOpacity
                        style={styles.changePasswordButton}
                        onPress={handlePasswordChange}
                        disabled={isLoading}
                    >
                        <Text style={styles.changePasswordButtonText}>
                            {isLoading ? 'Changing...' : 'Change Password'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// Styles for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2541',
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        marginBottom: 20,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#A5F1E9',
    },
    form: {
        backgroundColor: '#2C2C2C',
        padding: 16,
        borderRadius: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#A5F1E9',
        borderRadius: 4,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        color: '#fff',
        backgroundColor: '#1F654C',
    },
    errorText: {
        color: '#FF6B6B',
        marginBottom: 8,
    },
    changePasswordButton: {
        backgroundColor: '#A5F1E9',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 16,
    },
    changePasswordButtonText: {
        color: '#1F654C',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ChangePasswordScreen;
