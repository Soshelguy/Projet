import React, { useRef,useState, useContext, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    Image, 
    TouchableOpacity, 
    ScrollView, 
    Modal, 
    Alert, 
    FlatList,
    ActivityIndicator ,
    TextInput ,
    Dimensions ,
    useColorScheme,
    Platform,
    Animated,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';
import { launchImageLibrary } from 'react-native-image-picker';
import { FadeIn, FadeOut,SlideInLeft, SlideOutRight } from 'react-native-reanimated';
import { AppSettingsContext } from '../AppSettingsContext';

const COLORS = {
    primary: '#2C6E63',      // Deep teal
    secondary: '#A5F1E9',    // Light aqua
    background: '#F0F4F8',   // Soft gray-blue (light mode), Dark for dark mode
    text: '#2C3E50',         // Dark slate (light mode), Light for dark mode
    accent: '#FF6B6B',       // Soft red
    white: '#FFFFFF',
    darkBackground: '#1A1A1A', // Dark mode background
    darkText: '#EAEAEA',      // Light text for dark mode
    darkPrimary: '#66B0A3',   // Lighter teal for dark mode
    darkBorder: '#60BFB0',    // Light aqua for dark mode
    darkButton: '#66B0A3',    // Lighter teal for dark mode
    darkButtonText: '#EAEAEA', // Light text for dark mode
    darkInputText: '#EAEAEA',  // Light text for dark mode
    darkCard: '#1E2541',       // Darker teal for dark mode
    darkCardText: '#EAEAEA',   // Light text for dark mode
    darkCardAccent: '#FF6B6B',  // Soft red remains the same for dark mode
    darkSecondary: '#60BFB0', // Light aqua for dark mode
    darkAccent: '#FF6B6B',    // Soft red remains the same
};

const RoleRequestModal = ({ 
    visible, 
    onClose, 
    title, 
    conditions, 
    onAccept 
}) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
    >
         <View style={styles.modalContainer}>
            <Animated.View 
                style={styles.modalContent}
                entering={FadeIn}
                exiting={FadeOut}
            >
                <Text style={styles.modalTitle}>{title} Application</Text>
                <ScrollView 
                    style={styles.conditionsScroll}
                    showsVerticalScrollIndicator={false}
                >
                    {conditions.map((condition, index) => (
                        <View key={index} style={styles.conditionCard}>
                            <Icon 
                                name="checkmark-circle" 
                                size={24} 
                                color={COLORS.primary} 
                                style={styles.conditionIcon}
                            />
                            <Text style={styles.conditionText}>
                                {condition}
                            </Text>
                        </View>
                    ))}
                </ScrollView>
                <View style={styles.modalButtons}>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.cancelButton]} 
                        onPress={onClose}
                    >
                        <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalButton, styles.acceptButton]} 
                        onPress={onAccept}
                    >
                        <Text style={styles.modalButtonText}>Accept & Apply</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    </Modal>
);
const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
    </View>
);


const ProfileScreen = ({ navigation }) => {
    const { user, setUser, becomeDeliverer, authToken } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeModal, setActiveModal] = useState(null);
    const [userServices, setUserServices] = useState([]);
    const { darkMode } = useContext(AppSettingsContext);
    const animationValue = useRef(new Animated.Value(0)).current;
  
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        fullName: '',
        phone: '',
        address: '',
        profileImage: null
    });
    const isServiceProvider = user.roles?.includes('SERVICE_PROVIDER');
    const isDeliverer = user.roles?.includes('DELIVERER');
    const isCateringBusiness = user.roles?.includes('CATERING_BUSINESS');

    useEffect(() => {
        if (isEditing) {
          // Animate in
          Animated.timing(animationValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease),
          }).start();
        } else {
          // Animate out
          Animated.timing(animationValue, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }).start();
        }
      }, [isEditing]);

    useEffect(() => {
        fetchProfileData();
    }, []);

    useEffect(() => {
        fetchUserServices();
    }, [isServiceProvider, authToken]);


    const DRIVER_CONDITIONS = [
        'Must be at least 21 years old',
        'Have a valid driver\'s license',
        'Own a reliable vehicle',
        'Pass a background check',
        'Maintain a good driving record'
    ];

    const SERVICE_PROVIDER_CONDITIONS = [
        'Provide accurate service descriptions',
        'Maintain high-quality service standards',
        'Respond promptly to customer inquiries',
        'Set competitive and fair pricing',
        'Comply with platform guidelines'
    ];

    const CATERING_BUSINESS_CONDITIONS = [
        'Possess proper food handling certifications',
        'Maintain a clean and safe food preparation environment',
        'Provide detailed menu and pricing information',
        'Comply with local health department regulations',
        'Ensure timely and professional service'
    ];
    const animatedStyle = {
    opacity: animationValue,
    transform: [
      {
        translateX: animationValue.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0], // Slide in from right
        }),
      },
    ],
  };
    const fetchProfileData = async () => {
        if (!user?.id) {
            console.error('No user ID available');
            Alert.alert('Error', 'Please log in again.');
            navigation.navigate('Auth');
            return;
        }
    
        setLoading(true);
    
        try {
            const profileResponse = await fetch('http://192.168.1.2:5000/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Profile Response Status:', profileResponse.status);
    
            if (!profileResponse.ok) {
                const errorText = await profileResponse.text();
                console.error('Profile fetch error:', {
                    status: profileResponse.status,
                    statusText: profileResponse.statusText,
                    errorText
                });
                throw new Error(`Failed to fetch profile data: ${errorText}`);
            }
    
            const profileData = await profileResponse.json();
            console.log('Fetched Profile Data:', profileData);
    
            const rolesResponse = await fetch('http://192.168.1.2:5000/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Roles Response Status:', rolesResponse.status);
    
            if (!rolesResponse.ok) {
                const errorText = await rolesResponse.text();
                console.error('Roles fetch error:', {
                    status: rolesResponse.status,
                    statusText: rolesResponse.statusText,
                    errorText
                });
                throw new Error(`Failed to fetch roles data: ${errorText}`);
            }
    
            // Check if the response is JSON before parsing it
            const rolesContentType = rolesResponse.headers.get('Content-Type');
            let rolesData;
            if (rolesContentType && rolesContentType.includes('application/json')) {
                rolesData = await rolesResponse.json();
            } else {
                console.error('Unexpected content type for roles data:', rolesContentType);
                const errorText = await rolesResponse.text();
                throw new Error(`Unexpected response format for roles data: ${errorText}`);
            }
    
            console.log('Fetched Roles Data:', rolesData);
    
            setUser(profileData);

    
            setProfileData({
                profileImage: profileData.profile_image_url || profileData.profileImage || 'https://via.placeholder.com/150',
                name: profileData.full_name || profileData.name || 'Username',
                email: profileData.email || '',
                address: profileData.address || '',
                phone: profileData.phone || '',
            });
    
            // Fetch services with more logging
            const servicesResponse = await fetch('http://192.168.1.2:5000/api/services/user', {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${authToken}`,
                  'Content-Type': 'application/json'
                },
              });
              console.log('Services Response Status:', servicesResponse.status);
          
              if (!servicesResponse.ok) {
                const errorText = await servicesResponse.text();
                console.error('Services fetch error:', {
                  status: servicesResponse.status,
                  statusText: servicesResponse.statusText,
                  errorText
                });
                throw new Error(`Failed to fetch services data: ${errorText}`);
              }
              
    
        } catch (error) {
            console.error('Complete Error in fetchProfileData:', error);
            Alert.alert('Error', `Failed to load profile or services data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
   

    const fetchUserServices = async () => {
        if (!isServiceProvider) {
            setUserServices([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://192.168.1.2:5000/api/services/user', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Services Response Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Services fetch error:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText
                });
                throw new Error(`Failed to fetch services data: ${errorText}`);
            }

            const servicesData = await response.json();
            console.log('Fetched User Services Data:', servicesData);

            setUserServices(servicesData);
        } catch (error) {
            console.error('Error fetching user services:', error);
            Alert.alert('Error', `Failed to load services: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
   
    
    const handleDeleteService = async (serviceId) => {
        try {
            const response = await fetch(`http://192.168.1.2:5000/api/services/${serviceId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to delete service: ${errorText}`);
            }

            // Remove the deleted service from the local state
            setUserServices(prevServices => 
                prevServices.filter(service => service.id !== serviceId)
            );

            Alert.alert('Success', 'Service deleted successfully');
        } catch (error) {
            console.error('Delete service error:', error);
            Alert.alert('Error', error.message);
        }
    };
    const handleEditService = (service) => {
        navigation.navigate('EditServiceScreen', { service });
    };

    const pickProfileImage = async () => {
        const options = {
            mediaType: 'photo',
            includeBase64: true,
            maxHeight: 800,
            maxWidth: 800,
        };
    
        try {
            const response = await launchImageLibrary(options);
            
            if (response.didCancel) {
                console.log('User cancelled image picker');
                return;
            }
    
            if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                return;
            }
    
            if (response.assets && response.assets[0]) {
                const asset = response.assets[0];
                
                // Create form data for the image
                const imageData = {
                    uri: asset.uri,
                    type: asset.type,
                    name: asset.fileName || 'image.jpg'
                };
    
                setEditedProfile(prev => ({
                    ...prev,
                    profileImage: imageData
                }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };
    
    

    const handleProfileUpdate = async () => {
        if (!authToken) {
            Alert.alert('Error', 'Please log in again');
            return;
        }
    
        setLoading(true);
    
        try {
            const formData = new FormData();
            formData.append('fullName', editedProfile.fullName || profileData.name);
            formData.append('phone', editedProfile.phone || profileData.phone);
            formData.append('address', editedProfile.address || profileData.address);
    
            if (editedProfile.profileImage) {
                formData.append('profileImage', {
                    uri: editedProfile.profileImage.uri,
                    type: editedProfile.profileImage.type,
                    name: editedProfile.profileImage.name
                });
            }
    
            const response = await fetch('http://192.168.1.2:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data',
                },
                body: formData
            });
    
            const responseData = await response.json();
    
            if (!response.ok) {
                throw new Error(responseData.message || 'Failed to update profile');
            }
    
            // Update local state with new profile data
            setProfileData(prev => ({
                ...prev,
                name: responseData.user.fullName,
                phone: responseData.user.phone,
                address: responseData.user.address,
                profileImage: responseData.user.profileImageUrl
            }));
    
            Alert.alert('Success', 'Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            console.error('Profile update error:', error);
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleRequest = async (roleType) => {
        try {
            let result;
            switch(roleType) {
                case 'DRIVER':
                    result = await becomeDeliverer();
                    break;
                case 'SERVICE_PROVIDER':
                    result = await fetch('http://192.168.1.2:5000/api/request-service-provider', {
                        method: 'POST',
                        body: JSON.stringify({ userId: user.id }),
                        headers: { 'Content-Type': 'application/json' },
                    });
                    result = await result.json();
                    break;
                case 'CATERING':
                    result = await fetch('http://192.168.1.2:5000/api/request-catering-business', {
                        method: 'POST',
                        body: JSON.stringify({ userId: user.id }),
                        headers: { 'Content-Type': 'application/json' },
                    });
                    result = await result.json();
                    break;
            }
    
            if (result.success) {
                // Refresh user data after successful request
                await fetchProfileData();
                
                Alert.alert('Success', `Your ${roleType.replace('_', ' ')} application has been submitted`);
                setActiveModal(null);
            } else {
                Alert.alert('Error', result.message || 'Failed to submit application');
            }
        } catch (error) {
            console.error(`Error in ${roleType} request:`, error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        }
    };
    
    const renderProfileHeader = () => {
        return (
            <Animated.View
                style={
                    !profileData
                        ? styles.loadingContainer
                        : isEditing
                        ? styles.editProfileContainer
                        : styles.profileHeader
                }
                entering={FadeIn}
                exiting={FadeOut}
            >
                {/* Replace `renderProfileContent` content here */}
                {!profileData ? (
                    <>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text>Loading profile...</Text>
                    </>
                ) : isEditing ? (
                    <>
                        {/* Editing content */}
                        {/* ... Your editing UI ... */}
                        {/* Profile Image Picker */}
                        <TouchableOpacity
                            style={styles.profileImageEditContainer}
                            onPress={pickProfileImage}
                        >
                            <Image
                                source={{
                                    uri: editedProfile.profileImage?.uri || profileData.profileImage,
                                }}
                                style={styles.profileImageEdit}
                            />
                            <View style={styles.editImageOverlay}>
                                <Icon name="camera" size={24} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>

                        {/* Input Fields */}
                        {/* ... Full Name, Phone, Address ... */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.fullName || profileData.name}
                                onChangeText={(text) =>
                                    setEditedProfile((prev) => ({ ...prev, fullName: text }))
                                }
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.phone || profileData.phone}
                                onChangeText={(text) =>
                                    setEditedProfile((prev) => ({ ...prev, phone: text }))
                                }
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={editedProfile.address || profileData.address}
                                onChangeText={(text) =>
                                    setEditedProfile((prev) => ({ ...prev, address: text }))
                                }
                                multiline
                            />
                        </View>

                        {/* Buttons */}
                        <Animated.View style={[styles.editButtonContainer, animatedStyle]}>
                            <TouchableOpacity
                                style={styles.cancelEditButton}
                                onPress={() => setIsEditing(false)}
                            >
                                <Text style={styles.editButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveEditButton}
                                onPress={handleProfileUpdate}
                            >
                                <Text style={styles.editButtonText}>Save</Text>
                            </TouchableOpacity>
                            </Animated.View>
                    </>
                ) : (
                    <>
                        {/* Original profile content */}
                        <Image
                            source={{
                                uri:
                                    profileData?.profileImage ||
                                    profileData?.profile_image_url ||
                                    'https://via.placeholder.com/150',
                            }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>{profileData.name}</Text>
                        <Text style={styles.profileEmail}>{profileData.email}</Text>
                        <TouchableOpacity
                            style={styles.editProfileButton}
                            onPress={() => {
                                setEditedProfile({
                                    fullName: profileData.name,
                                    phone: profileData.phone,
                                    address: profileData.address,
                                    profileImage: null,
                                });
                                setIsEditing(true);
                            }}
                        >
                            <Icon name="pencil" size={20} color="#1F654C" />
                            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </>
                )}
            </Animated.View>
        );
    };

    const renderServiceItem = ({ item }) => (
        <TouchableOpacity 
        style={styles.serviceItem}
        onPress={() => navigation.navigate('ServiceBookings', { service: item })}
    >
            <Image 
                source={{ uri: item.image || 'https://via.placeholder.com/150' }} 
                style={styles.serviceImage} 
            />
            <View style={styles.serviceDetails}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.servicePrice}>${item.price}</Text>
                <View style={styles.serviceActions}>
                    <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleEditService(item)}
                    >
                        <Icon name="pencil" size={18} color="#1F654C" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => {
                            Alert.alert(
                                'Confirm Deletion',
                                'Are you sure you want to delete this service?',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    { 
                                        text: 'Delete', 
                                        style: 'destructive',
                                        onPress: () => handleDeleteService(item.id), 
                                    },
                                ],
                            );
                        }}
                    >
                        <Icon name="trash" size={18} color="#FF6B6B" />
                    </TouchableOpacity>
                </View>
            </View>
            </TouchableOpacity>
    );
    
    const renderServicesSection = () => {
        return (
            <View style={styles.servicesSection}>
                {isServiceProvider ? (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>My Services</Text>
                            <TouchableOpacity                
                             style={[styles.addServiceButton, darkMode && styles.darkModeAddServiceButton]}
                                onPress={() => navigation.navigate('AddServiceScreen')}
                            >
                                <Icon name="add" size={24} color="#1F654C" />
                            </TouchableOpacity>
                        </View>
                        {userServices.length > 0 ? (
                            <FlatList
                                data={userServices}
                                renderItem={renderServiceItem}
                                keyExtractor={(item) => item.id.toString()}
                            />
                        ) : (
                            <View style={styles.emptyServicesContainer}>
                                <Text style={styles.emptyServicesText}>
                                    You haven't added any services yet. Click the "+" button to get started!
                                </Text>
                            </View>
                        )}
                    </>
                ) : (
                    // Optionally, render an empty state or placeholder for non-service providers
                    <Text style={styles.notServiceProviderText}>
                        You are not registered as a service provider.
                    </Text>
                )}
            </View>
        );
    };
    
    const renderProfileContent = () => {
        return (
            <Animated.View
                style={
                    !profileData
                        ? styles.loadingContainer
                        : isEditing
                        ? styles.editProfileContainer
                        : styles.profileHeader
                }
                entering={FadeIn}
                exiting={FadeOut}
            >
                {/* If profile data is not available, show loading */}
                {!profileData ? (
                    <>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text>Loading profile...</Text>
                    </>
                ) : isEditing ? (
                    <>
                        {/* Editing content */}
                        <TouchableOpacity
                            style={styles.profileImageEditContainer}
                            onPress={pickProfileImage}
                        >
                            <Image
                                source={{
                                    uri: editedProfile.profileImage?.uri || profileData.profileImage,
                                }}
                                style={styles.profileImageEdit}
                            />
                            <View style={styles.editImageOverlay}>
                                <Icon name="camera" size={24} color={COLORS.white} />
                            </View>
                        </TouchableOpacity>
    
                        {/* Enhanced input fields */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.fullName || profileData.name}
                                onChangeText={(text) =>
                                    setEditedProfile((prev) => ({ ...prev, fullName: text }))
                                }
                            />
                        </View>
    
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            <TextInput
                                style={styles.input}
                                value={editedProfile.phone || profileData.phone}
                                onChangeText={(text) =>
                                    setEditedProfile((prev) => ({ ...prev, phone: text }))
                                }
                                keyboardType="phone-pad"
                            />
                        </View>
    
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={editedProfile.address || profileData.address}
                                onChangeText={(text) =>
                                    setEditedProfile((prev) => ({ ...prev, address: text }))
                                }
                                multiline
                            />
                        </View>
    
                        {/* Animated Buttons */}
                        <Animated.View
                            style={styles.editButtonContainer}
                            entering={SlideInLeft}
                            exiting={SlideOutRight}
                        >
                            <TouchableOpacity
                                style={styles.cancelEditButton}
                                onPress={() => setIsEditing(false)}
                            >
                                <Text style={styles.editButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.saveEditButton}
                                onPress={handleProfileUpdate}
                            >
                                <Text style={styles.editButtonText}>Save</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </>
                ) : (
                    <>
                        {/* Original profile content */}
                        <Image
                            source={{
                                uri:
                                    profileData?.profileImage ||
                                    profileData?.profile_image_url ||
                                    'https://via.placeholder.com/150',
                            }}
                            style={styles.profileImage}
                        />
                        <Text style={styles.profileName}>{profileData.name}</Text>
                        <Text style={styles.profileEmail}>{profileData.email}</Text>
                        <TouchableOpacity
                            style={styles.editProfileButton}
                            onPress={() => {
                                setEditedProfile({
                                    fullName: profileData.name,
                                    phone: profileData.phone,
                                    address: profileData.address,
                                    profileImage: null,
                                });
                                setIsEditing(true);
                            }}
                        >
                            <Icon name="pencil" size={20} color="#1F654C" />
                            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                    </>
                )}
            </Animated.View>
        );
    };

    const renderRoleRequestButtons = () => (
        <View style={styles.roleRequestSection}>
            {user.deliverer_request !== 'APPROVED' && (
                <TouchableOpacity 
                    style={styles.roleButton}
                    onPress={() => setActiveModal('DRIVER')}
                >
                    <Icon name="car" size={24} color="#1F654C" />
                    <Text style={styles.roleButtonText}>Become a Driver</Text>
                </TouchableOpacity>
            )}

            {user.service_provider_request !== 'APPROVED' && (
                <TouchableOpacity 
                    style={styles.roleButton}
                    onPress={() => setActiveModal('SERVICE_PROVIDER')}
                >
                    <Icon name="briefcase" size={24} color="#1F654C" />
                    <Text style={styles.roleButtonText}>Become Service Provider</Text>
                </TouchableOpacity>
            )}

            {user.catering_business_request !== 'APPROVED' && (
                <TouchableOpacity 
                    style={styles.roleButton}
                    onPress={() => setActiveModal('CATERING')}
                >
                    <Icon name="restaurant" size={24} color="#1F654C" />
                    <Text style={styles.roleButtonText}>Become Catering Business</Text>
                </TouchableOpacity>
            )}
        </View>
    );
    const renderEmptyServices = () => (
        <View style={styles.emptyServicesContainer}>
            <Text style={styles.emptyServicesText}>
                You haven't added any services yet. Click the "+" button to get started!
            </Text>
        </View>
    );

     if (loading) {
        return <LoadingOverlay />;
    }
    const listHeaderComponent = (
        <>
            {renderProfileHeader()}
            {renderRoleRequestButtons()}
            {isServiceProvider && (
                <View style={styles.servicesSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Services</Text>
                        <TouchableOpacity 
                            style={styles.addServiceButton}
                            onPress={() => navigation.navigate('AddServiceScreen')}
                        >
                            <Icon name="add" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </>
    );

    return (
        <>
            <FlatList
                data={isServiceProvider ? userServices : []}
                renderItem={isServiceProvider ? renderServiceItem : null}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={listHeaderComponent}
                contentContainerStyle={styles.contentContainer}
                ListEmptyComponent={isServiceProvider ? renderEmptyServices : null}            />

            {/* Role Request Modals */}
            <RoleRequestModal
                visible={activeModal === 'DRIVER'}
                onClose={() => setActiveModal(null)}
                title="Driver"
                conditions={DRIVER_CONDITIONS}
                onAccept={() => handleRoleRequest('DRIVER')}
            />
            <RoleRequestModal
                visible={activeModal === 'SERVICE_PROVIDER'}
                onClose={() => setActiveModal(null)}
                title="Service Provider"
                conditions={SERVICE_PROVIDER_CONDITIONS}
                onAccept={() => handleRoleRequest('SERVICE_PROVIDER')}
            />
            <RoleRequestModal
                visible={activeModal === 'CATERING'}
                onClose={() => setActiveModal(null)}
                title="Catering Business"
                conditions={CATERING_BUSINESS_CONDITIONS}
                onAccept={() => handleRoleRequest('CATERING')}
            />
        </>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    // Base Containers
    contentContainer: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        marginTop:20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.primary,
        fontSize: 16,
    },

    // Profile Header
    profileHeader: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 3,
        borderColor: COLORS.primary,
    },
    profileName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: 10,
    },
    profileEmail: {
        fontSize: 16,
        color: COLORS.text,
        marginTop: 5,
    },
    editProfileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 15,
        backgroundColor: COLORS.secondary,
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
    },
    editProfileButtonText: {
        marginLeft: 5,
        color: COLORS.primary,
        fontWeight: '600',
    },

    // Edit Profile
    editProfileContainer: {
        padding: 20,
        backgroundColor: COLORS.background,
    },
    profileImageEditContainer: {
        alignSelf: 'center',
        marginBottom: 20,
    },
    profileImageEdit: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    editImageOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 8,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        marginBottom: 5,
        color: COLORS.text,
        fontWeight: '600',
    },
    editToggleButton: {
        alignSelf: 'flex-end',
        padding: 10,
      },
      editToggleButtonText: {
        fontSize: 16,
        color: '#007AFF',
      },
      editButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
      },
      cancelEditButton: {
        flex: 1,
        marginRight: 10,
        padding: 15,
        backgroundColor: '#FF3B30',
        borderRadius: 8,
        alignItems: 'center',
      },
      saveEditButton: {
        flex: 1,
        marginLeft: 10,
        padding: 15,
        backgroundColor: '#4CD964',
        borderRadius: 8,
        alignItems: 'center',
      },
      editButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
    input: {
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 10,
        padding: 10,
        backgroundColor: COLORS.white,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    editButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelEditButton: {
        flex: 1,
        marginRight: 10,
        padding: 15,
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveEditButton: {
        flex: 1,
        padding: 15,
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: COLORS.white,
        fontWeight: '600',
    },

    // Role Request Section
    roleRequestSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 15,
        backgroundColor: COLORS.background,
    },
    roleButton: {
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        padding: 15,
        borderRadius: 10,
        width: '30%',
    },
    roleButtonText: {
        marginTop: 5,
        color: COLORS.primary,
        textAlign: 'center',
        fontSize: 12,
    },

    // Services Section
    servicesSection: {
        padding: 15,
        backgroundColor: COLORS.background,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    addServiceButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 25,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyServicesContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.background,
    },
    emptyServicesText: {
        color: COLORS.text,
        textAlign: 'center',
    },
    notServiceProviderText: {
        textAlign: 'center',
        color: COLORS.text,
        padding: 20,
    },

    // Service Item
    serviceItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    serviceImage: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    serviceDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    servicePrice: {
        fontSize: 14,
        color: COLORS.primary,
        marginVertical: 5,
    },
    serviceActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    editButton: {
        padding: 5,
        borderRadius: 5,
    },
    deleteButton: {
        padding: 5,
        borderRadius: 5,
    },

    // Modal
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: width * 0.85,
        backgroundColor: COLORS.white,
        borderRadius: 15,
        padding: 20,
        maxHeight: height * 0.7,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: 15,
    },
    conditionsScroll: {
        maxHeight: height * 0.4,
    },
    conditionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.secondary,
        borderRadius: 10,
        padding: 10,
        marginBottom: 10,
    },
    conditionIcon: {
        marginRight: 10,
    },
    conditionText: {
        flex: 1,
        color: COLORS.text,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: COLORS.secondary,
    },
    acceptButton: {
        backgroundColor: COLORS.primary,
    },
    modalButtonText: {
        color: COLORS.white,
        fontWeight: '600',
    },

    // Dark Mode Overrides
    darkModeContainer: {
        backgroundColor: COLORS.darkBackground,
    },
    darkModeText: {
        color: COLORS.darkText,
    },
    darkModeInput: {
        backgroundColor: COLORS.darkCard,
        borderColor: COLORS.darkBorder,
        color: COLORS.darkInputText,
    },
    darkModeInputLabel: {
        color: COLORS.darkText,
    },
    darkModeAddServiceButton: {
        backgroundColor: COLORS.darkButton,
    },
    darkModeServiceItem: {
        backgroundColor: COLORS.darkCard,
    },
    darkModeServiceName: {
        color: COLORS.darkCardText,
    },
    darkModeServicePrice: {
        color: COLORS.darkSecondary,
    },
    darkModeRoleButton: {
        backgroundColor: COLORS.darkSecondary,
    },
    darkModeRoleButtonText: {
        color: COLORS.darkPrimary,
    },
});
export default ProfileScreen;
