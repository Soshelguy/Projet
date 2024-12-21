import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RatingScreen = ({ route, navigation }) => {
  const { serviceId, bookingId } = route.params;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      const { id: userId } = JSON.parse(userData);

      const response = await fetch('https://8b7f-41-100-123-0.ngrok-free.app/api/ratings/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          user_id: userId,
          rating,
          review
        }),
      });

      if (response.ok) {
        navigation.goBack();
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
            onPress={() => setRating(star)}
          >
            <Icon
              name={rating >= star ? 'star' : 'star-outline'}
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
        value={review}
        onChangeText={setReview}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity 
        style={[
          styles.submitButton,
          { opacity: rating === 0 ? 0.5 : 1 }
        ]}
        disabled={rating === 0}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Submit Rating</Text>
      </TouchableOpacity>
    </View>
  );
};

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