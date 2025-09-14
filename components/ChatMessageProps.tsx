import { MESSAGE_STATUS } from '@/services/AsyncStorageService';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface ChatMessageProps {
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  isOutgoing?: boolean;
  id: string | number;
  onDelete?: (id: string | number) => void;
}

export default function ChatMessage({ 
  text, 
  timestamp, 
  status = 'sent', 
  isOutgoing = true,
  id,
  onDelete
}: ChatMessageProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [lastTap, setLastTap] = useState<number | null>(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handlePress = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      // Double tap detected
      handleDoubleTap();
      setLastTap(null);
    } else {
      setLastTap(now);
    }
  };

  const handleDoubleTap = () => {
    setShowOptions(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const handleDelete = () => {
    // First, log to verify it's being called
    console.log("Delete pressed for message:", id);
    
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            console.log("Confirmed delete for message ID:", id);
            // Make sure onDelete is defined before calling it
            if (onDelete) {
              onDelete(id);
            } else {
              console.error("onDelete function is not defined");
            }
            setShowOptions(false);
          },
          style: "destructive"
        }
      ]
    );
  };

  const closeOptions = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowOptions(false));
  };

  const getStatusIcon = () => {
  switch (status) {
    case MESSAGE_STATUS.SENDING:
      return '🍂'; // Falling leaf for sending (in progress)
    case MESSAGE_STATUS.SENT:
      return '🍃'; // Light green leaf for sent
    case MESSAGE_STATUS.SAVED:
    case MESSAGE_STATUS.DELIVERED:
      return '🍁'; // Orange/red leaf for delivered
    case MESSAGE_STATUS.READ:
      return '🌳'; // Tree emoji for read (burning/seen)
    default:
      return '🍃';
  }
};

  // Get status icon
  // const getStatusIcon = () => {
  //   switch (status) {
  //     case MESSAGE_STATUS.SENDING:
  //       return '🕐'; // Clock icon for sending
  //     case MESSAGE_STATUS.SENT:
  //       return '✓'; // Single tick for sent
  //     case MESSAGE_STATUS.SAVED:
  //     case MESSAGE_STATUS.DELIVERED:
  //       return '✓✓'; // Double tick for delivered
  //     case MESSAGE_STATUS.READ:
  //       return '💙✓✓'; // Blue double tick for read
  //     default:
  //       return '✓';
  //   }
  // };

  // Format timestamp to show only time for today's messages
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    
    // Check if the message is from today
    if (messageDate.toDateString() === now.toDateString()) {
      // Return only time for today's messages (12-hour format with AM/PM)
      return messageDate.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Return short date + time for older messages
    return messageDate.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.messageContainer,
        isOutgoing ? styles.outgoingMessage : styles.incomingMessage,
      ]}
      onLongPress={() => onDelete?.(id)}
      delayLongPress={500}
    >
      <Text style={[
        styles.messageText,
        isOutgoing ? styles.outgoingText : styles.incomingText,
      ]}>
        {text}
      </Text>
      <View style={styles.messageFooter}>
        <Text style={[
          styles.timestamp,
          isOutgoing ? styles.outgoingTimestamp : styles.incomingTimestamp,
        ]}>
          {formatTimestamp(timestamp)}
        </Text>
        {isOutgoing && (
          <Text style={styles.statusIcon}>
            {getStatusIcon()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    maxWidth: '80%',
    minWidth: 120,
    marginVertical: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  outgoingMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6', // WhatsApp green bubble
    borderTopRightRadius: 4,
  },
  incomingMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  outgoingText: {
    color: '#000',
  },
  incomingText: {
    color: '#000',
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#7e7e7e',
    marginRight: 4,
  },
  outgoingTimestamp: {
    color: '#7e7e7e',
  },
  incomingTimestamp: {
    color: '#7e7e7e',
  },
  statusIcon: {
    fontSize: 12,
    marginLeft: 4,
    color: '#666',
  },
});