// app/index.tsx
import ChatHeader from '@/components/ChatHeader';
import ChatMessage from '@/components/ChatMessageProps';
import MessageInput from '@/components/MessageInputProps';
import { deleteMessage, getAllMessages, getDatabaseInfo, initStorage, MESSAGE_STATUS, onMessageStatusChange, sendMessage } from '@/services/AsyncStorageService';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { FlatList, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const scrollViewRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  // Initialize AsyncStorage and load messages
  useEffect(() => {
    const checkDatabase = async () => {
      const dbInfo = getDatabaseInfo();
      console.log('📱 Storage Info:', dbInfo);
      
      await initStorage();
      console.log('✅ AsyncStorage initialized - data will persist!');
      
      // Set up status change listener
      onMessageStatusChange((messageId, status) => {
        console.log(`📱 Status change received: Message ${messageId} -> ${status}`);
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
      console.log('📱 Loading messages from AsyncStorage...');
      const storedMessages = await getAllMessages();
      setMessages(storedMessages);
      console.log('✅ Messages loaded from AsyncStorage:', storedMessages.length);
    } catch (error) {
      console.log('❌ Error loading messages:', error);
    }
  };

  const playMessageFeedback = async () => {
    try {
      // Try haptic feedback first
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('✅ Haptic feedback played');
    } catch (hapticError) {
      console.log('❌ Haptic not available');
    }

    try {
      // Also play a very soft sound
      const { sound } = await Audio.Sound.createAsync(
        // Using a short pop sound URL
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
        { 
          volume: 0.1, // Very quiet
          shouldPlay: true,
          isLooping: false,
        }
      );
      
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false, // Respect silent mode
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      
      await sound.playAsync();
      console.log('✅ Sound feedback played');
      
      // Quick cleanup
      setTimeout(() => {
        sound.unloadAsync();
      }, 100);
      
    } catch (soundError) {
      console.log('❌ Sound not available:', soundError);
    }
  };

  const handleSend = async (text: string) => {
    if (!text?.trim()) return;

    const timestamp = getCurrentTime();
    const tempId = `temp-${Date.now()}`;
    
    const optimisticMessage = {
      id: tempId,
      text,
      timestamp,
      status: MESSAGE_STATUS.SENDING,
    };

    setMessages(prev => [...prev, optimisticMessage]);
    playMessageFeedback(); // Both haptic and sound
    
    try {
      console.log('📱 Sending message via AsyncStorage...');
      const result = await sendMessage(text, 1);
      
      setMessages(prev =>
        prev.map(m => {
          if (m.id === tempId) {
            return {
              ...result,
              timestamp: m.timestamp
            };
          }
          return m;
        })
      );
      
    } catch (error) {
      console.log('❌ Error saving message:', error);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const handleDeleteMessage = async (messageId: string | number) => {
    try {
      console.log(`📱 Handling delete for message: ${messageId}`);
      
      if (typeof messageId === 'string' && messageId.startsWith('temp-')) {
        console.log('Removing temporary message from state:', messageId);
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        return;
      }
      
      const success = await deleteMessage(messageId);
      console.log(`✅ Delete operation success: ${success}`);
      
      if (success) {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        console.log('Message removed from UI state');
      } else {
        console.log('Delete operation reported no rows affected');
      }
    } catch (error) {
      console.log('❌ Error deleting message:', error);
    }
  };

  const getCurrentTime = () => {
    return new Date().toISOString();
  };

  const handleVoiceRecord = () => {
    console.log('Voice recording started');
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar 
        backgroundColor="#075e54" 
        barStyle="light-content" 
      />
      
      {/* Top green status bar area to match WhatsApp */}
      <View style={{ height: insets.top, backgroundColor: '#075e54' }} />
      
      {/* Chat header */}
      <ChatHeader />
      
      {/* Chat content */}
      <View style={styles.container}>
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

        <MessageInput onSend={handleSend} onVoiceRecord={handleVoiceRecord} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
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