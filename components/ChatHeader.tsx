import { getUser } from '@/services/AsyncStorageService';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChatHeader() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const loadUser = useCallback(async () => {
    try {
      const userData = await getUser(1); // Default user ID
      console.log('ChatHeader: Loading user data:', userData);
      setUser(userData);
    } catch (error) {
      console.log('Error loading user for header:', error);
    }
  }, []);

  // Load user data on component mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Reload user data when screen comes into focus (when returning from profile)
  useFocusEffect(
    useCallback(() => {
      console.log('ChatHeader: Screen focused, reloading user data');
      loadUser();
    }, [loadUser])
  );

  const handleProfilePress = () => {
    router.push('/user');
  };

  // Format lastSeen timestamp
  const formatLastSeen = (lastSeen: string) => {
    if (!lastSeen) return 'Tap here for profile info';

    try {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));

      if (diffInMinutes < 1) {
        return 'online';
      } else if (diffInMinutes < 60) {
        return `last seen ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 1440) {
        // Less than 24 hours
        const hours = Math.floor(diffInMinutes / 60);
        return `last seen ${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInMinutes < 2880) {
        // Less than 48 hours
        return 'last seen yesterday';
      } else {
        // Show formatted date for older timestamps
        return `last seen ${lastSeenDate.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        })}`;
      }
    } catch (error) {
      return 'Tap here for profile info';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileSection}
        onPress={handleProfilePress}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: user?.profileImage || user?.profile_image || 'https://i.pravatar.cc/150?img=12',
          }}
          style={styles.profileImage}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'Thoughts'}</Text>
          <Text style={styles.userInfo}>{user?.about || 'Your Thoughts'}</Text>
          {/* <Text style={styles.userStatus}>{formatLastSeen(user?.lastSeen)}</Text> */}
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        {/* <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📹</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📞</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#075e54',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
    color: '#fff',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  userStatus: {
    fontSize: 13,
    color: '#b3d9d3',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  actionIcon: {
    fontSize: 20,
    color: '#fff',
  },
});