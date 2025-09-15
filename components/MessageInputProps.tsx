import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface MessageInputProps {
  onSend: (text: string) => void;
  onVoiceRecord: () => void;
}

export default function MessageInput({ onSend, onVoiceRecord }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim().length > 0) {
      onSend(message);
      setMessage('');
    }
  };

  const handleVoicePress = () => {
    // Handle long press for voice recording
    onVoiceRecord();
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton}>
          <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          placeholderTextColor="#888"
          multiline
          maxLength={1000}
        />
        
        {message.length > 0 ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={24} color="#0d7377" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.micButton} 
            onPress={handleVoicePress}
            onLongPress={handleVoicePress}
          >
            <MaterialCommunityIcons name="microphone" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#444', // Darker border for dark theme
    position: 'relative',
    bottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#333', // Darker background for input container
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff', // White border for text input container
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  attachButton: {
    padding: 4,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#fff', // White text
    maxHeight: 100,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  micButton: {
    padding: 6,
    marginLeft: 4,
  },
  sendButton: {
    padding: 6,
    marginLeft: 4,
  },
});