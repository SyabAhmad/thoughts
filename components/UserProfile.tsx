// components/UserProfile.tsx
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface UserProfileProps {
  name: string;
  about: string;
  subtitle: string;
  profileImage: string;
  lastSeen?: string;
}

export default function UserProfile({ 
  name, 
  about, 
  subtitle, 
  profileImage,
  lastSeen 
}: UserProfileProps) {
  return (
    <View style={styles.container}>
      <Image 
        source={{ uri: profileImage || 'https://i.pravatar.cc/150?img=12' }} 
        style={styles.profileImage}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {about ? <Text style={styles.about}>{about}</Text> : null}
        {lastSeen ? <Text style={styles.lastSeen}>Last seen: {lastSeen}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  about: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});