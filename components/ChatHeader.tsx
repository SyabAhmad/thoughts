import { getUser } from '@/services/DatabaseService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ChatHeader = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      // Using user ID 1 as the default user
      const userData = await getUser(1);
      console.log('Fetched user data:', userData); // Debug log
      setUser(userData);
    } catch (error) {
      console.log('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data initially when component mounts
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Re-fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
      return () => {
        // Cleanup function if needed
      };
    }, [fetchUserData])
  );

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => router.push('/user')}
        accessibilityRole="button"
        accessibilityLabel="Open user profile"
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Image
              source={{ uri: user?.profile_image || 'https://i.pravatar.cc/150?img=12' }}
              style={styles.profileImage}
            />
            <View style={styles.textContainer}>
              <Text style={styles.name}>{user?.name || 'You'}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.status}>{user?.about || 'Online'}</Text>
              </View>
            </View>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton}>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#075e54',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 0, // Remove the excessive margin
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  profileContainer: { flexDirection: 'row', alignItems: 'center' },
  profileImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  textContainer: { marginLeft: 12 },
  name: { fontSize: 18, fontWeight: '600', color: '#fff' },
  statusContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  onlineIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4fce5d', marginRight: 6 },
  status: { fontSize: 13, color: '#d1ffdb' },
  menuButton: { padding: 4 },
});

export default ChatHeader;