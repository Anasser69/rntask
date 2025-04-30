import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeProvider';
import useAuthStore from '../store/useAuthStore';
import { buildApiUrl } from '../config/api';

const SignInScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const setUser = useAuthStore((state) => state.setUser);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) {
      setPasswordError('Password is required');
      return false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const generateSessionKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sessionKey = '';
    for (let i = 0; i < 32; i++) {
      sessionKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return sessionKey;
  };

  const saveSessionToStorage = async (userId: string, sessionKey: string) => {
    try {
      await AsyncStorage.setItem('userId', userId);
      await AsyncStorage.setItem('sessionKey', sessionKey);
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  };

  const handleSignIn = async () => {
    
    setGeneralError('');
    

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      
      const response = await fetch(
        `${buildApiUrl(`users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`)}`
      );
      

      if (response.status === 404) {
        setGeneralError('Invalid email or password. Please try again.');
        setLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Network error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.length > 0) {
       
        const user = data[0]; 
        
        let sessionKey = user.sessionKey;
        let needsUpdate = false;
        
        
        if (!sessionKey) {
          sessionKey = generateSessionKey();
          needsUpdate = true;
        }
        
        if (needsUpdate) {
         
          const updateResponse = await fetch(
            buildApiUrl(`users/${user.id}`),
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sessionKey }),
            }
          );
          
          if (!updateResponse.ok) {
            throw new Error(`Failed to update session: ${updateResponse.status}`);
          }
          
          await updateResponse.json();
        }
        
        const sessionSaved = await saveSessionToStorage(user.id, sessionKey);
        
        if (!sessionSaved) {
          throw new Error('Failed to save session to device storage');
        }
        
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          sessionKey: sessionKey
        });
        
        navigation.navigate('MainApp');
      } else {
        setGeneralError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to save session')) {
          setGeneralError('Could not save login session. Please check your device storage.');
        } else if (error.message.includes('Failed to update session')) {
          setGeneralError('Could not create session. Please try again.');
        } else {
          setGeneralError('Network error. Please check your connection and try again.');
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <Text style={[styles.title, { color: colors.text }]}>Sign In</Text>
      
      {generalError ? <Text style={styles.errorMessage}>{generalError}</Text> : null}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: colors.inputBackground,
              borderColor: emailError ? colors.error : colors.inputBorder,
              color: colors.inputText
            }
          ]}
          placeholder="Email"
          placeholderTextColor={`${colors.inputText}80`}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) validateEmail(text);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          onBlur={() => validateEmail(email)}
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        
        <TextInput
          style={[
            styles.input, 
            { 
              backgroundColor: colors.inputBackground,
              borderColor: passwordError ? colors.error : colors.inputBorder,
              color: colors.inputText
            }
          ]}
          placeholder="Password"
          placeholderTextColor={`${colors.inputText}80`}
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) validatePassword(text);
          }}
          secureTextEntry
          onBlur={() => validatePassword(password)}
        />
        {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      </View>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]} 
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>Sign In</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={[styles.linkText, { color: colors.primary }]}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  errorMessage: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    width: '100%',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007BFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007BFF',
    marginTop: 10,
  },
});

export default SignInScreen;