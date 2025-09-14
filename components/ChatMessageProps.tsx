import { MESSAGE_STATUS } from '@/services/DatabaseService';
import { StyleSheet, Text, View } from 'react-native';

export default function ChatMessage({ text, timestamp, status = 'sent', isOutgoing = true }) {
  // Render message status indicator (ticks)
  const renderStatus = () => {
    if (status === MESSAGE_STATUS.SENDING) {
      return <Text style={styles.pending}>●</Text>; // or spinner
    } else if (status === MESSAGE_STATUS.SENT) {
      return <Text style={styles.tickGray}>✓</Text>; // one gray tick
    } else if (status === MESSAGE_STATUS.SAVED) {
      return <Text style={styles.tickBlue}>✓✓</Text>; // two blue ticks
    } else if (status === MESSAGE_STATUS.DELIVERED) {
      return <Text style={styles.tickGray}>✓✓</Text>; // two gray ticks
    } else if (status === MESSAGE_STATUS.READ) {
      return <Text style={styles.tickBlue}>✓✓</Text>; // two blue ticks
    }
    return null;
  };

  return (
    <View style={[styles.bubble, isOutgoing ? styles.outgoing : styles.incoming]}>
      <Text style={styles.text}>{text}</Text>
      <View style={styles.metadata}>
        <Text style={styles.timestamp}>{timestamp}</Text>
        <View style={styles.statusContainer}>{renderStatus()}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  outgoing: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6', // WhatsApp green for outgoing
    marginLeft: 40,
  },
  incoming: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    marginRight: 40,
  },
  text: {
    fontSize: 16,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#7f8c8d',
    marginRight: 4,
  },
  statusContainer: {
    width: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickGray: {
    color: '#7f8c8d',
    fontSize: 12,
  },
  tickBlue: {
    color: '#34b7f1', // WhatsApp blue
    fontSize: 12,
  },
  pending: {
    color: '#7f8c8d',
    fontSize: 9,
  },
});