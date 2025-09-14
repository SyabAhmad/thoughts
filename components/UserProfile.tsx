// components/UserProfile.tsx
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface UserProfileProps {
  name: string;
  about: string;
  profileImage: string;
  phone?: string;
  lastSeen?: string;
  onNameChange?: (name: string) => void;
  onAboutChange?: (about: string) => void;
  onPhoneChange?: (phone: string) => void;
  onInfoChange?: (index: number, info: string) => void;
  onImageChange?: (imageUri: string) => void;
}

function UserProfile({ 
  name, 
  about, 
  profileImage,
  phone = '+1 (555) 123-4567',
  lastSeen,
  onNameChange,
  onAboutChange,
  onPhoneChange,
  onInfoChange,
  onImageChange
}: UserProfileProps) {
  // Edit states
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingInfo1, setIsEditingInfo1] = useState(false);
  const [isEditingInfo2, setIsEditingInfo2] = useState(false);
  
  // Edit values - sync with props
  const [editedName, setEditedName] = useState(name);
  const [editedAbout, setEditedAbout] = useState(about);
  const [editedPhone, setEditedPhone] = useState(phone);
  const [editedInfo1, setEditedInfo1] = useState('📱 Mobile');
  const [editedInfo2, setEditedInfo2] = useState('⏰ Tap to view all services');

  // Update local state when props change
  useEffect(() => {
    setEditedName(name);
  }, [name]);

  useEffect(() => {
    setEditedAbout(about);
  }, [about]);

  useEffect(() => {
    setEditedPhone(phone);
  }, [phone]);

  // Handle image selection
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImageUri = result.assets[0].uri;
      if (onImageChange) {
        onImageChange(selectedImageUri);
      }
    }
  };

  // Save handlers
  const handleNameSave = () => {
    if (onNameChange && editedName.trim()) {
      onNameChange(editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleAboutSave = () => {
    if (onAboutChange) {
      onAboutChange(editedAbout);
    }
    setIsEditingAbout(false);
  };

  const handlePhoneSave = () => {
    if (onPhoneChange && editedPhone.trim()) {
      onPhoneChange(editedPhone.trim());
    }
    setIsEditingPhone(false);
  };

  const handleInfo1Save = () => {
    if (onInfoChange) {
      onInfoChange(0, editedInfo1);
    }
    setIsEditingInfo1(false);
  };

  const handleInfo2Save = () => {
    if (onInfoChange) {
      onInfoChange(1, editedInfo2);
    }
    setIsEditingInfo2(false);
  };

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.profileImageContainer}>
        <Image 
          source={{ uri: profileImage || 'https://i.pravatar.cc/150?img=12' }} 
          style={styles.profileImage}
        />
        <TouchableOpacity 
          style={styles.editImageButton}
          onPress={handlePickImage}
        >
          <Text style={styles.editImageText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Name Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>NAME</Text>
        {isEditingName ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editedName}
              onChangeText={setEditedName}
              autoFocus
              onSubmitEditing={handleNameSave}
              onBlur={handleNameSave}
              placeholder="Enter your name"
            />
            <TouchableOpacity onPress={handleNameSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{name || 'Tap to add name'}</Text>
            <TouchableOpacity 
              onPress={() => {
                setIsEditingName(true);
                setEditedName(name || '');
              }}
              style={styles.editIcon}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ABOUT</Text>
        {isEditingAbout ? (
          <View style={styles.editContainer}>
            <TextInput
              style={[styles.editInput, styles.multilineInput]}
              value={editedAbout}
              onChangeText={setEditedAbout}
              autoFocus
              multiline
              onBlur={handleAboutSave}
              placeholder="Add about info"
            />
            <TouchableOpacity onPress={handleAboutSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{about || 'Hey there! I am using Thoughts.'}</Text>
            <TouchableOpacity 
              onPress={() => {
                setIsEditingAbout(true);
                setEditedAbout(about || '');
              }}
              style={styles.editIcon}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Phone Number Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>PHONE</Text>
        {isEditingPhone ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editedPhone}
              onChangeText={setEditedPhone}
              autoFocus
              keyboardType="phone-pad"
              onSubmitEditing={handlePhoneSave}
              onBlur={handlePhoneSave}
              placeholder="Enter phone number"
            />
            <TouchableOpacity onPress={handlePhoneSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{phone || 'Tap to add phone'}</Text>
            <TouchableOpacity 
              onPress={() => {
                setIsEditingPhone(true);
                setEditedPhone(phone || '');
              }}
              style={styles.editIcon}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Status Section */}
      {lastSeen && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LAST SEEN</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{lastSeen}</Text>
          </View>
        </View>
      )}

      {/* Additional Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>INFO</Text>
        
        {/* Info Item 1 */}
        {isEditingInfo1 ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editedInfo1}
              onChangeText={setEditedInfo1}
              autoFocus
              onSubmitEditing={handleInfo1Save}
              onBlur={handleInfo1Save}
            />
            <TouchableOpacity onPress={handleInfo1Save} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{editedInfo1}</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingInfo1(true)}
              style={styles.editIcon}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Info Item 2 */}
        {isEditingInfo2 ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editedInfo2}
              onChangeText={setEditedInfo2}
              autoFocus
              onSubmitEditing={handleInfo2Save}
              onBlur={handleInfo2Save}
            />
            <TouchableOpacity onPress={handleInfo2Save} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoRow}>
            <Text style={styles.infoText}>{editedInfo2}</Text>
            <TouchableOpacity 
              onPress={() => setIsEditingInfo2(true)}
              style={styles.editIcon}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    flex: 1,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 24,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  editImageButton: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    position: 'absolute',
    bottom: 5,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  editIcon: {
    padding: 8,
  },
  editIconText: {
    fontSize: 16,
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  editInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
  },
  multilineInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#075e54',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UserProfile;