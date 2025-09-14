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
          <MaterialCommunityIcons name="plus-circle-outline" size={24} color="#666" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message"
          multiline
          maxLength={1000}
        />
        
        {message.length > 0 ? (
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <MaterialCommunityIcons name="send" size={24} color="#075e54" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.micButton} 
            onPress={handleVoicePress}
            onLongPress={handleVoicePress}
          >
            <MaterialCommunityIcons name="microphone" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    position: 'relative',
    bottom: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
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