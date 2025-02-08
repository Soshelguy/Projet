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

const ChatScreen = ({ route, navigation }) => {
    const { bookingId, serviceId, providerId } = route.params;
    const [isProvider, setIsProvider] = useState(false);

    const [currentUserId, setCurrentUserId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const flatListRef = useRef();
    const [booking, setBooking] = useState(null);
    const socket = useRef(null);
    const { authToken, user } = useAuth();

    useEffect(() => {
        if (user) {
            setCurrentUserId(user.id);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setCurrentUserId(user.id);
            setIsProvider(user.id === providerId);
        }
    }, [user, providerId]);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const response = await fetch(
                    `http://192.168.1.2:5000/api/bookings/${bookingId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    }
                );
        
                // Check content type
                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    const text = await response.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('Invalid server response');
                }
        
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch booking');
                }
        
                const data = await response.json();
                setBooking(data);
            } catch (error) {
                console.error('Error fetching booking:', error);
            }
        };
    
        if (bookingId && authToken) {
            fetchBookingDetails();
        }
    }, [bookingId, authToken]);
    useEffect(() => {
        if (currentUserId) {
            fetchMessages();
        }
    }, [currentUserId]);

    // Update socket effect
useEffect(() => {
    socket.current = io('http://192.168.1.2:5000');
    
    socket.current.emit('joinRoom', { roomId: bookingId });
    
    // Listen for new messages
    socket.current.on('receiveMessage', (newMessage) => {
        console.log('Received new message:', newMessage);
        setMessages(prevMessages => [...prevMessages, newMessage]);
        // Scroll to bottom when new message arrives
        flatListRef.current?.scrollToEnd();
    });
    
    // Clean up socket connection and listeners
    return () => {
        if (socket.current) {
            socket.current.off('receiveMessage');
            socket.current.disconnect();
        }
    };
}, [bookingId]);

    // Update the fetchMessages function logging
    const fetchMessages = async () => {
        try {
            console.log('Frontend: Fetching messages for booking', bookingId);
            
            if (!bookingId) {
                console.error('Frontend: No booking ID provided');
                return;
            }
    
            const url = `http://192.168.1.2:5000/api/messages/booking/${bookingId}`;
            console.log('Frontend: Fetching from URL:', url);
    
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
    
            console.log('Frontend: Response status:', response.status);
    
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Frontend: Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Frontend: Received messages:', data.length);
            setMessages(data);
    
        } catch (error) {
            console.error('Frontend: Ftch error:', error);
            setMessages([]);
        }
    };

   // sendMessage function
   const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
        // Ensure booking is loaded
        if (!booking) {
            console.error('No booking data available');
            return;
        }

        // Determine receiver_id based on role
        const receiverId = isProvider ? booking.customer_id : booking.provider_id;

        // Log for debugging
        console.log('Sending message with:', {
            booking_id: bookingId,
            sender_id: currentUserId,
            receiver_id: receiverId,
            text: newMessage.trim()
        });

        if (!receiverId) {
            throw new Error('Could not determine message recipient');
        }

        const response = await fetch('http://192.168.1.2:5000/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                booking_id: bookingId,
                sender_id: currentUserId,
                receiver_id: receiverId,
                text: newMessage.trim()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send message');
        }

        const sentMessage = await response.json();
        setNewMessage('');
        setMessages(prevMessages => [...prevMessages, sentMessage]);

    } catch (error) {
        console.error('Error sending message:', error);
        Alert.alert('Error', 'Failed to send message');
    }
};

    //  renderMessage function

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

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => {
                        if (!isProvider && booking?.status === 'completed') {
                            navigation.navigate('RatingScreen', { serviceId, bookingId });
                        } else {
                            navigation.goBack();
                        }
                    }}
    >
        <Icon name="close" size={40} color="#000" style={styles.exitButton}/>
    </TouchableOpacity>
            </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        backgroundColor: '#fff'
    },
    exitButton: {
        marginTop: 20,
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
        backgroundColor: '#E3F2FD', // Light blue background
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