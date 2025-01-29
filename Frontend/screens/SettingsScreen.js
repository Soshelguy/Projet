/**
 * Screen for user settings and preferences.
 * Allows users to toggle dark mode, notifications, location services, fast delivery, and contactless delivery.
 * Provides navigation to profile, order history, and payment methods.
 * Allows users to log out.
 */
import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppSettingsContext } from '../AppSettingsContext';
import { useAuth } from '../AuthContext';
const SettingsScreen = () => {
    const {
        isDarkMode,
        toggleDarkMode,
        areNotificationsEnabled,
        toggleNotifications,
        isLocationEnabled,
        toggleLocation,
        isFastDeliveryEnabled,
        toggleFastDelivery,
        isContactlessDeliveryEnabled,
        toggleContactlessDelivery
    } = useContext(AppSettingsContext);

    const { logout } = useAuth();
    const navigation = useNavigation();
    const animatedButtonScale = useRef(new Animated.Value(1)).current;

    /**
     * Animate a button press by scaling it down and back up.
     */
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

    /**
     * Render a settings section with a title and some children.
     * @param {string} title - The title of the section.
     * @param {ReactNode} children - The children to render inside the section.
     */
    const renderSettingsSection = (title, children) => (
        <View style={[styles.settingsSection, isDarkMode && styles.darkModeSettingsSection]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkModeSectionTitle]}>
                {title}
            </Text>
            {children}
        </View>
    );

    /**
     * Render a single setting option with a title, subtitle, and toggle switch.
     * @param {string} title - The title of the option.
     * @param {string} subtitle - The subtitle of the option.
     * @param {boolean} value - The value of the option.
     * @param {Function} onToggle - The function to call when the toggle switch is pressed.
     * @param {string} icon - The icon to display next to the option.
     */
    const renderSettingOption = (title, subtitle, value, onToggle, icon) => (
        <TouchableOpacity
            style={[
                styles.settingOption,
                isDarkMode && styles.darkModeOption,
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
                    color={isDarkMode ? "#A5F1E9" : "#1F654C"}
                    style={styles.optionIcon}
                />
                <View>
                    <Text style={[styles.optionTitle, isDarkMode && styles.darkModeText]}>
                        {title}
                    </Text>
                    {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
                </View>
            </View>
            <Animated.View style={{ transform: [{ scale: animatedButtonScale }] }}>
                <Switch
                    trackColor={{
                        false: isDarkMode ? '#444' : '#767577',
                        true: isDarkMode ? '#A5F1E9' : '#1F654C'
                    }}
                    thumbColor={value ? (isDarkMode ? '#1E2541' : '#f4f3f4') : '#f4f3f4'}
                    onValueChange={onToggle}
                    value={value}
                />
            </Animated.View>
        </TouchableOpacity>
    );

    /**
     * Render a section with navigation options.
     */
    const renderNavigationSection = () => (
        <View style={[styles.navigationSection, isDarkMode && styles.darkModenavigationSection]}>
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
                        color={isDarkMode ? "#A5F1E9" : "#1F654C"}
                    />
                    <Text style={[styles.navigationItemText, isDarkMode && styles.darkModeText]}>
                        {item.title}
                    </Text>
                    <Icon
                        name="chevron-forward"
                        size={24}
                        color={isDarkMode ? "#A5F1E9" : "#1F654C"}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    /**
     * Handle the logout button press by calling the logout function and navigating to the auth screen.
     */
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

    return (
        <View style={[styles.container, isDarkMode && styles.darkModeContainer]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                <Text style={[styles.screenTitle, isDarkMode && styles.darkModeText]}>Settings</Text>
                {renderSettingsSection('App Preferences', (
                    <>
                        {renderSettingOption(
                            'Dark Mode',
                            'Switch between light and dark themes',
                            isDarkMode,
                            toggleDarkMode,
                            'moon-outline'
                        )}
                        {renderSettingOption(
                            'Notifications',
                            'Receive updates and alerts',
                            areNotificationsEnabled,
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
                            isLocationEnabled,
                            toggleLocation,
                            'location-outline'
                        )}
                        {renderSettingOption(
                            'Fast Delivery',
                            'Priority shipping option',
                            isFastDeliveryEnabled,
                            toggleFastDelivery,
                            'flash-outline'
                        )}
                        {renderSettingOption(
                            'Contactless Delivery',
                            'Safe and convenient drop-off',
                            isContactlessDeliveryEnabled,
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
                        isDarkMode && styles.darkModeLogoutButton
                    ]}
                    onPress={handleLogout}
                >
                    <Text style={[
                        styles.logoutButtonText,
                        isDarkMode && styles.darkModeLogoutButtonText
                    ]}>
                        Log Out
                    </Text>
                </TouchableOpacity>
            </ScrollView>
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
    optionIcon: {
        marginRight: 10,
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



