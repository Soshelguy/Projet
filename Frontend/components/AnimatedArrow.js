import React, { useRef } from 'react';
import { Animated, TouchableOpacity, Text, StyleSheet } from 'react-native';

const AnimatedArrow = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    const animateArrow = () => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            animatedValue.setValue(0); // Reset after animation
        });
    };

    const arrowStyle = {
        transform: [{
            rotate: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'], // Change this to desired animation
            }),
        }],
    };

    return (
        <TouchableOpacity onPress={animateArrow}>
            <Animated.View style={arrowStyle}>
                <Text style={styles.arrow}>←</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    arrow: {
        fontSize: 24,
        color: '#424b54',
    },
});

export default AnimatedArrow;
