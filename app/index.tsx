// app/index.tsx
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessageProps';
import MessageInput from '@/components/MessageInputProps';
import { createUser, getAllMessages, getUser, initDatabase, MESSAGE_STATUS, sendMessage } from '@/services/DatabaseService';

export default function HomeScreen() {
  const [messages, setMessages] = useState<any[]>([]);

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

  const loadMessages = async () => {
    try {
      const storedMessages = await getAllMessages();
      setMessages(storedMessages);
    } catch (error) {
      console.log('Error loading messages:', error);
      // Fallback to initial messages if database fails
      const initialMessages = [
        { id: '1', text: 'Hey there! How are you doing?', timestamp: '10:30 AM', status: 'read' as const },
        { id: '2', text: 'I was thinking about our meeting tomorrow. Should we prepare the presentation?', timestamp: '10:32 AM', status: 'read' as const },
        { id: '3', text: 'Yes, that sounds good. I\'ll bring the slides.', timestamp: '10:35 AM', status: 'delivered' as const },
        { id: '4', text: 'Perfect! See you at 2 PM then. Don\'t forget to bring the documents.', timestamp: '10:36 AM', status: 'sent' as const },
      ];
      setMessages(initialMessages);
    }
  };

  const handleSend = async (text: string) => {
    if (!text?.trim()) return;

    // compute timestamp up front
    const timestamp = getCurrentTime();
    const tempId = `temp-${Date.now()}`;
    
    console.log('1. Adding optimistic message with status:', MESSAGE_STATUS.SENT);
    
    const optimisticMessage = {
      id: tempId,
      text,
      timestamp,
      status: MESSAGE_STATUS.SENT,
    };

    // add optimistic message to UI
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      console.log('2. Calling sendMessage...');
      // Use sendMessage instead of saveMessage (this properly handles sent → saved transition)
      const result = await sendMessage(text, 1);
      console.log('3. sendMessage returned with status:', result.status);
      
      // Replace optimistic message with the result (which has status=saved)
      setMessages(prev =>
        prev.map(m => {
          if (m.id === tempId) {
            console.log('4. Updating message from', m.status, 'to', result.status);
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
      <KeyboardAwareScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        extraScrollHeight={100}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id.toString()}
            text={message.text}
            timestamp={message.timestamp}
            status={message.status}
          />
        ))}
        <View style={{ flex: 1 }} />
      </KeyboardAwareScrollView>
      <MessageInput onSend={handleSend} onVoiceRecord={handleVoiceRecord} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5ddd5', // Changed to WhatsApp-like background
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
});