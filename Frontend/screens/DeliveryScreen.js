import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Animated, ImageBackground } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// Sample data for delivery persons with their details and location
export const deliveryPersons = [
    { id: '1', name: 'John Doe', rating: '4.5', image: 'https://via.placeholder.com/150', bio: 'Experienced and reliable.', location: { latitude: 34.8806, longitude: -1.3152 } },
    { id: '2', name: 'Jane Smith', rating: '4.8', image: 'https://via.placeholder.com/150', bio: 'Quick and friendly.', location: { latitude: 34.8806, longitude: -1.3052 } },
];

const DeliveryScreen = ({ navigation }) => {
    const [activePersonId, setActivePersonId] = useState(null); // Currently selected delivery person's ID
    const [activePersonLocation, setActivePersonLocation] = useState(null); // Currently selected delivery person's location

    const fadeAnimation = React.useRef(new Animated.Value(0)).current; // Animation for selected card

    // Handles selection of a delivery person card
    const onSelectPerson = (id, location) => {
        setActivePersonId(id);
        setActivePersonLocation(location);
        Animated.timing(fadeAnimation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    // Renders each delivery person card with their details
    const renderDeliveryPerson = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { opacity: activePersonId === item.id ? fadeAnimation : 1 }]}
            onPress={() => onSelectPerson(item.id, item.location)}
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.rating}>Rating: {item.rating}</Text>
                <Text style={styles.bio}>{item.bio}</Text>
                <TouchableOpacity style={styles.selectButton}>
                    <Text style={styles.buttonText}>Select</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://cdn.openart.ai/uploads/image_3a069UVJ_1726620545717_raw.jpg' }}
                style={styles.background}
            >
                <View style={styles.overlay} />
                <Text style={styles.title}>Select a Delivery Person</Text>
                <FlatList
                    data={deliveryPersons}
                    renderItem={renderDeliveryPerson}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                />
            </ImageBackground>
            {activePersonLocation && (
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: activePersonLocation.latitude,
                        longitude: activePersonLocation.longitude,
                        latitudeDelta: 0.0922, 
                        longitudeDelta: 0.0421,
                    }}
                >
                    {deliveryPersons.map((person) => (
                        <Marker
                            key={person.id}
                            coordinate={person.location}
                            title={person.name}
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
    },
    background: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(66, 75, 84, 0.7)',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fefefe',
        textAlign: 'center',
        marginVertical: 16,
    },
    list: {
        paddingHorizontal: 8,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'rgba(254, 254, 254, 0.8)',
        borderRadius: 10,
        marginBottom: 12,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#424b54',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    image: {
        width: 100,
        height: 100,
    },
    info: {
        flex: 1,
        padding: 12,
    },
    name: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#424b54',
    },
    rating: {
        fontSize: 16,
        color: '#424b54',
        marginVertical: 4,
    },
    bio: {
        fontSize: 14,
        color: '#f8c663',
    },
    selectButton: {
        marginTop: 8,
        backgroundColor: '#f8c663',
        paddingVertical: 8,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#424b54',
        fontWeight: 'bold',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
        height: 300,
    },
});

export default DeliveryScreen;

