import { MESSAGE_STATUS } from '@/services/DatabaseService';
import { StyleSheet, Text, View } from 'react-native';

export default function ChatMessage({ text, timestamp, status = 'sent', isOutgoing = true }) {
  // Render message status indicator (ticks)
  const renderStatus = () => {
    if (status === MESSAGE_STATUS.SENDING) {
      return <Text style={styles.pending}>●</Text>; // or spinner
    } else if (status === MESSAGE_STATUS.SENT) {
      // Single tick (sent)
      return <Text style={styles.tickGray}>✓</Text>;
    } else if (status === MESSAGE_STATUS.SAVED || status === MESSAGE_STATUS.READ) {
      // Double ticks (saved/read) - render side-by-side using flexRow
      return (
        <View style={styles.doubleTicks}>
          <Text style={styles.tickBlue}>✓</Text>
          <Text style={styles.tickBlue}>✓</Text>
        </View>
      );
    } else if (status === MESSAGE_STATUS.DELIVERED) {
      // Double gray ticks (delivered) - render side-by-side
      return (
        <View style={styles.doubleTicks}>
          <Text style={styles.tickGray}>✓</Text>
          <Text style={styles.tickGray}>✓</Text>
        </View>
      );
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
    minWidth: 20,
    alignItems: 'flex-end',
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
  // New style for side-by-side ticks
  doubleTicks: {
    flexDirection: 'row', // Side by side
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});