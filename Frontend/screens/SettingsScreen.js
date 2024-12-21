import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Modal, Animated,
    Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppSettingsContext } from '../AppSettingsContext';
import { useAuth } from '../AuthContext';

const SettingsScreen = () => {
    const {
        darkMode,
        toggleDarkMode,
        notifications,
        toggleNotifications,
        location,
        toggleLocation,
        fastDelivery,
        toggleFastDelivery,
        contactlessDelivery,
        toggleContactlessDelivery
    } = useContext(AppSettingsContext);
    
    const [showTermsModal, setShowTermsModal] = useState(false);
    const navigation = useNavigation();
    const { user, userRole, becomeDeliverer, logout } = useAuth(); 
    const animatedValue = new Animated.Value(0);
    const animatedModalValue = useRef(new Animated.Value(0)).current;
    const animatedButtonScale = useRef(new Animated.Value(1)).current;

    const animateModal = (toValue) => {
        Animated.timing(animatedModalValue, {
            toValue,
            duration: 300,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true
        }).start();
    };

    // Button press animation
    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(animatedButtonScale, {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true
            }),
            Animated.timing(animatedButtonScale, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true
            })
        ]).start();
    };

    const openTermsModal = () => {
        setShowTermsModal(true);
        animateModal(1);
    };

    const closeTermsModal = () => {
        animateModal(0);
        setTimeout(() => setShowTermsModal(false), 300);
    };

   const renderSettingsSection = (title, children) => (
        <View style={[styles.settingsSection, darkMode && styles.darkModeSettingsSection]}>
            <Text style={[styles.sectionTitle, darkMode && styles.darkModeSectionTitle]}>{title}</Text>
            {children}
        </View>
    );
    const renderSettingOption = (title, subtitle, value, onToggle, icon) => (
        <TouchableOpacity 
            style={[
                styles.settingOption, 
                darkMode && styles.darkModeOption,
                { 
                    transform: [{ scale: value ? 1.01 : 1 }],
                    shadowOpacity: value ? 0.2 : 0.1
                }
            ]}
            onPress={() => {
                onToggle(!value);
                animateButtonPress();
            }}
        >
            <View style={styles.optionContent}>
                <Icon 
                    name={icon} 
                    size={24} 
                    color={darkMode ? "#A5F1E9" : "#1F654C"} 
                    style={styles.optionIcon} 
                />
                <View>
                    <Text style={[styles.optionTitle, darkMode && styles.darkModeText]}>{title}</Text>
                    {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <Animated.View style={{ transform: [{ scale: animatedButtonScale }] }}>
                <Switch
                    trackColor={{ 
                        false: darkMode ? '#444' : '#767577', 
                        true: darkMode ? '#A5F1E9' : '#1F654C' 
                    }}
                    thumbColor={value ? (darkMode ? '#1E2541' : '#f4f3f4') : '#f4f3f4'}
                    onValueChange={onToggle}
                    value={value}
                />
            </Animated.View>
        </TouchableOpacity>
    );
    const renderNavigationSection = () => (
        <View style={[styles.navigationSection, darkMode && styles.darkModenavigationSection]}>
            {[
                { 
                    title: 'My Profile', 
                    icon: 'person-outline', 
                    onPress: () => navigation.navigate('Profile') 
                },
                { 
                    title: 'Order History', 
                    icon: 'receipt-outline', 
                    onPress: () => navigation.navigate('OrderHistory') 
                },
                { 
                    title: 'Payment Methods', 
                    icon: 'card-outline', 
                    onPress: () => navigation.navigate('PaymentMethods') 
                }
            ].map((item, index) => (
                <TouchableOpacity 
                    key={index} 
                    style={styles.navigationItem}
                    onPress={item.onPress}
                >
                    <Icon 
                        name={item.icon} 
                        size={24} 
                        color={darkMode ? "#A5F1E9" : "#1F654C"}
                    />
                    <Text style={[styles.navigationItemText, darkMode && styles.darkModeText]}>
                        {item.title}
                    </Text>
                    <Icon 
                        name="chevron-forward" 
                        size={24} 
                        color={darkMode ? "#A5F1E9" : "#1F654C"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    const handleBecomeDeliverer = async () => {
        try {
            const result = await becomeDeliverer();
            if (result.success) {
                Alert.alert(
                    "Application Submitted", 
                    "Your application to become a deliverer has been submitted for review. We'll notify you once it's approved."
                );
                setShowTermsModal(false);
            } else {
                Alert.alert("Error", result.message || "Failed to submit application");
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    const renderBecomeDelivererButton = () => {
        if (userRole !== 'CLIENT') return null;
        
        if (user?.deliverer_application_status === 'PENDING') {
            return (
                <View style={styles.button}>
                    <Text style={[styles.buttonText, { color: '#666' }]}>
                        Application Pending
                    </Text>
                </View>
            );
        }}

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
            });
        } else {
            Alert.alert("Error", "Failed to logout. Please try again.");
        }
    };

    const DelivererTermsModal = () => {
        const modalAnimatedStyle = {
            opacity: animatedModalValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1]
            }),
            transform: [
                { 
                    translateY: animatedModalValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0]
                    })
                },
                { 
                    scale: animatedModalValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1]
                    })
                }
            ]
        };

        return (
            <Modal
                visible={showTermsModal}
                animationType="fade"
                transparent={true}
                onRequestClose={closeTermsModal}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
                        <View style={styles.modalContent}>
                            <Text style={[styles.modalTitle, darkMode && styles.darkModeText]}>
                                Deliverer Terms & Conditions
                            </Text>
                            <ScrollView style={styles.modalScroll}>
                                <Text style={[styles.modalText, darkMode && styles.darkModeText]}>
                                    {[
                                        "1. You must be at least 18 years old.",
                                        "2. You must have a valid driver's license.",
                                        "3. You must have your own transportation.",
                                        "4. You must maintain a good rating.",
                                        "5. You must complete deliveries in a timely manner.",
                                        "6. You must follow our safety guidelines."
                                    ].join('\n\n')}
                                </Text>
                            </ScrollView>
                            <View style={styles.modalButtons}>
                                <TouchableOpacity 
                                    style={[
                                        styles.modalButton, 
                                        styles.cancelButton, 
                                        darkMode && styles.darkModeModalButton
                                    ]}
                                    onPress={closeTermsModal}
                                >
                                    <Text style={styles.buttonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[
                                        styles.modalButton, 
                                        styles.acceptButton, 
                                        darkMode && styles.darkModeAcceptButton
                                    ]}
                                    onPress={() => {
                                        closeTermsModal();
                                        handleBecomeDeliverer();
                                    }}
                                >
                                    <Text style={styles.buttonText}>Accept & Apply</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        );
    };

    return (
        <View style={[styles.container, darkMode && styles.darkModeContainer]}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
            <Text style={[styles.screenTitle, darkMode && styles.darkModeText]}>Settings</Text>
                
                {renderSettingsSection('App Preferences', (
                    <>
                        {renderSettingOption(
                            'Dark Mode', 
                            'Switch between light and dark themes', 
                            darkMode, 
                            toggleDarkMode, 
                            'moon-outline'
                        )}
                        {renderSettingOption(
                            'Notifications', 
                            'Receive updates and alerts', 
                            notifications, 
                            toggleNotifications, 
                            'notifications-outline'
                        )}
                    </>
                ))}

                {renderSettingsSection('Delivery Preferences', (
                    <>
                        {renderSettingOption(
                            'Location Services', 
                            'Enable precise delivery tracking', 
                            location, 
                            toggleLocation, 
                            'location-outline'
                        )}
                        {renderSettingOption(
                            'Fast Delivery', 
                            'Priority shipping option', 
                            fastDelivery, 
                            toggleFastDelivery, 
                            'flash-outline'
                        )}
                        {renderSettingOption(
                            'Contactless Delivery', 
                            'Safe and convenient drop-off', 
                            contactlessDelivery, 
                            toggleContactlessDelivery, 
                            'hand-left-outline'
                        )}
                    </>
                ))}

                {renderSettingsSection('Account', (
                    <>
                        {renderNavigationSection()}
                        
                    </>
                ))}
               


                
                <TouchableOpacity 
                    style={[
                        styles.logoutButton, 
                        darkMode && styles.darkModeLogoutButton
                    ]}
                    onPress={handleLogout}
                >
                    <Text style={[
                        styles.logoutButtonText, 
                        darkMode && styles.darkModeLogoutButtonText
                    ]}>Log Out</Text>
                </TouchableOpacity>
            </ScrollView>
            <DelivererTermsModal />
        </View>
    );
};



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E0F7FA',
        paddingHorizontal: 15,
    },
    scrollViewContent: {
        paddingVertical: 30,
        paddingHorizontal: 10,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2C3E50', // Default text color for light mode
        textAlign: 'center',
    },
    darkModeText: {
        color: '#FFFFFF',  // White text for dark mode
    },
    settingsSection: {
        backgroundColor: 'rgba(224, 247, 250, 0.7)',
        borderRadius: 15,
        marginBottom: 20,
        padding: 15,
    },
    darkModeSettingsSection: {
        backgroundColor: 'rgba(30,37,65,0.8)',
    },

    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#1F654C',
        marginBottom: 24,
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F654C',
        marginBottom: 12,
    },
    settingOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 3,
        transition: 'all 0.3s ease',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
    },
    darkModeModalButton: {
        backgroundColor: '#2C2C2C',
    },
    darkModeAcceptButton: {
        backgroundColor: '#1F654C',
        opacity: 0.9,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    optionSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    navigationSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
    },
    darkModenavigationSection:{
        backgroundColor: 'rgba(30,37,65,0.8)',
        borderRadius: 12,
        marginBottom: 16,

    },
    navigationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    navigationItemText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
        color: '#333',
    },
    delivererButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1F654C',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
    },
    delivererButtonIcon: {
        marginRight: 12,
    },
    delivererButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    
    option: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    optionIcon: {
        marginRight: 10,
    },
    optionText: {
        fontSize: 18,
        color: '#333',
    },
   
    button: {
        backgroundColor: '#1F654C',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 18,
    },
    logoutButton: {
        backgroundColor: '#FF6B6B',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        justifyContent: 'center',
    },
    logoutButtonText: {
        color: '#FFF',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalScroll: {
        maxHeight: 300,
    },
    modalText: {
        fontSize: 16,
        lineHeight: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#FF6B6B',
    },
    acceptButton: {
        backgroundColor: '#1F654C',
    },
    darkModeContainer: {
        backgroundColor: '#1E2541',
    },
    darkModeTitle: {
        color: '#A5F1E9',
    },
    lightModeTitle: {
        color: '#1F654C',
    },
    darkModeOption: {
        backgroundColor: '#2C2C2C',
    },
    darkModeText: {
        color: '#A5F1E9',
    },
    darkModeButton: {
        backgroundColor: '#2C2C2C',
    },
    darkModeButtonText: {
        color: '#A5F1E9',
    },
    darkModeLogoutButton: {
        backgroundColor: '#66B0A3',
        opacity: 0.8,
    },
    darkModeLogoutButtonText: {
        color: '#1E2541',
    },
});

export default SettingsScreen;
