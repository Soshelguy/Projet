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
import io from 'socket.io-client';
import { useAuth } from '../AuthContext';

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

    const socket = useRef(null);
    const { authToken, user } = useAuth();
    // Set current user ID from auth context
    useEffect(() => {
        if (user) {
            setCurrentUserId(user.id);
        }
    }, [user]);

    useEffect(() => {
        if (currentUserId) {
            fetchMessages();
        }
    }, [currentUserId]);


    useEffect(() => {
        socket.current = io('http://192.168.1.2:5000');
    
        socket.current.emit('joinRoom', { roomId: bookingId });
    
        socket.current.on('receiveMessage', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
    
        return () => {
            socket.current.disconnect();
        };
    }, [bookingId]);


     // Fetch booking details from the API
     const fetchBookingDetails = async () => {
        try {
            const response = await fetch(`http://192.168.1.2:5000/api/bookings/${bookingId}`);
            const data = await response.json();
            setBooking(data);
        } catch (error) {
            console.error('Error fetching booking details:', error);
        }
    };

   // Fetch messages from the API
   const fetchMessages = async () => {
    try {
        console.log('fetchMessages called');
        console.log('Using bookingId:', bookingId);
        console.log('Current user ID:', currentUserId);
        console.log('Auth token (truncated):', authToken ? authToken.substring(0, 10) + '...' : 'No token');

        const response = await fetch(`http://192.168.1.2:5000/api/messages/booking/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching messages:', errorText);
            return;
        }

        const data = await response.json();
        setMessages(data);

        if (currentUserId) {
            console.log('Marking messages as read for user:', currentUserId);
            const readResponse = await fetch('http://192.168.1.2:5000/api/messages/read', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    user_id: currentUserId
                })
            });
            console.log('Read endpoint responded with status:', readResponse.status);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
};

    // Send a new message to the API
    const sendMessage = async () => {
        if (!newMessage.trim()) return;

        try {
            const messageContent = newMessage.trim();
            console.log('Sending message:', messageContent);
            console.log('Message data:', {
                booking_id: bookingId,
                sender_id: currentUserId,
                receiver_id: currentUserId === providerId ? booking.customer_id : providerId,
                text: messageContent
            });

            const response = await fetch('http://192.168.1.2:5000/api/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    booking_id: bookingId,
                    sender_id: currentUserId,
                    receiver_id: currentUserId === providerId ? booking.customer_id : providerId,
                    text: messageContent
                })
            });

            if (response.ok) {
                const message = await response.json();
                socket.current.emit('sendMessage', { roomId: bookingId, message });
                setNewMessage('');
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
            <Text style={styles.messageText}>{item.text}</Text>
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

