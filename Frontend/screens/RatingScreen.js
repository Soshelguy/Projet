/**
 * RatingScreen: A screen for users to rate a service
 * 
 * Props:
 *  - route: An object containing the service ID and booking ID
 *  - navigation: A navigation object for navigating between screens
 */
import React, { useState } from 'react';

import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * RatingScreen component
 * 
 * @param {Object} props The component props
 * @returns {React.Component} The RatingScreen component
 */
const RatingScreen = ({ route, navigation }) => {
  const { serviceId, bookingId } = route.params;

  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');

  /**
   * Handles the submission of the rating and review
   * 
   * @returns {Promise} A promise that resolves when the submission is complete
   */
  const handleSubmit = async () => {
    try {
      // Get the user ID from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      const { id: userId } = JSON.parse(userData);

      // Send a POST request to the server to add the rating
      const response = await fetch('http://192.168.1.2:5000/api/ratings/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          user_id: userId,
          rating: userRating,
          review: userReview,
        }),
      });

      if (response.ok) {
        // Navigate back to the previous screen
        navigation.goBack();
      } else {
        console.error('Error submitting rating:', response);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate this service</Text>

      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setUserRating(star)}
          >
            <Icon
              name={userRating >= star ? 'star' : 'star-outline'}
              size={40}
              color="#A5F1E9"
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.reviewInput}
        placeholder="Write your review (optional)"
        value={userReview}
        onChangeText={setUserReview}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={[
          styles.submitButton,
          { opacity: userRating === 0 ? 0.5 : 1 }
        ]}
        disabled={userRating === 0}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Submit Rating</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * Styles for the RatingScreen component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  star: {
    marginHorizontal: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#1F654C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RatingScreen;
