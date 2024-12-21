import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import MapView from 'react-native-maps';
import CustomMarker from './CustomMarker'; 
import { deliveryPersons } from '../screens/DeliveryScreen'; 

const OrderTrackingScreen = () => {
    const [loading, setLoading] = useState(true);

    const initialRegion = {
        latitude: 34.8806, 
        longitude: -1.3152, 
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    };

    useEffect(() => {
        setTimeout(() => setLoading(false), 1000); 
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
            ) : (
                <MapView
                    style={styles.map}
                    initialRegion={initialRegion}
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
        ...StyleSheet.absoluteFillObject,
    },
    loader: {
        position: 'absolute',
        top: '50%',
    },
});

export default OrderTrackingScreen;
