import AsyncStorage from '@react-native-async-storage/async-storage';

export const MESSAGE_STATUS = {
  SENDING: 'sending',
  SENT: 'sent',
  SAVED: 'saved',
  DELIVERED: 'delivered',
  READ: 'read',
};

interface User {
  id: number;
  name: string;
  about: string;
  subtitle: string;
  profileImage: string;
  lastSeen: string;
}

interface Message {
  id: number;
  text: string;
  timestamp: string;
  user_id: number;
  status: string;
  created_at: string;
}

const STORAGE_KEYS = {
  MESSAGES: '@messages',
  USERS: '@users',
  COUNTERS: '@counters',
};

// Initialize default data
export const initStorage = async () => {
  try {
    // Check if user exists, if not create default user
    const users = await getStoredUsers();
    if (users.length === 0) {
      await createUser('You', 'Hey there! I am using Thoughts.', '', '');
    }
    console.log('✅ AsyncStorage initialized successfully');
  } catch (error) {
    console.error('❌ AsyncStorage initialization error:', error);
  }
};

// Helper functions
const getStoredMessages = async (): Promise<Message[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

const getStoredUsers = async (): Promise<User[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

const getCounters = async () => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.COUNTERS);
    return data ? JSON.parse(data) : { lastUserId: 0, lastMessageId: 0 };
  } catch (error) {
    return { lastUserId: 0, lastMessageId: 0 };
  }
};

const saveCounters = async (counters: any) => {
  await AsyncStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
};

// User operations
export const createUser = async (
  name: string,
  about: string = '',
  subtitle: string = '',
  profileImage: string = ''
): Promise<number> => {
  try {
    const users = await getStoredUsers();
    const counters = await getCounters();
    const newId = counters.lastUserId + 1;
    
    const newUser: User = {
      id: newId,
      name,
      about,
      subtitle,
      profileImage,
      lastSeen: new Date().toISOString(),
    };
    
    users.push(newUser);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    await saveCounters({ ...counters, lastUserId: newId });
    
    return newId;
  } catch (error) {
    throw new Error(`Failed to create user: ${error}`);
  }
};

export const getUser = async (userId: number): Promise<User | null> => {
  try {
    const users = await getStoredUsers();
    return users.find(user => user.id === userId) || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const updateUser = async (
  userId: number,
  userData: {
    name?: string;
    about?: string;
    subtitle?: string;
    profileImage?: string;
    lastSeen?: string;
  }
): Promise<boolean> => {
  try {
    console.log('Updating user:', userId, 'with data:', userData);
    
    const users = await getStoredUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      console.log('User not found:', userId);
      return false;
    }
    
    // Update the user object
    users[userIndex] = { 
      ...users[userIndex], 
      ...userData,
      lastSeen: new Date().toISOString() // Update lastSeen on any profile change
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    console.log('User updated successfully:', users[userIndex]);
    
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

// Message operations
export const saveMessage = async (
  text: string,
  timestamp: string,
  userId: number,
  status: string = MESSAGE_STATUS.SENT
): Promise<number> => {
  try {
    const messages = await getStoredMessages();
    const counters = await getCounters();
    const newId = counters.lastMessageId + 1;
    
    const newMessage: Message = {
      id: newId,
      text,
      timestamp,
      user_id: userId,
      status,
      created_at: new Date().toISOString(),
    };
    
    messages.push(newMessage);
    await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    await saveCounters({ ...counters, lastMessageId: newId });
    
    return newId;
  } catch (error) {
    throw new Error(`Failed to save message: ${error}`);
  }
};

export const sendMessage = async (text: string, userId: number): Promise<Message> => {
  const timestamp = new Date().toISOString();
  
  // Insert as 'sent' (represents one tick)
  const id = await saveMessage(text, timestamp, userId, MESSAGE_STATUS.SENT);
  
  // Simulate network delay and then mark as 'delivered' (represents double tick)
  setTimeout(async () => {
    try {
      await updateMessageStatus(id, MESSAGE_STATUS.DELIVERED);
      console.log(`Message ${id} marked as delivered`);
    } catch (err) {
      console.log('Failed to update to delivered status:', err);
    }
  }, 1000); // 1 second delay
  
  // Simulate read status after longer delay
  setTimeout(async () => {
    try {
      await updateMessageStatus(id, MESSAGE_STATUS.READ);
      console.log(`Message ${id} marked as read`);
    } catch (err) {
      console.log('Failed to update to read status:', err);
    }
  }, 3000); // 3 second delay
  
  // Return the message with initial 'sent' status
  return {
    id,
    text,
    timestamp,
    user_id: userId,
    status: MESSAGE_STATUS.SENT,
    created_at: new Date().toISOString(),
  };
};

// Add a function to listen for status changes
export const onMessageStatusChange = (callback: (messageId: number, status: string) => void) => {
  // Store the callback for status updates
  global.messageStatusCallback = callback;
};

export const updateMessageStatus = async (messageId: number, status: string): Promise<void> => {
  try {
    const messages = await getStoredMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
      messages[messageIndex].status = status;
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
      
      // Notify UI of status change
      if (global.messageStatusCallback) {
        global.messageStatusCallback(messageId, status);
      }
      
      console.log(`Message ${messageId} status updated to: ${status}`);
    }
  } catch (error) {
    throw new Error(`Failed to update message status: ${error}`);
  }
};

export const deleteMessage = async (id: number | string): Promise<boolean> => {
  try {
    const messages = await getStoredMessages();
    const filteredMessages = messages.filter(msg => msg.id !== id);
    
    if (filteredMessages.length < messages.length) {
      await AsyncStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(filteredMessages));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
};

export const getDatabaseInfo = () => {
  return {
    databaseType: 'AsyncStorage',
    platform: 'Native',
    persistent: true
  };
};