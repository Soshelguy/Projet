import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderConfirmationScreen = ({ route }) => {
    const { orderItems, deliverer } = route.params || {};

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Order Confirmation</Text>
            <Text>Deliverer: {deliverer ? deliverer.name : 'N/A'}</Text>
            {/* Render order items here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default OrderConfirmationScreen;
