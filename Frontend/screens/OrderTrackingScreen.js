import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView from 'react-native-maps';
import CustomMarker from './CustomMarker'; 
import { deliveryPersons } from '../screens/DeliveryScreen'; 

const OrderTrackingScreen = () => {
    const [isLoading, setIsLoading] = useState(true); // State to manage loading indicator

    // Initial region for the map view, centered around a specific location
    const mapInitialRegion = {
        latitude: 34.8806, 
        longitude: -1.3152, 
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    useEffect(() => {
        // Simulate a network request or heavy computation
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }, []);

    return (
        <View style={styles.container}>
            {isLoading ? (
                // Show loading indicator while data is being "fetched"
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                // Display the map with markers for each delivery person once loading is complete
                <MapView
                    style={styles.map}
                    initialRegion={mapInitialRegion}
                >
                    {deliveryPersons.map((person) => (
                        <CustomMarker
                            key={person.id}
                            coordinate={person.location}
                            name={person.name}
                        />
                    ))}
                </MapView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject, // Make the map fill the container
    },
    loader: {
        position: 'absolute',
        top: '50%',
    },
});

export default OrderTrackingScreen;

