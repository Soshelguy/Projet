import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * NotificationsScreen component displays a list of notifications for the user.
 * It fetches notifications from the server and provides functionality to mark them as read.
 */
const NotificationsScreen = ({ navigation }) => {
  // State to store notifications
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications when the component mounts
  useEffect(() => {
    fetchNotifications();
  }, []);

  /**
   * Fetch notifications for the current user from the server.
   */
  const fetchNotifications = async () => {
    try {
      // Retrieve user data from AsyncStorage
      const userData = await AsyncStorage.getItem('userData');
      const { id } = JSON.parse(userData);
      
      // Fetch notifications from the server
      const response = await fetch(`http://192.168.1.2:5000/api/notifications/user/${id}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  /**
   * Mark a specific notification as read.
   * @param {number} notificationId - ID of the notification to be marked as read.
   */
  const markNotificationAsRead = async (notificationId) => {
    try {
      await fetch(`http://192.168.1.2:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  /**
   * Get the icon name based on the notification type.
   * @param {string} type - Type of the notification.
   * @returns {string} - Icon name for the type.
   */
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return 'mail-outline';
      case 'booking':
        return 'calendar-outline';
      case 'rating':
        return 'star-outline';
      default:
        return 'notifications-outline';
    }
  };

  /**
   * Render a single notification item.
   * @param {object} item - Notification item data.
   * @returns JSX element representing the notification item.
   */
  const renderNotification = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unread]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <View style={styles.iconContainer}>
        <Icon name={getNotificationIcon(item.type)} size={24} color="#1F654C" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.time}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unread: {
    backgroundColor: '#f0f8ff',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2ed',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
});

export default NotificationsScreen;
