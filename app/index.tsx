// app/index.tsx
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessageProps';
import MessageInput from '@/components/MessageInputProps';
import { deleteMessage, getAllMessages, getDatabaseInfo, initStorage, MESSAGE_STATUS, onMessageStatusChange, sendMessage } from '@/services/AsyncStorageService';
import { Audio } from 'expo-av';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Initialize database and load messages
  useEffect(() => {
    const checkDatabase = async () => {
      const dbInfo = getDatabaseInfo();
      console.log('Storage Info:', dbInfo);
      
      await initStorage();
      console.log('✅ AsyncStorage initialized - data will persist!');
      
      // Set up status change listener
      onMessageStatusChange((messageId, status) => {
        console.log(`Status change received: Message ${messageId} -> ${status}`);
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, status } 
              : msg
          )
        );
      });
    };
    
    checkDatabase();
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
      console.log('Messages loaded:', storedMessages.length);
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
      status: MESSAGE_STATUS.SENDING, // Start with 'sending'
    };

    // add optimistic message to UI
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Play message sent sound
    playMessageSound();
    
    try {
      // Use sendMessage which returns initial message with 'sent' status
      const result = await sendMessage(text, 1);
      
      // Replace optimistic message with the result
      setMessages(prev =>
        prev.map(m => {
          if (m.id === tempId) {
            return {
              ...result,
              // Keep the timestamp from optimistic message for consistency
              timestamp: m.timestamp
            };
          }
          return m;
        })
      );
      
      // The status updates (delivered, read) will be handled by the status change listener
      
    } catch (error) {
      console.log('Error saving message:', error);
      // Revert optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleDeleteMessage = async (messageId: string | number) => {
    try {
      console.log(`Handling delete for message: ${messageId}`);
      
      // If it's a temporary ID (string starting with 'temp-'), just remove from state
      if (typeof messageId === 'string' && messageId.startsWith('temp-')) {
        console.log('Removing temporary message from state:', messageId);
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        return;
      }
      
      // Otherwise delete from database
      const success = await deleteMessage(messageId);
      console.log(`Delete operation success: ${success}`);
      
      if (success) {
        // Update local state to remove the message
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        console.log('Message removed from UI state');
      } else {
        console.log('Delete operation reported no rows affected');
      }
    } catch (error) {
      console.log('Error deleting message:', error);
    }
  };

  // Update getCurrentTime to return ISO format for consistency
  const getCurrentTime = () => {
    return new Date().toISOString();
  };

  const handleVoiceRecord = () => {
    console.log('Voice recording started');
  };

  // Use a different approach for sound
  const playMessageSound = async () => {
    try {
      // Create sound only once
      const { sound } = await Audio.Sound.createAsync(
        // Use a system sound effect that's more likely to be available
        { uri: 'https://soundbible.com/mp3/Click2-Sebastian-759472264.mp3' },
        { volume: 0.5 }
      );
      
      await sound.playAsync();
      
      // Clean up
      setTimeout(() => {
        sound.unloadAsync();
      }, 1000);
    } catch (error) {
      console.log('Error playing sound, continuing without sound');
      // Don't try fallback - just continue silently
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
  behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
>
  <FlatList
    ref={scrollViewRef}
    style={styles.scrollView}
    contentContainerStyle={styles.scrollContent}
    data={messages}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
      <ChatMessage
        key={item.id.toString()}
        id={item.id}
        text={item.text}
        timestamp={item.timestamp}
        status={item.status}
        onDelete={handleDeleteMessage}
      />
    )}
    ListFooterComponent={() => <View style={{ height: 14 }} />}
    onContentSizeChange={() => {
      if (messages.length > 0) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }}
  />

  {/* 👇 Always pinned at the bottom */}
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