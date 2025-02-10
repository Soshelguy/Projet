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
        if (user && booking) {
            setCurrentUserId(user.id);
            setIsProvider(user.id === booking.provider_id);
        }
    }, [user, booking]);

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
// socket effect
    useEffect(() => {
       // Initialize socket
       socket.current = io('http://192.168.1.2:5000');
    
    // Join chat room
    socket.current.emit('joinRoom', { roomId: bookingId });
    
        // Listen for new messages
    socket.current.on('receiveMessage', (newMessage) => {
        console.log('Received new message via socket:', newMessage);
        setMessages(prevMessages => {
            // Check if message already exists to prevent duplicates
            if (prevMessages.some(msg => msg.id === newMessage.id)) {
                return prevMessages;
            }
            return [...prevMessages, newMessage];
        });
        
        // Mark as read if receiver is current user
        if (newMessage.receiver_id === currentUserId) {
            markMessagesAsRead();
        }
        flatListRef.current?.scrollToEnd();
    });
    
         // Listen for read status updates
    socket.current.on('messagesRead', ({ reader_id }) => {
        console.log('Messages marked as read by:', reader_id);
        setMessages(prevMessages => 
            prevMessages.map(msg => 
                msg.receiver_id === reader_id ? { ...msg, read: true } : msg
            )
        );
    });
        
    return () => {
        if (socket.current) {
            socket.current.disconnect();
        }
    };
}, [bookingId, currentUserId]);

// Move markMessagesAsRead outside useEffect
const markMessagesAsRead = async () => {
    try {
        const response = await fetch('http://192.168.1.2:5000/api/messages/read', {
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

        if (response.ok) {
            // Emit socket event for real-time update
            socket.current.emit('markAsRead', {
                roomId: bookingId,
                booking_id: bookingId,
                user_id: currentUserId
            });
        }
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
};

// read status check on messages update
useEffect(() => {
    if (messages.length > 0 && currentUserId) {
        const hasUnreadMessages = messages.some(
            msg => msg.receiver_id === currentUserId && !msg.read
        );
        if (hasUnreadMessages) {
            markMessagesAsRead();
        }
    }
}, [messages, currentUserId]);

    // fetchMessages function logging
    const fetchMessages = async () => {
        try {
            console.log('Fetching messages for booking:', bookingId);
            
            if (!bookingId) {
                console.error('No booking ID provided');
                return;
            }
    
            const response = await fetch(
                `http://192.168.1.2:5000/api/messages/booking/${bookingId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Received messages data:', data);
            
            if (data && data.messages) {
                setMessages(data.messages);
            }
    
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };

   // sendMessage function
   const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
        const messageContent = newMessage.trim();
        let receiverId;
        
        if (isProvider) {
            // Provider sending to customer
            receiverId = booking.customer_id;
        } else {
            // Customer sending to provider
            receiverId = booking.provider_id;
        }

        console.log('Message details:', {
            isProvider,
            currentUserId: user?.id,
            providerId: booking?.provider_id,
            customerId: booking?.customer_id,
            receiverId
        });

        if (!receiverId) {
            console.error('Cannot determine receiver. Booking:', booking);
            return;
        }

        const messageData = {
            booking_id: bookingId,
            sender_id: currentUserId,
            receiver_id: receiverId,
            text: messageContent
        };

        const response = await fetch('http://192.168.1.2:5000/api/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(messageData)
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const savedMessage = await response.json();
        console.log('Message saved:', savedMessage);

        // Emit after successful save
        socket.current.emit('sendMessage', {
            roomId: bookingId,
            message: savedMessage
        });

        setNewMessage('');

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
                <View style={styles.messageFooter}>
                    <Text style={styles.messageTime}>
                        {new Date(item.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        })}
                    </Text>
                    {isCurrentUser && (
                        <Icon 
                            name={item.read ? "checkmark-done" : "checkmark"} 
                            size={16} 
                            color={item.read ? "#4CAF50" : "#999"}
                            style={styles.readIndicator}
                        />
                    )}
                </View>
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
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4
    },
    readIndicator: {
        marginLeft: 4
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
    },
    unreadDot: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF4444',
    }
};

export default ChatScreen;