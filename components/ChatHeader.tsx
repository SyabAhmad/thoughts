import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ChatHeader = () => {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.profileContainer}
        onPress={() => router.push('/user')}
        accessibilityRole="button"
        accessibilityLabel="Open user profile"
      >
        <Image
          source={{ uri: 'https://i.pravatar.cc/150?img=12' }}
          style={styles.profileImage}
        />
        <View style={styles.textContainer}>
          <Text style={styles.name}>You</Text>
          <View style={styles.statusContainer}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.status}>Online</Text>
          </View>
        </View>
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