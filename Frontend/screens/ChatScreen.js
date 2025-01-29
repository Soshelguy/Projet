import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Platform 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ChatScreen is a component that displays a chat conversation between
 * the current user and a service provider.
 * It fetches messages for a given booking and displays them in a FlatList.
 * It also allows the user to send new messages.
 * Fetching of messages is done every 5 seconds.
 */
const ChatScreen = ({ route, navigation }) => {
    const { bookingId, serviceId, providerId } = route.params;

    // Current user ID is stored in AsyncStorage
    const [currentUserId, setCurrentUserId] = useState(null);

    // Messages are stored in the state
    const [messages, setMessages] = useState([]);

    // New message is stored in the state
    const [newMessage, setNewMessage] = useState('');

    // Reference to the FlatList
    const flatListRef = useRef();

    // Booking details are stored in the state
    const [booking, setBooking] = useState(null);

    // Fetch current user ID from AsyncStorage
    useEffect(() => {
        getCurrentUser();
    }, []);

    // Fetch messages and booking details when the component mounts
    useEffect(() => {
        fetchMessages();
        fetchBookingDetails();

        // Fetch messages every 5 seconds
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    // Fetch current user ID from AsyncStorage
    const getCurrentUser = async () => {
        try {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                const { id } = JSON.parse(userData);
                setCurrentUserId(id);
            }
        } catch (error) {
            console.error('Error getting current user:', error);
        }
    };

    // Fetch booking details from the API
    const fetchBookingDetails = async () => {
        try {
            const response = await fetch(`https://cf8f-197-203-19-175.ngrok-free.app/api/bookings/${bookingId}`);
            const data = await response.json();
            setBooking(data);
        } catch (error) {
            console.error('Error fetching booking details:', error);
        }
    };

    // Fetch messages from the API
    const fetchMessages = async () => {
        try {
            const response = await fetch(`https://cf8f-197-203-19-175.ngrok-free.app/api/messages/booking/${bookingId}`);
            const data = await response.json();
            setMessages(data);

            // Mark messages as read
            if (currentUserId) {
                await fetch('https://cf8f-197-203-19-175.ngrok-free.app/api/messages/read', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        booking_id: bookingId,
                        user_id: currentUserId
                    })
                });
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    // Send a new message to the API
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const response = await fetch('https://cf8f-197-203-19-175.ngrok-free.app/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    sender_id: currentUserId,
                    receiver_id: currentUserId === providerId ? booking.customer_id : providerId,
                    message: newMessage.trim()
                })
            });

            if (response.ok) {
                setNewMessage('');
                fetchMessages();
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Render a message
    const renderMessage = ({ item }) => {
        const isCurrentUser = item.sender_id === currentUserId;
        return (
            <View style={[
                styles.messageContainer,
                isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
            ]}>
                <Text style={styles.messageSender}>{item.sender_name}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
                <Text style={styles.messageTime}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
            </View>
        );
    };

    // Render the chat conversation
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id.toString()}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                onLayout={() => flatListRef.current?.scrollToEnd()}
                style={styles.messagesList}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={setNewMessage}
                    placeholder="Type a message..."
                    multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                    <Icon name="send" size={24} color="#1F654C" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    messagesList: {
        flex: 1,
        padding: 16
    },
    messageContainer: {
        maxWidth: '80%',
        marginVertical: 8,
        padding: 12,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#1F654C',
        borderBottomRightRadius: 4,
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
        borderBottomLeftRadius: 4,
    },
    messageSender: {
        fontSize: 12,
        marginBottom: 4,
        color: '#666'
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        color: '#333'
    },
    messageTime: {
        fontSize: 10,
        color: '#888',
        alignSelf: 'flex-end',
        marginTop: 4
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    input: {
        flex: 1,
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: '#E0F7FA',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        fontSize: 16
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0F7FA',
        justifyContent: 'center',
        alignItems: 'center'
    }
};

export default ChatScreen;

