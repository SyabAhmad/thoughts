// app/index.tsx
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessageProps';
import MessageInput from '@/components/MessageInputProps';
import { createUser, getAllMessages, getUser, initDatabase, MESSAGE_STATUS, sendMessage } from '@/services/DatabaseService';

export default function HomeScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  // Initialize database and load messages
  useEffect(() => {
    initDatabase();
    loadMessages();

    // ensure a default user exists (simple approach)
    (async () => {
      try {
        const u = await getUser(1);
        if (!u) {
          await createUser('You', 'About you', 'subtitle', 'https://i.pravatar.cc/150?img=12');
        }
      } catch (e) {
        console.log('ensure user error', e);
      }
    })();
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

  return (
    <View style={styles.container}>
      <ChatHeader />
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior="padding" // Use padding for both platforms
        // keyboardVerticalOffset={60} // Increased offset for Android
      >
        <KeyboardAwareScrollView 
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          enableOnAndroid={true}
          extraScrollHeight={100}  // Add this to give extra space
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
    flexGrow: 1, // Add this to ensure content expands
  },
});