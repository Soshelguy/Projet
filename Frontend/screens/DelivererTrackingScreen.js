/**
 * DelivererTrackingScreen.js
 * 
 * This screen shows a map of the user's location and the location of the selected deliverer.
 * It fetches the deliverer's details from the backend when the screen is mounted.
 * If the deliverer is found, it displays their name, contact, and a marker on the map
 * at their location.
 * If the deliverer is not found, it displays an error message.
 * 
 * @param {Object} route - The route object passed from the navigator.
 * @param {String} route.params.delivererId - The id of the deliverer to track.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';

const DelivererTrackingScreen = ({ route }) => {
    const delivererId = route.params.delivererId;
    const [delivererDetails, setDelivererDetails] = useState(null);
    const [userLocation, setUserLocation] = useState({
        latitude: 37.78825, // Default to SF
        longitude: -122.4324,
    });

    /**
     * Fetch the deliverer's details from the backend when the screen is mounted.
     * If the deliverer is found, set the delivererDetails state to the response.
     * If the deliverer is not found, log an error to the console.
     */
    useEffect(() => {
        axios.get(`https://cf8f-197-203-19-175.ngrok-free.app/deliverers/${delivererId}`)
            .then(response => {
                setDelivererDetails(response.data);
            })
            .catch(error => {
                console.error(`Error fetching deliverer with id ${delivererId}`, error);
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
                {delivererDetails && (
                    <Marker
                        coordinate={{ latitude: delivererDetails.latitude, longitude: delivererDetails.longitude }}
                        title={delivererDetails.name}
                    />
                )}
            </MapView>

            {delivererDetails && (
                <View style={styles.details}>
                    <Text style={styles.header}>Deliverer Details</Text>
                    <Text>Name: {delivererDetails.name}</Text>
                    <Text>Contact: {delivererDetails.contact}</Text>
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

