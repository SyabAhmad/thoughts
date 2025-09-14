import UserProfile from '@/components/UserProfile';
import { getUser } from '@/services/DatabaseService';
import { useSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function UserScreen() {
  const params = useSearchParams();
  const id = params.id;
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const u = await getUser(Number(id));
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
  }, [id]);

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

  return (
    <View style={styles.container}>
      <UserProfile
        name={user.name || 'Unknown'}
        about={user.about || ''}
        subtitle={user.subtitle || ''}
        profileImage={user.profile_image || ''}
        lastSeen={user.last_seen || undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});