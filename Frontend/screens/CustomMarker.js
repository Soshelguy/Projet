import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const CustomMarker = ({ coordinate, name }) => (
    <Marker coordinate={coordinate}>
        <View style={styles.markerContainer}>
            <Image
                style={styles.markerImage}
            />
            <Text style={styles.markerText}>{name}</Text>
        </View>
    </Marker>
);

const styles = StyleSheet.create({
    markerContainer: {
        alignItems: 'center',
    },
    markerImage: {
        width: 40, 
        height: 40, 
    },
    markerText: {
        fontSize: 12,
        color: 'black',
        marginTop: 4,
    },
});

export default CustomMarker;
