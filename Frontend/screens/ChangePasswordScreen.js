import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const API_URL = 'https://8b7f-41-100-123-0.ngrok-free.app';

const ChangePasswordScreen = ({ navigation }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        let newErrors = {};
        if (!currentPassword) newErrors.currentPassword = "Current password is required";
        if (!newPassword) newErrors.newPassword = "New password is required";
        if (newPassword.length < 8) newErrors.newPassword = "Password must be at least 8 characters long";
        if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChangePassword = async () => {
        if (!validateForm()) return;

        setLoading(true);
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
            setLoading(false);
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
                    {errors.currentPassword && <Text style={styles.errorText}>{errors.currentPassword}</Text>}

                    <TextInput
                        style={styles.input}
                        placeholder="New Password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}

                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        placeholderTextColor="#888"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                    <TouchableOpacity
                        style={styles.changePasswordButton}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        <Text style={styles.changePasswordButtonText}>
                            {loading ? 'Changing...' : 'Change Password'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

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