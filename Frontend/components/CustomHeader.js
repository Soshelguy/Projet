/**
 * A custom header component with a gradient background and two 
 * overlapping SVG circles creating a bubble effect.
 * 
 * @param {string} title - The title to display in the header.
 * @returns {React.ReactElement} - The custom header component.
 */
const CustomHeader = ({ title }) => {
    return (
        <View style={styles.container}>
            {/* Gradient background */}
            <LinearGradient
                colors={['#424b54', '#f8c663']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            />
            {/* Bubble 1 */}
            <Svg height="80" width="80" style={styles.bubble1}>
                <Circle cx="40" cy="40" r="40" fill="#f8c663" opacity="0.3" />
            </Svg>
            {/* Bubble 2 */}
            <Svg height="60" width="60" style={styles.bubble2}>
                <Circle cx="30" cy="30" r="30" fill="#424b54" opacity="0.5" />
            </Svg>
            {/* Title */}
            <Text style={styles.title}>{title}</Text>
        </View>
    );
};

/**
 * Stylesheet for the custom header component.
 */
const styles = StyleSheet.create({
    container: {
        height: 100, // Increase height if needed
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#424b54',
        overflow: 'hidden', // Prevent overflow outside the header area
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    bubble1: {
        position: 'absolute',
        top: -10, // Adjust to keep it inside the header
        left: -20, // Adjust to keep it inside the header
    },
    bubble2: {
        position: 'absolute',
        bottom: -10, // Adjust to keep it inside the header
        right: -20, // Adjust to keep it inside the header
    },
    title: {
        color: '#fefefe',
        fontSize: 24,
        fontWeight: 'bold',
    },
});

export default CustomHeader;

