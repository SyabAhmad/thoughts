import { useColorScheme } from '@/hooks/use-color-scheme';
import { createUser, getUser, initDatabase } from '@/services/DatabaseService';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // Initialize database on app start
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        // Ensure default user exists
        const user = await getUser(1);
        if (!user) {
          await createUser('MenteE', 'Beloved MenteE', '🫀', 'https://i.pravatar.cc/150?img=5');
        }
      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false, // Hide the header completely
          // Or if you want to keep the header but remove the route display:
          // headerTitle: (props) => {
          //   // Custom header title component that doesn't show the route
          //   return props.children;
          // },
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
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
