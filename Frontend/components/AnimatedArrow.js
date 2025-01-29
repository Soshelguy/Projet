/**
 * AnimatedArrow component that animates an arrow when pressed.
 * 
 * @returns A TouchableOpacity that animates an arrow when pressed.
 */
const AnimatedArrow = () => {
    const animation = useRef(new Animated.Value(0)).current; // Animation value

    /**
     * Animate the arrow by rotating it 180 degrees over 300ms.
     */
    const animate = () => {
        Animated.timing(animation, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            animation.setValue(0); // Reset after animation
        });
    };

    /**
     * Calculate the rotation transformation based on the animation value.
     * @returns An object with a single transformation (rotate) based on the animation value.
     */
    const getArrowStyle = () => ({
        transform: [{
            rotate: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '180deg'], // Rotate 180 degrees
            }),
        }],
    });

    return (
        <TouchableOpacity onPress={animate}>
            <Animated.View style={getArrowStyle()}>
                <Text style={styles.arrow}>←</Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

/**
 * Styles for the arrow.
 */
const styles = StyleSheet.create({
    arrow: {
        fontSize: 24,
        color: '#424b54',
    },
});

export default AnimatedArrow;

