import { useColorScheme } from '@/hooks/use-color-scheme';
import { createUser, getUser, initStorage } from '@/services/AsyncStorageService'; // ✅ Using AsyncStorage
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize AsyncStorage on app start
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        console.log('🚀 Initializing AsyncStorage...');
        await initStorage();
        // Ensure default user exists
        const user = await getUser(1);
        if (!user) {
          await createUser('MenteE', 'Beloved MenteE', '🫀', 'https://i.pravatar.cc/150?img=5');
          console.log('✅ Default user created in AsyncStorage');
        } else {
          console.log('✅ User already exists in AsyncStorage:', user);
        }
      } catch (error) {
        console.error('❌ AsyncStorage initialization error:', error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName="index"
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="user/index"
            options={{
              headerShown: true,
              headerTitle: 'Profile',
              presentation: 'modal',
            }}
          />
        </Stack>
      </KeyboardAvoidingView>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
