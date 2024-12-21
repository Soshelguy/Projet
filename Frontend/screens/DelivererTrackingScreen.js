import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const DelivererTrackingScreen = ({ route }) => {
    const { delivererId } = route.params;
    const [deliverer, setDeliverer] = useState(null);
    const [userLocation, setUserLocation] = useState({
        latitude: 37.78825, 
        longitude: -122.4324,
    });

    useEffect(() => {
        axios.get(`https://8b7f-41-100-123-0.ngrok-free.app/deliverers/${delivererId}`)
            .then(response => {
                setDeliverer(response.data);
            })
            .catch(error => {
                console.error(error);
            });
    }, [delivererId]);

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
            >
                <Marker coordinate={userLocation} title="Your Location" />
                {deliverer && (
                    <Marker
                        coordinate={{ latitude: deliverer.latitude, longitude: deliverer.longitude }}
                        title={deliverer.name}
                    />
                )}
            </MapView>

            {deliverer && (
                <View style={styles.details}>
                    <Text style={styles.header}>Deliverer Details</Text>
                    <Text>Name: {deliverer.name}</Text>
                    <Text>Contact: {deliverer.contact}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '80%',
    },
    details: {
        padding: 16,
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});

export default DelivererTrackingScreen;
