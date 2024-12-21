import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Image, ScrollView, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';
import { MAIN_CATEGORIES } from '../components/categoriesData'; // Adjust the path as necessary

const AddServiceScreen = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
     const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { authToken, user } = useAuth();

    const navigation = useNavigation();
    const route = useRoute();
    const servicesCategory = MAIN_CATEGORIES.find(cat => cat.name === 'Services');
    
    const [selectedSubcategory, setSelectedSubcategory] = useState(servicesCategory.subcategories[0].name);
    const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(
        Object.keys(servicesCategory.subcategories[0].subsubcategories)[0]
    );
    const handleAddService = async () => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            
            if (!user?.id || !authToken) {
                Alert.alert('Error', 'You must be logged in to add a service');
                return;
            }

            if (!name.trim()) {
                Alert.alert('Error', 'Please enter a service name');
                return;
            }
            if (!description.trim()) {
                Alert.alert('Error', 'Please enter a description');
                return;
            }
            if (!price.trim()) {
                Alert.alert('Error', 'Please enter a price');
                return;
            }
            if (!selectedSubcategory || !selectedSubSubcategory) {
                Alert.alert('Error', 'Please select a subcategory and subsubcategory');
                return;
              }
            if (!image) {
                Alert.alert('Error', 'Please select an image');
                return;
            }
    
            const formData = new FormData();
            formData.append('name', name.trim());
            formData.append('description', description.trim());
            formData.append('price', price.trim());
            formData.append('category', servicesCategory.name);
            formData.append('subcategory', selectedSubcategory);
            formData.append('subsubcategory', selectedSubSubcategory);
            formData.append('userId', user.id.toString());
            formData.append('userFullName', user.full_name || user.name);
            formData.append('userPhone', user.phone);
            console.log('FormData values:', {
                name: name.trim(),
                description: description.trim(),
                price: price.trim(),
                category: servicesCategory.name,
                subcategory: selectedSubcategory,
                subsubcategory: selectedSubSubcategory,
                userId: user.id.toString(),
                userFullName: user.full_name || user.name,
                userPhone: user.phone
              });
            if (image) {
                const imageFileName = image.split('/').pop();
                const match = /\.(\w+)$/.exec(imageFileName);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                
                formData.append('image', {
                    uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
                    name: imageFileName,
                    type: type
                });
            }
            
            const response = await fetch('https://8b7f-41-100-123-0.ngrok-free.app/api/services', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${authToken}`, // Include the token here
                  },
                  
            });
    
            const responseData = await response.json();
            
            if (response.ok) {
                Alert.alert('Success', 'Service added successfully!');
                navigation.goBack();
            } else {
                throw new Error(responseData.error || 'Failed to add service');
            }
        } catch (error) {
            console.error('Error adding service:', error);
            Alert.alert(
                'Error',
                error.message || 'Network error or server is unreachable'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImagePick = () => {
        const options = {
          mediaType: 'photo', // Select images only
          maxWidth: 800,      // Adjust the max width if needed
          maxHeight: 600,     // Adjust the max height if needed
          quality: 1,         // Highest quality
          includeBase64: false,
        };
      
        launchImageLibrary(options, (response) => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.errorCode) {
            console.log('ImagePicker Error: ', response.errorMessage);
            Alert.alert('Error', 'An error occurred while selecting the image.');
          } else {
            const uri = response.assets[0].uri;
            setImage(uri);
          }
        });
      };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#A5F1E9" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add New Service</Text>
            </View>

            <TextInput
                style={styles.input}
                placeholder="Service Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Description"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <TextInput
                style={styles.input}
                placeholder="Price"
                placeholderTextColor="#888"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
            />

            

            {/* Subcategories */}
{servicesCategory && (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {servicesCategory.subcategories.map((subcat) => (
            <TouchableOpacity
                key={subcat.name}
                style={[styles.categoryButton, selectedSubcategory === subcat.name && styles.selectedCategory]}
                onPress={() => {
                    setSelectedSubcategory(subcat.name);
                    setSelectedSubSubcategory(
                        Object.keys(subcat.subsubcategories)[0]
                    );
                }}
            >
                <Text style={[styles.categoryButtonText, selectedSubcategory === subcat.name && styles.selectedCategoryText]}>
                    {subcat.name}
                </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
)}
            {/* Sub-Subcategories */}
{selectedSubcategory && (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
        {Object.keys(
            servicesCategory.subcategories.find(sub => sub.name === selectedSubcategory)?.subsubcategories || {}
        ).map((subsubcat) => (
            <TouchableOpacity
                key={subsubcat}
                style={[styles.categoryButton, selectedSubSubcategory === subsubcat && styles.selectedCategory]}
                onPress={() => setSelectedSubSubcategory(subsubcat)}
            >
                <Text style={[styles.categoryButtonText, selectedSubSubcategory === subsubcat && styles.selectedCategoryText]}>
                    {subsubcat}
                </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
)}
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
                <Icon name="camera" size={24} color="#A5F1E9" />
                <Text style={styles.imageButtonText}>Select Image</Text>
            </TouchableOpacity>

            {image && (
                <View style={styles.imageConfirmation}>
                    <Text style={styles.imageConfirmationText}>Image Selected:</Text>
                    <Image source={{ uri: image }} style={styles.selectedImage} />
                </View>
            )}

            <TouchableOpacity 
                style={[styles.addButton, isSubmitting && styles.disabledButton]} 
                onPress={handleAddService}
                disabled={isSubmitting}
            >
                <Text style={styles.addButtonText}>
                    {isSubmitting ? 'Adding Service...' : 'Add Service'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2541',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#A5F1E9',
        marginLeft: 20,
    },
    input: {
        backgroundColor: '#2C2C2C',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        color: '#fff',
    },
    categoriesContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    categoryButton: {
        backgroundColor: '#2C2C2C',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    selectedCategory: {
        backgroundColor: '#A5F1E9',
    },
    categoryButtonText: {
        color: '#A5F1E9',
        fontSize: 14,
    },
    selectedCategoryText: {
        color: '#2C2C2C',
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2C2C2C',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    imageButtonText: {
        color: '#A5F1E9',
        fontSize: 16,
        marginLeft: 10,
    },
    imageConfirmation: {
        marginVertical: 10,
    },
    imageConfirmationText: {
        color: '#A5F1E9',
        marginBottom: 5,
    },
    selectedImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    addButton: {
        backgroundColor: '#A5F1E9',
        borderRadius: 10,
        padding: 15,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        marginTop: 5,
        marginBottom: 15,
    },
    addButtonText: {
        color: '#2C2C2C',
        fontSize: 18,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default AddServiceScreen;