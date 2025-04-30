import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator, FlatList, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import useAuthStore from '../store/useAuthStore';
import { buildApiUrl } from '../config/api';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  price?: string;
  image?: string;
  imageUrl?: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  registeredEvents?: string[];
}


type RootStackParamList = {
  SignIn: undefined;
  EventDetails: { event: Event };
};

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const { theme, toggleTheme, colors } = useTheme();
  const [userData, setUserData] = useState<User | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserData();
    
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });
    
    return unsubscribe;
  }, [navigation]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(''); 
      
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'SignIn' }],
        });
        return;
      }
      
 
      const userResponse = await fetch(buildApiUrl(`users/${userId}`));
      
      if (!userResponse.ok) {
        throw new Error(`Failed to fetch user data: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json() as User;
      setUserData(userData);
      
      if (userData.registeredEvents && userData.registeredEvents.length > 0) {
        try {
          const eventPromises = userData.registeredEvents.map((id: string) => 
            fetch(buildApiUrl(`events/${id}`))
              .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch event ${id}: ${res.status}`);
                return res.json();
              })
              .catch(err => {
                console.error(`Error fetching event ${id}:`, err);
                return null;
              })
          );
          
          const eventDetails = await Promise.all(eventPromises);
          setRegisteredEvents(eventDetails.filter(Boolean) as Event[]);
        } catch (eventError) {
          console.error('Error fetching event details:', eventError);
          setError('Some event details could not be loaded.');
        }
      } else {
        setRegisteredEvents([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearUser = useAuthStore((state) => state.clearUser);

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('sessionKey');
      clearUser(); 
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert(
        'Sign Out Error',
        'There was a problem signing out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderEventItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.eventItem}
      onPress={() => navigation.navigate('EventDetails', { event: item })}
    >
      <View style={styles.eventItemContent}>
        <Text style={styles.eventItemTitle}>{item.name}</Text>
        <View style={styles.eventItemDetails}>
          <View style={styles.eventItemDetail}>
            <Ionicons name="calendar-outline" size={14} color="#007BFF" />
            <Text style={styles.eventItemDetailText}>{item.date}</Text>
          </View>
          <View style={styles.eventItemDetail}>
            <Ionicons name="location-outline" size={14} color="#007BFF" />
            <Text style={styles.eventItemDetailText}>{item.location}</Text>
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.headerBackground} />
      
      <View style={[styles.header, { backgroundColor: colors.headerBackground }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.name, { color: colors.headerText }]}>{userData?.name || 'User'}</Text>
          <Text style={[styles.email, { color: colors.headerText }]}>{userData?.email || ''}</Text>
        </View>
        
        <View style={[styles.headerCurve, { backgroundColor: colors.background }]} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Theme Toggle Section */}
        <View style={[styles.settingsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={22} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: `${colors.primary}80` }}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
        
        {/* Registered Events Section */}
        {registeredEvents.length > 0 && (
          <View style={[styles.eventsSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Registered Events</Text>
            <FlatList
              data={registeredEvents}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.eventItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('EventDetails', { event: item })}
                >
                  <View style={styles.eventItemContent}>
                    <Text style={[styles.eventItemTitle, { color: colors.text }]}>{item.name}</Text>
                    <View style={styles.eventItemDetails}>
                      <View style={styles.eventItemDetail}>
                        <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                        <Text style={[styles.eventItemDetailText, { color: colors.text }]}>{item.date}</Text>
                      </View>
                      <View style={styles.eventItemDetail}>
                        <Ionicons name="location-outline" size={14} color={colors.primary} />
                        <Text style={[styles.eventItemDetailText, { color: colors.text }]}>{item.location}</Text>
                      </View>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.border} />
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.eventsList}
            />
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.signOutButton, { backgroundColor: colors.error }]} 
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingBottom: 80, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007BFF',
    paddingTop: 30,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  headerCurve: {
    height: 50,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  eventsSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  eventsList: {
    paddingBottom: 10,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  eventItemContent: {
    flex: 1,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  eventItemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  eventItemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 5,
  },
  eventItemDetailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 80,
  },
  signOutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingsSection: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProfileScreen;