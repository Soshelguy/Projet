import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const DelivererSelectionScreen = ({ navigation }) => {
    const deliverers = [
        { id: '1', name: 'Deliverer 1', latitude: 37.78825, longitude: -122.4324 },
        { id: '2', name: 'Deliverer 2', latitude: 37.78845, longitude: -122.4344 },
    ];

    const handleSelectDeliverer = (deliverer) => {
        navigation.navigate('OrderTrackingScreen', {
            deliverer,
            orderId: '12345', 
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select a Deliverer</Text>
            <MapView style={styles.map} initialRegion={{
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }}>
                {deliverers.map((deliverer) => (
                    <Marker
                        key={deliverer.id}
                        coordinate={{ latitude: deliverer.latitude, longitude: deliverer.longitude }}
                        title={deliverer.name}
                        onPress={() => handleSelectDeliverer(deliverer)}
                    />
                ))}
            </MapView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        margin: 16,
    },
    map: {
        flex: 1,
    },
});

export default DelivererSelectionScreen;
