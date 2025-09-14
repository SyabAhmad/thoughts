// app/index.tsx
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StatusBar, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessageProps';
import MessageInput from '@/components/MessageInputProps';
import { getAllMessages, MESSAGE_STATUS, sendMessage } from '@/services/DatabaseService';

export default function HomeScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);
  const insets = useSafeAreaInsets();

  // Initialize database and load messages
  useEffect(() => {
    loadMessages();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const loadMessages = async () => {
    try {
      const storedMessages = await getAllMessages();
      setMessages(storedMessages);
    } catch (error) {
      console.log('Error loading messages:', error);
    }
  };

  const handleSend = async (text: string) => {
    if (!text?.trim()) return;

    // compute timestamp up front
    const timestamp = getCurrentTime();
    const tempId = `temp-${Date.now()}`;
    
    const optimisticMessage = {
      id: tempId,
      text,
      timestamp,
      status: MESSAGE_STATUS.SENT,
    };

    // add optimistic message to UI
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Scroll to the new message
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      // Use sendMessage instead of saveMessage (this properly handles sent → saved transition)
      const result = await sendMessage(text, 1);
      
      // Replace optimistic message with the result (which has status=saved)
      setMessages(prev =>
        prev.map(m => {
          if (m.id === tempId) {
            return { ...m, id: result.id, status: result.status };
          }
          return m;
        })
      );
    } catch (error) {
      console.log('Error saving message:', error);
      // leave optimistic message as 'sent' (one tick) if DB fails
      setMessages(prev =>
        prev.map(m => (m.id === tempId ? { ...m, status: MESSAGE_STATUS.SENT } : m))
      );
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleVoiceRecord = () => {
    console.log('Voice recording started');
  };

  // Alternative approach using a system sound
  const playMessageSound = async () => {
    try {
      // Use a system sound - no file needed
      await Audio.Sound.createAsync(
        { uri: 'https://github.com/expo/expo/blob/master/apps/native-component-list/assets/sounds/one7.mp3?raw=true' },
        { shouldPlay: true }
      );
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar 
        backgroundColor="white" 
        barStyle="dark-content" 
      />
      
      {/* Top white status bar area */}
      <View style={{ height: insets.top, backgroundColor: 'white' }} />
      
      {/* Chat header */}
      <ChatHeader />
      
      {/* Chat content */}
      <View style={styles.container}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior="padding"
        >
          <KeyboardAwareScrollView 
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid={true}
            extraScrollHeight={100}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id.toString()}
                text={message.text}
                timestamp={message.timestamp}
                status={message.status}
              />
            ))}
            <View style={{ height: 14 }} />
          </KeyboardAwareScrollView>
          <MessageInput onSend={handleSend} onVoiceRecord={handleVoiceRecord} />
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5', // WhatsApp-like background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 8,
    flexGrow: 1,
  },
});