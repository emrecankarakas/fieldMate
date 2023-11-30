import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {useAuth} from '../AuthContext';
import database from '@react-native-firebase/database';

const ChatScreen = ({route}) => {
  const {userName} = route.params;
  const {user} = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  const messagesRef = database().ref('messages');

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const handleSendMessage = async () => {
    try {
      if (user) {
        const newMessageData = {
          sender: user.username,
          receiver: userName,
          text: newMessage,
          timestamp: Date.now(),
        };

        await messagesRef.push(newMessageData);

        setNewMessage('');
      } else {
        console.error('User information not found.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    const onMessagesReceived = snapshot => {
      const data = snapshot.val();
      if (data) {
        const messagesArray = Object.keys(data)
          .map(key => ({id: key, ...data[key]}))
          .filter(
            item =>
              (item.sender === user.username && item.receiver === userName) ||
              (item.sender === userName && item.receiver === user.username),
          )
          .sort((a, b) => a.timestamp - b.timestamp);

        setMessages(messagesArray);
      }
    };

    const messagesRef = database().ref('messages').orderByChild('timestamp');
    messagesRef.on('value', onMessagesReceived);

    return () => {
      messagesRef.off('value', onMessagesReceived);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{userName}</Text>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View
            style={[
              styles.messageContainer,
              item.sender === user.username
                ? styles.senderMessageContainer
                : styles.receiverMessageContainer,
            ]}>
            <View
              style={[
                styles.messageBubble,
                item.sender === user.username
                  ? styles.senderBubble
                  : styles.receiverBubble,
              ]}>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.timestampText}>
                {new Date(item.timestamp).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  senderMessageContainer: {
    alignSelf: 'flex-end',
  },
  receiverMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    maxWidth: '50%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  senderBubble: {
    backgroundColor: '#4CAF50',
    alignSelf: 'flex-end',
  },
  receiverBubble: {
    backgroundColor: '#EDEDED',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'black',
  },
  timestampText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
  },
  sendButton: {
    backgroundColor: '#0E1E5B',
    padding: 10,
    borderRadius: 5,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default ChatScreen;
