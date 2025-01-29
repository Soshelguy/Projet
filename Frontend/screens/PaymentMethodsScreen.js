/**
 * PaymentMethodsScreen
 * 
 * This screen displays the user's payment methods.
 * Currently, it only shows a placeholder message
 * explaining that the payment methods will be listed here.
 * 
 * @returns {ReactElement} - The component
 */
import { StyleSheet } from 'react-native'; // <--- Add this line

const PaymentMethodsScreen = () => {
    const { isDarkMode } = useContext(AppSettingsContext);

    return (
        <ScrollView style={[styles.container, isDarkMode && styles.darkModeContainer]}>
            <Text style={[styles.title, isDarkMode && styles.darkModeText]}>Payment Methods</Text>
            <View style={styles.placeholderContent}>
                <Text style={[styles.placeholderText, isDarkMode && styles.darkModeText]}>
                    Your payment methods will be listed here.
                </Text>
                <Text style={[styles.placeholderSubtext, isDarkMode && styles.darkModeText]}>
                    Add a payment method to get started!
                </Text>
            </View>
        </ScrollView>
    );
};

/**
 * Styles for the PaymentMethodsScreen component.
 */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA', // Light mode background
        padding: 20,
    },
    darkModeContainer: {
        backgroundColor: '#1E2541', // Darker background for better contrast
    },
    title: {
        fontSize: 24, // Larger font size for the title
        fontWeight: '600', // Medium font weight for the title
        color: '#1F654C', // Default text color for light mode
        marginBottom: 20, // Space between title and placeholder content
    },
    darkModeText: {
        color: '#A5F1E9', // White for dark mode
    },
    placeholderContent: {
        flex: 1, // Take up all available space
        justifyContent: 'center', // Center the content vertically
        alignItems: 'center', // Center the content horizontally
        marginTop: 50, // Space between placeholder content and the title
    },
    placeholderText: {
        fontSize: 18, // Slightly larger font size for the placeholder text
        color: '#333', // Default text color for light mode
        textAlign: 'center', // Center the text horizontally
        marginBottom: 10, // Space between placeholder text and subtext
    },
    placeholderSubtext: {
        fontSize: 16, // Smaller font size for the placeholder subtext
        color: '#666', // Slightly lighter text color for the subtext
        textAlign: 'center', // Center the text horizontally
    },
});

export default PaymentMethodsScreen;

