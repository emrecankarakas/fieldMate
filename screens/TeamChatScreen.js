import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {useAuth} from '../AuthContext';
import database from '@react-native-firebase/database';

const TeamChatScreen = () => {
  const {user} = useAuth();
  const [teamMessages, setTeamMessages] = useState([]);
  const [newTeamMessage, setNewTeamMessage] = useState('');
  const flatListRef = useRef(null);
  const [reports, setReports] = useState([]);

  const teamChatRef = database().ref(`teamChat/${user.team}`);
  console.log(user.team);
  const API_URL = 'http://192.168.1.33:5000/admin';

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [teamMessages]);

  const handleSendTeamMessage = async () => {
    try {
      if (user) {
        const newTeamMessageData = {
          sender: user.username,
          text: newTeamMessage,
          timestamp: Date.now(),
        };

        teamChatRef.push(newTeamMessageData);

        setNewTeamMessage('');
      } else {
        console.error('User information not found.');
      }
    } catch (error) {
      console.error('Error sending team message:', error);
    }
  };

  useEffect(() => {
    const onTeamMessagesReceived = snapshot => {
      const data = snapshot.val();
      if (data) {
        const teamMessagesArray = Object.keys(data)
          .map(key => ({id: key, ...data[key]}))
          .sort((a, b) => a.timestamp - b.timestamp);

        setTeamMessages(teamMessagesArray);
      }
    };

    teamChatRef.on('value', onTeamMessagesReceived);

    return () => {
      teamChatRef.off('value', onTeamMessagesReceived);
    };
  }, [user.team]);

  const renderMessage = ({item}) => {
    const isSentByCurrentUser = item.sender === user.username;

    return (
      <View
        style={[
          styles.messageContainer,
          {
            justifyContent: isSentByCurrentUser ? 'flex-end' : 'flex-start',
          },
        ]}>
        <TouchableOpacity
          onLongPress={() => {
            if (!isSentByCurrentUser) {
              handleLongPress(item);
            }
          }}
          style={[
            styles.messageBubble,
            {
              alignSelf: isSentByCurrentUser ? 'flex-end' : 'flex-start',
              backgroundColor: isSentByCurrentUser ? '#DCF8C5' : '#EDEDED',
            },
          ]}>
          {!isSentByCurrentUser && (
            <Text style={styles.senderText}>{item.sender}</Text>
          )}
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestampText}>
            {new Date(item.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleLongPress = selectedMessage => {
    if (isAlreadyReported(selectedMessage.sender)) {
      Alert.alert(
        'Already Reported',
        'You have already reported this user.',
        [{text: 'OK', style: 'default'}],
        {cancelable: true},
      );
    } else {
      Alert.alert(
        'Report User',
        'Do you want to report this user for inappropriate content?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Report',
            onPress: () => handleReport(selectedMessage),
          },
        ],
        {cancelable: true},
      );
    }
  };

  const handleReport = async selectedMessage => {
    try {
      if (isAlreadyReported(selectedMessage.sender)) {
        Alert.alert(
          'Already Reported',
          'You have already reported this user.',
          [{text: 'OK', style: 'default'}],
          {cancelable: true},
        );
        return;
      }
      const response = await fetch(`${API_URL}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedMessage,
          reporter: user.username,
          reason: 'Humiliation, insulting, swearing',
        }),
      });

      if (response.ok) {
        console.log('Report sent successfully');

        fetchReports();

        Alert.alert(
          'Report Sent',
          'You have successfully reported this user.',
          [{text: 'OK', style: 'default'}],
          {cancelable: true},
        );
      } else {
        console.error('Failed to send report');
        Alert.alert(
          'Error',
          'Failed to send report. Please try again later.',
          [{text: 'OK', style: 'default'}],
          {cancelable: true},
        );
      }
    } catch (error) {
      console.error('Error sending report:', error);

      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.',
        [{text: 'OK', style: 'default'}],
        {cancelable: true},
      );
    }
  };

  const isAlreadyReported = senderUsername => {
    return reports.some(report => {
      return (
        report.reporter_username === user.username &&
        report.reported_username === senderUsername
      );
    });
  };

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/get-reports`);
      const data = await response.json();
      if (response.ok) {
        setReports(data.reports);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Team Chat</Text>
      <FlatList
        ref={flatListRef}
        data={teamMessages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newTeamMessage}
          onChangeText={text => setNewTeamMessage(text)}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendTeamMessage}>
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
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
    position: 'relative',
  },
  messageText: {
    color: 'black',
  },
  senderText: {
    fontWeight: 'bold',
    marginBottom: 5,
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

export default TeamChatScreen;
