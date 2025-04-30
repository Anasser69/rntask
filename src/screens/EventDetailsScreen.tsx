import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeProvider';
import { buildApiUrl } from '../config/api';


interface Event {
  id: string;
  name: string;
  title?: string;
  date: string;
  time?: string;
  location: string;
  price: string;
  description?: string;
  speakers?: string;
  imageUrl?: string;
  image?: string;
  availableSlots: number;
  capacity: number;
}

type RootStackParamList = {
  SignIn: undefined;
  MainApp: undefined;
  EventDetails: { event: Event };
};


type EventDetailsScreenProps = {
  route: RouteProp<RootStackParamList, 'EventDetails'>;
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const EventDetailsScreen = ({ route, navigation }: EventDetailsScreenProps) => {
  const { colors, theme } = useTheme();
  const { event } = route.params;
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [availableSlots, setAvailableSlots] = useState(event.availableSlots);
  const [checkingStatus, setCheckingStatus] = useState(true);

  
  useEffect(() => {
    checkRegistrationStatus();
  }, []);


  const checkRegistrationStatus = async () => {
    try {
      setCheckingStatus(true); 
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setCheckingStatus(false);
        return;
      }
      
      const userRes = await fetch(buildApiUrl(`users/${userId}`));
      
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user data: ${userRes.status}`);
      }
      
      const userData = await userRes.json();
      
      if (userData.registeredEvents && userData.registeredEvents.includes(event.id)) {
        setIsRegistered(true);
      }
    } catch (error) {
      console.error('Error checking registration status:', error);
      Alert.alert(
        'Error',
        'Failed to check registration status. Your registration status may not be accurate.',
        [{ text: 'OK' }]
      );
    } finally {
      setCheckingStatus(false); 
    }
  };

  const handleRegister = async () => {
   
    if (isRegistered) {
      Alert.alert('Already Registered', 'You are already registered for this event.');
      return;
    }

   
    if (availableSlots <= 0) {
      Alert.alert('No Slots Available', 'Sorry, this event is fully booked.');
      return;
    }

    setIsRegistering(true);

    try {
     
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'You need to be logged in to register for events.');
        setIsRegistering(false);
        return;
      }

      
      const eventRes = await fetch(buildApiUrl(`events/${event.id}`));
      
      if (!eventRes.ok) {
        throw new Error(`Failed to fetch event data: ${eventRes.status}`);
      }
      
      const eventData = await eventRes.json();
      
    
      if (eventData.availableSlots <= 0) {
        Alert.alert('No Slots Available', 'Sorry, this event is fully booked.');
        setIsRegistering(false);
        return;
      }

    
      const userRes = await fetch(buildApiUrl(`users/${userId}`));
      
      if (!userRes.ok) {
        throw new Error(`Failed to fetch user data: ${userRes.status}`);
      }
      
      const userData = await userRes.json();
      
     
      if (userData.registeredEvents && userData.registeredEvents.includes(event.id)) {
        Alert.alert('Already Registered', 'You are already registered for this event.');
        setIsRegistered(true);
        setIsRegistering(false);
        return;
      }

     
      const updateEventRes = await fetch(buildApiUrl(`events/${event.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableSlots: eventData.availableSlots - 1
        })
      });
      
      if (!updateEventRes.ok) {
        throw new Error(`Failed to update event: ${updateEventRes.status}`);
      }

     
      const updateUserRes = await fetch(buildApiUrl(`users/${userId}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registeredEvents: [...(userData.registeredEvents || []), event.id]
        })
      });
      
      if (!updateUserRes.ok) {
        throw new Error(`Failed to update user: ${updateUserRes.status}`);
      }

      
      setAvailableSlots(eventData.availableSlots - 1);
      setIsRegistered(true);
      Alert.alert('Success', 'You have successfully registered for this event!');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Error', 
        'Failed to register for the event. Please try again.',
        [
          { 
            text: 'Retry', 
            onPress: () => handleRegister() 
          },
          { 
            text: 'Cancel', 
            style: 'cancel' 
          }
        ]
      );
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />
      
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{event.name}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <Image 
          source={{ uri: event.imageUrl ? event.imageUrl.trim() : 'https://example.com/event-image.jpg' }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
        
        <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{event.name}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>{event.date} at {event.time}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text }]}>${event.price}</Text>
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.text }]}>{event.location}</Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.text }]}>{event.description || 'No description available.'}</Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Speakers</Text>
          <Text style={[styles.description, { color: colors.text }]}>{event.speakers || 'No speakers listed.'}</Text>
          
          <View style={styles.capacityContainer}>
            <Text style={[styles.capacityText, { color: colors.text }]}>
              Available Slots: {availableSlots}/{event.capacity}
            </Text>
            <View style={[styles.progressBar, { backgroundColor: `${colors.primary}30` }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(availableSlots / event.capacity) * 100}%`, backgroundColor: colors.primary }
                ]} 
              />
            </View>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.registerButton, 
              isRegistered && styles.registeredButton,
              availableSlots <= 0 && styles.disabledButton,
              { 
                backgroundColor: isRegistered 
                  ? colors.success 
                  : availableSlots <= 0 
                    ? '#6c757d' 
                    : colors.primary 
              }
            ]} 
            onPress={handleRegister}
            disabled={checkingStatus || isRegistering || isRegistered || availableSlots <= 0}
          >
            {checkingStatus ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : isRegistering ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>
                {isRegistered ? 'Registered' : availableSlots <= 0 ? 'Fully Booked' : 'Register Now'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  content: {
    flex: 1,
  },
  eventImage: {
    width: '100%',
    height: 250,
  },
  detailsContainer: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  capacityContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  capacityText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007BFF',
  },
  registerButton: {
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registeredButton: {
    backgroundColor: '#28a745',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  }
});

export default EventDetailsScreen;