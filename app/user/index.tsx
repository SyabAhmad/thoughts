import UserScreen from '@/components/UserScreen';
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function UserProfileRoute() {
  // Use default user ID 1
  // This matches what you create in HomeScreen
  return (
    <SafeAreaView style={styles.container}>
      <UserScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff' 
  },
});