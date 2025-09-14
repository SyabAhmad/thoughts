import UserProfile from '@/components/UserProfile';
import { getUser, updateUser } from '@/services/AsyncStorageService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, Text, View } from 'react-native';

// You can pass userId as a prop instead of using useSearchParams
export default function UserScreen({ userId = 1 }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const u = await getUser(userId);
        console.log('Loaded user:', u); // Debug log
        if (mounted) setUser(u);
      } catch (e) {
        console.log('Error loading user:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [userId]);

  // Handle image updates
  const handleImageChange = async (imageUri: string) => {
    if (!user) return;
    try {
      console.log('Updating image to:', imageUri);
      
      // Update locally first
      setUser((prev) => ({ ...prev, profileImage: imageUri }));

      // Then update in database - use consistent property name
      await updateUser(userId, {
        profileImage: imageUri,
      });
      
      console.log('Image updated successfully:', imageUri);
    } catch (e) {
      console.log('Error updating profile image:', e);
    }
  };

  // Handle name updates
  const handleUpdateName = async (newName: string) => {
    if (!user) return;
    try {
      console.log('Updating name to:', newName);
      
      // Update locally first for immediate feedback
      setUser((prev) => ({ ...prev, name: newName }));

      // Then update in database
      await updateUser(userId, {
        name: newName,
      });
      
      console.log('Name updated successfully');
    } catch (e) {
      console.log('Error updating name:', e);
    }
  };

  // Handle about updates
  const handleUpdateAbout = async (newAbout: string) => {
    if (!user) return;
    try {
      console.log('Updating about to:', newAbout);
      
      // Update locally first for immediate feedback
      setUser((prev) => ({ ...prev, about: newAbout }));

      // Then update in database
      await updateUser(userId, {
        about: newAbout,
      });
      
      console.log('About updated successfully');
    } catch (e) {
      console.log('Error updating about:', e);
    }
  };
  
  // Handler for phone updates
  const handleUpdatePhone = async (newPhone: string) => {
    if (!user) return;
    try {
      console.log('Updating phone to:', newPhone);
      
      setUser((prev) => ({ ...prev, subtitle: newPhone }));
      
      await updateUser(userId, {
        subtitle: newPhone,
      });
      
      console.log('Phone updated successfully');
    } catch (e) {
      console.log('Error updating phone:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#075e54" />
        <Text style={{ marginTop: 10 }}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>User not found</Text>
      </View>
    );
  }

  console.log('Rendering user:', user); // Debug log

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="white" 
        barStyle="dark-content" 
      />
      <UserProfile
        name={user.name || 'Your Name'}
        about={user.about || 'Hey there! I am using Thoughts.'}
        profileImage={user.profileImage || 'https://i.pravatar.cc/150?img=12'}
        phone={user.subtitle || '+1 (555) 123-4567'}
        lastSeen={user.lastSeen || 'Today at 10:30 AM'}
        onNameChange={handleUpdateName}
        onAboutChange={handleUpdateAbout}
        onPhoneChange={handleUpdatePhone}
        onImageChange={handleImageChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});