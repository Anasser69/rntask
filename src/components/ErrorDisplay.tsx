import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  iconSize?: number;
  color?: string;
}

const ErrorDisplay = ({ 
  message, 
  onRetry, 
  retryText = 'Retry', 
  iconSize = 48,
  color = '#FF3B30' 
}: ErrorDisplayProps) => {
  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={iconSize} color={color} />
      <Text style={[styles.message, { color }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: color }]} 
          onPress={onRetry}
        >
          <Text style={styles.retryButtonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ErrorDisplay;