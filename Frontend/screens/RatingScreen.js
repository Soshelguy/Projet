import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../AuthContext';

const RatingScreen = ({ route, navigation }) => {
  const { serviceId, bookingId } = route.params;
  const { user, authToken } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const fadeAnim = new Animated.Value(0); // Animation for submit button

  // Fade in animation when user selects a rating
  const fadeInButton = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleRatingPress = (star) => {
    setUserRating(star);
    fadeInButton();
  };

  const handleSubmit = async () => {
    if (!user || !authToken) {
      Alert.alert('Error', 'You must be logged in to submit a rating');
      return;
    }

    try {
      console.log('Submitting rating with data:', {
        service_id: serviceId,
        user_id: user.id,
        rating: userRating,
        feedback: userReview,
        booking_id: bookingId
      });

      const response = await fetch('http://192.168.1.2:5000/api/ratings/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          service_id: serviceId,
          user_id: user.id,
          rating: userRating,
          feedback: userReview,
          booking_id: bookingId
        }),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status);
      console.log('Response text:', responseText);

      if (response.ok) {
        navigation.goBack();
      } else {
        let errorMessage = 'Failed to submit rating';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Rate This Service</Text>

      {/* Star Rating */}
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => handleRatingPress(star)} activeOpacity={0.7}>
            <Icon
              name={userRating >= star ? 'star' : 'star-outline'}
              size={50}
              color={userRating >= star ? '#FFD700' : '#A5F1E9'}
              style={[styles.star, userRating >= star && styles.glow]}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Review Input */}
      <TextInput
        style={styles.reviewInput}
        placeholder="Write your review (optional)"
        placeholderTextColor="#aaa"
        value={userReview}
        onChangeText={setUserReview}
        multiline
        numberOfLines={4}
      />

      {/* Submit Button with Animation */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            { opacity: userRating === 0 ? 0.5 : 1 }
          ]}
          disabled={userRating === 0}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Submit Rating</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F654C',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  star: {
    marginHorizontal: 6,
    transform: [{ scale: 1 }],
    transition: 'transform 0.3s ease',
  },
  glow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    transform: [{ scale: 1.2 }], // Slight scale-up effect
  },
  reviewInput: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButton: {
    backgroundColor: '#1F654C',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '80%',
    elevation: 5, // Subtle shadow for depth
    shadowColor: '#1F654C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    transition: 'transform 0.2s ease-in-out',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default RatingScreen;
