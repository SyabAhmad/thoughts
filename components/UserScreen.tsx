import UserProfile from '@/components/UserProfile';
import { getUser, updateUser } from '@/services/DatabaseService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// You can pass userId as a prop instead of using useSearchParams
export default function UserScreen({ userId = 1 }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const u = await getUser(userId);
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
      // Update locally first with the correct property name
      setUser((prev) => ({ ...prev, profile_image: imageUri }));

      // Then update in database with the correct property name
      await updateUser(userId, {
        ...user,
        profileImage: imageUri, // This matches what updateUser expects
      });
      
      // Add debug logging
      console.log('Image updated successfully:', imageUri);
    } catch (e) {
      console.log('Error updating profile image:', e);
    }
  };

  // Handle name updates
  const handleUpdateName = async (newName: string) => {
    if (!user) return;
    try {
      // Update locally first for immediate feedback
      setUser((prev) => ({ ...prev, name: newName }));

      // Then update in database
      await updateUser(userId, {
        ...user,
        name: newName,
      });
    } catch (e) {
      console.log('Error updating name:', e);
    }
  };

  // Handle about updates
  const handleUpdateAbout = async (newAbout: string) => {
    if (!user) return;
    try {
      // Update locally first for immediate feedback
      setUser((prev) => ({ ...prev, about: newAbout }));

      // Then update in database
      await updateUser(userId, {
        ...user,
        about: newAbout,
      });
    } catch (e) {
      console.log('Error updating about:', e);
    }
  };
  
  // Handler for phone updates
  const handleUpdatePhone = async (newPhone: string) => {
    if (!user) return;
    try {
      setUser((prev) => ({ ...prev, subtitle: newPhone }));
      
      await updateUser(userId, {
        ...user,
        subtitle: newPhone,
      });
    } catch (e) {
      console.log('Error updating phone:', e);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
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

  // Fix in the render section
  return (
    <View style={styles.container}>
      <UserProfile
        name={user.name || 'John Doe'}
        about={user.about || 'Hey there! I am using WhatsApp.'}
        profileImage={user.profile_image || 'https://i.pravatar.cc/150?img=12'}
        phone={user.subtitle}
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