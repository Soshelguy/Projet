import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';

const ServiceBookingModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  serviceId, 
  authToken 
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [unavailableSlots, setUnavailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    if (visible && serviceId) {
      fetchUnavailableSlots();
    }
  }, [visible, serviceId, selectedDate]);

  const fetchUnavailableSlots = async () => {
    setLoadingSlots(true);
    try {
        const response = await fetch(`http://192.168.1.2:5000/api/bookings/unavailable-slots/${serviceId}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch unavailable slots');
        }
        
        const data = await response.json();
        // Convert the time format to match your display format
        const formattedSlots = data.map(slot => ({
            date: slot.date,
            time: moment(slot.time, 'HH:mm:ss').format('HH:00')
        }));
        setUnavailableSlots(formattedSlots);
    } catch (error) {
        console.error('Error fetching unavailable slots:', error);
        Alert.alert(
            'Error',
            'Failed to load available time slots. Please try again later.'
        );
    } finally {
        setLoadingSlots(false);
    }
};

  const generateTimeSlots = () => [
    '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', 
    '17:00', '18:00'
  ];

  const isSlotUnavailable = (date, time) => {
    if (!date || !time || !Array.isArray(unavailableSlots)) return false;
    
    const formattedDate = moment(date).format('YYYY-MM-DD');
    
    return unavailableSlots.some(slot => 
        slot.date === formattedDate && 
        slot.time === time
    );
};
const isDateFullyBooked = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const slotsForDate = unavailableSlots.filter(slot => slot.date === formattedDate);
    const totalTimeSlots = generateTimeSlots().length;
    return slotsForDate.length >= totalTimeSlots;
};
 // Disable time selection if no date is selected
 const renderTimeSlots = () => {
  if (!selectedDate) {
      return (
          <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                  Please select a date first
              </Text>
          </View>
      );
  }

  return (
      <View style={styles.timeGrid}>
          {generateTimeSlots().map((time) => {
              const unavailable = isSlotUnavailable(selectedDate, time);
              return (
                  <TouchableOpacity
                      key={time}
                      style={[
                          styles.timeSlotButton,
                          selectedTimeSlot === time && styles.selectedTimeSlotButton,
                          unavailable && styles.unavailableTimeSlot
                      ]}
                      onPress={() => !unavailable && setSelectedTimeSlot(time)}
                      disabled={unavailable}
                  >
                      <Text style={[
                          styles.timeSlotText,
                          selectedTimeSlot === time && styles.selectedTimeSlotTextWhite,
                          unavailable && styles.unavailableTimeSlotText
                      ]}>
                          {time}
                      </Text>
                      {unavailable && (
                          <Icon 
                              name="close-circle" 
                              size={16} 
                              color="#FF4444" 
                              style={styles.unavailableIcon} 
                          />
                      )}
                  </TouchableOpacity>
              );
          })}
      </View>
  );
};

  const generateAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = moment().add(i, 'days');
      const formattedDate = date.format('YYYY-MM-DD');
      
      // Check if all time slots for this date are unavailable
      const slotsForDate = generateTimeSlots().filter(
        time => !isSlotUnavailable(date, time)
      );
      
      dates.push({
        date: date,
        isAvailable: slotsForDate.length > 0
      });
    }
    return dates;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {generateAvailableDates().map(({date, isAvailable}) => (
          <TouchableOpacity
            key={date.format('YYYY-MM-DD')}
            style={[
              styles.dateButton,
              selectedDate?.format('YYYY-MM-DD') === date.format('YYYY-MM-DD') && 
                styles.selectedDateButton,
              !isAvailable && styles.unavailableDateButton
            ]}
            onPress={() => isAvailable ? setSelectedDate(date) : null}
            disabled={!isAvailable}
          >
            <Text style={styles.dateText}>{date.format('ddd')}</Text>
            <Text style={styles.dateNumberText}>{date.format('D')}</Text>
            {!isAvailable && (
              <View style={styles.unavailableOverlay}>
                <Icon name="close-circle" size={24} color="#FF4444" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.title}>Select Time</Text>
      {renderTimeSlots()}


      <TouchableOpacity
        style={[
          styles.confirmButton,
          (!selectedDate || !selectedTimeSlot) && styles.disabledButton
        ]}
        onPress={() => onConfirm(selectedDate, selectedTimeSlot)}
        disabled={!selectedDate || !selectedTimeSlot}
      >
        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
};
 // Add these styles
 const additionalStyles = StyleSheet.create({
  messageContainer: {
      padding: 20,
      alignItems: 'center',
      backgroundColor: '#f5f5f5',
      borderRadius: 8,
      marginVertical: 10
  },
  messageText: {
      color: '#666',
      fontSize: 16
  }
});
const styles = {
  container: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
   unavailableOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -12 },
      { translateY: -12 }
    ],
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  dateButton: {
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    minWidth: 60,
  },
  selectedDateButton: {
    backgroundColor: '#1F654C',
  },
  unavailableDateButton: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  dateText: {
    color: '#333',
    fontWeight: '500',
  },
  dateNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 5,
  },
  timeSlotButton: {
    width: '30%',
    aspectRatio: 2,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
  },
  selectedTimeSlotButton: {
    backgroundColor: '#1F654C',
    borderColor: '#1F654C',
  },
  timeSlot: {
    width: '30%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedTimeSlot: {
    backgroundColor: '#1F654C',
  },
  unavailableTimeSlot: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  unavailableTimeSlot: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
},
unavailableTimeSlotText: {
    color: '#999',
},
unavailableIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
        { translateX: -8 },
        { translateY: -8 }
    ]
},
  timeText: {
    color: '#333',
  },
  selectedTimeText: {
    color: 'white',
  },
  unavailableTimeText: {
    color: '#999',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  confirmButton: {
    backgroundColor: '#1F654C',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
};

export default ServiceBookingModal;