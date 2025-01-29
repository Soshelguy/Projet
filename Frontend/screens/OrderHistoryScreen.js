/**
 * OrderHistoryScreen component displays the order history of the user.
 * This component is a placeholder and doesn't fetch any data yet.
 * It only displays a message to the user to check back after making some orders.
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AppSettingsContext } from '../AppSettingsContext';

/**
 * Render the OrderHistoryScreen component.
 */
const OrderHistoryScreen = () => {
    const { isDarkMode } = useContext(AppSettingsContext);

    return (
        <ScrollView style={[styles.container, isDarkMode && styles.darkModeContainer]}>
            <Text style={[styles.title, isDarkMode && styles.darkModeText]}>Order History</Text>
            <View style={styles.placeholderContent}>
                <Text style={[styles.placeholderText, isDarkMode && styles.darkModeText]}>
                    Your order history will be displayed here.
                </Text>
                <Text style={[styles.placeholderSubtext, isDarkMode && styles.darkModeText]}>
                    Check back after you've made some orders!
                </Text>
            </View>
        </ScrollView>
    );
};

/**
 * Styles for the OrderHistoryScreen component.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA',
        padding: 20,
    },
    darkModeContainer: {
        backgroundColor: '#1E2541',
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#1F654C',
        marginBottom: 20,
    },
    darkModeText: {
        color: '#A5F1E9',
    },
    placeholderContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    placeholderText: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    placeholderSubtext: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default OrderHistoryScreen;
