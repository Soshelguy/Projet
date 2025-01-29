/**
 * OrderConfirmationScreen.js
 * This screen is displayed after the user places an order.
 * It displays the order details, including the deliverer's name.
 * @param {object} route - The route object passed from the navigator.
 * @param {object} route.params - The route parameters object.
 * @param {object[]} route.params.orderItems - The order items array.
 * @param {object} route.params.deliverer - The deliverer object.
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Function component that renders the order confirmation screen.
 * @param {object} props - The component props object.
 * @param {object} props.route - The route object passed from the navigator.
 * @returns {React.ReactElement} The JSX element representing the order confirmation screen.
 */
const OrderConfirmationScreen = ({ route }) => {
    const { orderItems, deliverer } = route.params || {};
    const delivererName = deliverer ? deliverer.name : 'N/A';

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Order Confirmation</Text>
            <Text>Deliverer: {delivererName}</Text>
            {/* Render order items here */}
        </View>
    );
};

/**
 * Stylesheet object that defines the styles for the order confirmation screen.
 */
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

