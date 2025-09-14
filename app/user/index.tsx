import { createUser, getUser, updateUser } from '@/services/DatabaseService';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Button,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function UserProfileRoute() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [name, setName] = useState('You');
  const [subtitle, setSubtitle] = useState('');
  const [about, setAbout] = useState('');
  const [profileImage, setProfileImage] = useState('https://i.pravatar.cc/150?img=12');
  const [lastSeen, setLastSeen] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Try to load a single "current" user — adjust id logic if you store current id elsewhere.
        const u = await getUser(1);
        if (mounted) {
          if (u) {
            setUserId(1);
            setName(u.name ?? 'You');
            setSubtitle(u.subtitle ?? '');
            setAbout(u.about ?? '');
            setProfileImage(u.profile_image ?? 'https://i.pravatar.cc/150?img=12');
            setLastSeen(u.last_seen ?? undefined);
          } else {
            // No stored user: keep defaults (user will be created on save)
            setUserId(null);
          }
        }
      } catch (e) {
        console.log('Error loading user', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (userId) {
        await updateUser(userId, {
          name,
          about,
          subtitle,
          profileImage,
          lastSeen,
        });
        Alert.alert('Saved', 'Profile updated');
      } else {
        const newId = await createUser(name, about, subtitle, profileImage);
        setUserId(newId);
        Alert.alert('Created', 'Profile created');
        // If you want to keep a stable "current" id you can store it in AsyncStorage or settings table
      }
    } catch (e) {
      console.log('Save error', e);
      Alert.alert('Error', 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Subtitle</Text>
        <TextInput style={styles.input} value={subtitle} onChangeText={setSubtitle} />

        <Text style={styles.label}>About</Text>
        <TextInput style={[styles.input, styles.multiline]} value={about} onChangeText={setAbout} multiline numberOfLines={3} />

        <Text style={styles.label}>Profile Image URL</Text>
        <TextInput style={styles.input} value={profileImage} onChangeText={setProfileImage} />

        <View style={styles.buttonRow}>
          <Button title={userId ? 'Save' : 'Create'} onPress={handleSave} disabled={saving} />
          <View style={{ width: 12 }} />
          <Button title="Back" onPress={() => router.back()} />
        </View>

        {saving && <View style={{ marginTop: 12 }}><ActivityIndicator /></View>}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, color: '#333', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff' },
  multiline: { minHeight: 70, textAlignVertical: 'top' },
  buttonRow: { flexDirection: 'row', marginTop: 20, alignItems: 'center' },
});