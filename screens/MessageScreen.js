import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../AuthContext';
import avatarMapping from '../assets/avatars/avatarMapping';
import BottomMenu from '../components/BottomMenu';
import database from '@react-native-firebase/database';

const API_URL = 'http://192.168.1.37:5000/users';

const MessageScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('messages');
  const [userFriends, setUserFriends] = useState([]);
  const [friendSearch, setFriendSearch] = useState('');
  const [friendRequests, setFriendRequests] = useState([]);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [messages, setMessages] = useState([]);
  const {user} = useAuth();

  const groupMessagesByUser = (messagesData, currentUsername) => {
    const groupedMessages = {};

    Object.entries(messagesData).forEach(([messageId, message]) => {
      const isSender = message.sender === currentUsername;
      const isReceiver = message.receiver === currentUsername;

      if (isSender || isReceiver) {
        const otherUser = isSender ? message.receiver : message.sender;

        if (
          !groupedMessages[otherUser] ||
          groupedMessages[otherUser].timestamp < message.timestamp
        ) {
          groupedMessages[otherUser] = {
            user: otherUser,
            lastMessage: message.text,
            time: new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
            }),
          };
        }
      }
    });

    return Object.values(groupedMessages);
  };

  const fetchData = useCallback(async () => {
    try {
      if (activeTab === 'friends') {
        await fetchFriendRequests();
        await fetchUserFriends();
      } else if (activeTab === 'messages') {
        const messagesRef = database().ref('messages');
        const snapshot = await messagesRef.once('value');
        const data = snapshot.val();

        if (data) {
          const groupedMessages = groupMessagesByUser(data, user.username);
          setMessages(groupedMessages);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeTab, user.username]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const messagesRef = database().ref('messages');

    const handleSnapshot = snapshot => {
      const data = snapshot.val();

      if (data) {
        const groupedMessages = groupMessagesByUser(data, user.username);
        setMessages(groupedMessages);
      }
    };

    if (activeTab === 'messages') {
      messagesRef.on('value', handleSnapshot);

      return () => {
        messagesRef.off('value', handleSnapshot);
      };
    }
  }, [activeTab, user]);

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-friend-requests/${user.user_id}`,
      );
      const data = await response.json();

      if (response.ok) {
        setFriendRequests(data.friendRequests);
      } else {
        console.error('Failed to fetch friend requests:', data);
      }
    } catch (error) {
      console.error('Error fetching friend requests:', error);
    }
  };

  const fetchUserFriends = async () => {
    try {
      const response = await fetch(`${API_URL}/get-friends/${user.user_id}`);
      const data = await response.json();

      if (response.ok) {
        setUserFriends(data.friends);
      } else {
        console.error('Failed to fetch user friends:', data);
      }
    } catch (error) {
      console.error('Error fetching user friends:', error);
    }
  };

  const handleTabPress = tab => {
    setActiveTab(tab);
  };

  const handleAcceptFriendRequest = async friendRequestId => {
    try {
      const response = await fetch(`${API_URL}/accept-friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          friendRequestId: friendRequestId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Friend Request Accepted', data.message);
        fetchFriendRequests();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert(
        'Error',
        'Failed to accept friend request. Please try again.',
      );
    }
  };

  const handleChatPress = userName => {
    navigation.navigate('Chat', {userName});
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchData();
    renderFriendRequests;
    renderFriendItem;
    renderMessageItem;
  }, [fetchData]);

  const handleRejectFriendRequest = async friendRequestId => {
    try {
      const response = await fetch(`${API_URL}/reject-friend-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          friendRequestId: friendRequestId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Friend Request Rejected', data.message);
        fetchFriendRequests();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert(
        'Error',
        'Failed to reject friend request. Please try again.',
      );
    }
  };

  const handleFriendRequestPress = user => {
    setSelectedUser(user);
    setUserInfoModalVisible(true);
  };

  const closeModal = () => {
    setUserInfoModalVisible(false);
  };

  const timestampToAge = timestamp => {
    const age =
      (new Date().getTime() - timestamp) / (1000 * 60 * 60 * 24 * 365);
    return Math.floor(age);
  };

  const renderFriendRequests = useMemo(
    () =>
      ({item}) =>
        (
          <TouchableOpacity
            style={styles.friendRequestItem}
            onPress={() => handleFriendRequestPress(item)}>
            <Image
              source={avatarMapping[item.avatar]}
              style={styles.friendAvatar}
            />
            <View style={styles.friendRequestInfo}>
              <Text style={styles.friendRequestName}>{item.fullname}</Text>
            </View>
            <View style={styles.friendRequestActions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() =>
                  handleAcceptFriendRequest(item.friend_request_id)
                }>
                <Image
                  source={require('../assets/icons/tick.png')}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() =>
                  handleRejectFriendRequest(item.friend_request_id)
                }>
                <Image
                  source={require('../assets/icons/close.png')}
                  style={styles.actionIcon}
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ),
    [
      handleFriendRequestPress,
      handleAcceptFriendRequest,
      handleRejectFriendRequest,
    ],
  );

  const renderFriendItem = useMemo(
    () =>
      ({item}) =>
        (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => handleChatPress(item.username)}>
            <Image
              source={avatarMapping[item.avatar]}
              style={styles.friendAvatar}
            />
            <Text style={styles.friendName}>{item.fullname}</Text>
          </TouchableOpacity>
        ),
    [handleChatPress],
  );

  const renderMessageItem = useMemo(
    () =>
      ({item}) =>
        (
          <TouchableOpacity
            style={styles.messageItem}
            onPress={() => handleChatPress(item.user)}>
            <View style={styles.messageContainer}>
              <View style={styles.messageContent}>
                <Text style={styles.friendName}>{item.user}</Text>
                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
              </View>
              <Text style={styles.messageTime}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        ),
    [handleChatPress],
  );

  const handleFriendSearch = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/search-user/${friendSearch}`);
      const data = await response.json();

      if (response.ok) {
        Alert.alert('User Found', `User: ${data.user.username}`, [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Add Friend',
            onPress: () => sendFriendRequest(data.user.user_id),
          },
        ]);
      } else {
        Alert.alert('User Not Found', 'No user found with that name.');
      }
    } catch (error) {
      console.error('Error searching for user:', error);
      Alert.alert('Error', 'Failed to search for the user. Please try again.');
    }
  }, [friendSearch, user.user_id]);

  const sendFriendRequest = useCallback(
    async friendId => {
      try {
        const response = await fetch(`${API_URL}/add-friend`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.user_id,
            friendId,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          Alert.alert(
            'Friend Request Sent',
            'Friend request has been sent successfully.',
          );
        } else {
          Alert.alert('Error', data.message);
        }
      } catch (error) {
        console.error('Error sending a friend request:', error);
        Alert.alert(
          'Error',
          'Failed to send a friend request. Please try again.',
        );
      }
    },
    [user.user_id],
  );
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'messages' && styles.activeTab]}
          onPress={() => handleTabPress('messages')}>
          <Text style={styles.tabText}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'friends' && styles.activeTab]}
          onPress={() => handleTabPress('friends')}>
          <Text style={styles.tabText}>Friends</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'friends' && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a friend..."
            value={friendSearch}
            onChangeText={setFriendSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleFriendSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.contentContainer}>
        {activeTab === 'messages' ? (
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }>
            {messages.map(item => (
              <TouchableOpacity
                key={item.user}
                style={styles.messageItem}
                onPress={() => handleChatPress(item.user)}>
                <View style={styles.messageContainer}>
                  <View style={styles.messageContent}>
                    <Text style={styles.friendName}>{item.user}</Text>
                    <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                  </View>
                  <Text style={styles.messageTime}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
              />
            }>
            <View>
              <Text style={styles.sectionTitle}>Friend Requests</Text>
              {friendRequests.map(item => (
                <TouchableOpacity
                  key={item.user_id}
                  style={styles.friendRequestItem}
                  onPress={() => handleFriendRequestPress(item)}>
                  <Image
                    source={avatarMapping[item.avatar]}
                    style={styles.friendAvatar}
                  />
                  <View style={styles.friendRequestInfo}>
                    <Text style={styles.friendRequestName}>
                      {item.fullname}
                    </Text>
                  </View>
                  <View style={styles.friendRequestActions}>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() =>
                        handleAcceptFriendRequest(item.friend_request_id)
                      }>
                      <Image
                        source={require('../assets/icons/tick.png')}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.declineButton}
                      onPress={() =>
                        handleRejectFriendRequest(item.friend_request_id)
                      }>
                      <Image
                        source={require('../assets/icons/close.png')}
                        style={styles.actionIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
              {friendRequests.length === 0 && (
                <Text style={styles.noFriendRequestsText}>
                  You have no friend requests at the moment.
                </Text>
              )}
            </View>

            <View>
              <Text style={styles.sectionTitle}>Your Friends</Text>
              {userFriends.map(item => (
                <TouchableOpacity
                  key={item.user_id}
                  style={styles.friendItem}
                  onPress={() => handleChatPress(item.username)}>
                  <Image
                    source={avatarMapping[item.avatar]}
                    style={styles.friendAvatar}
                  />
                  <Text style={styles.friendName}>{item.fullname}</Text>
                </TouchableOpacity>
              ))}
              {userFriends.length === 0 && (
                <Text style={styles.noFriendRequestsText}>
                  You have no friend at the moment.
                </Text>
              )}
            </View>
          </ScrollView>
        )}
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={userInfoModalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.userInfoModal}>
            <Image
              source={avatarMapping[selectedUser?.avatar]}
              style={styles.userAvatar}
            />
            <Text style={styles.userName}>{selectedUser?.fullname}</Text>
            <Text style={styles.userInfo}>{`Role: ${selectedUser?.role}`}</Text>
            <Text style={styles.userInfo}>{`Age: ${timestampToAge(
              selectedUser?.age,
            )}`}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomMenu />
    </View>
  );
};
const styles = StyleSheet.create({
  scrollViewContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
    marginRight: 10,
  },
  lastMessage: {
    fontSize: 14,
    color: '#757575',
    maxWidth: '70%',
    overflow: 'hidden',
  },
  messageTime: {
    fontSize: 12,
    color: '#BDBDBD',
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  userInfoModal: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  userAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#0E1E5B',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  friendRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  friendRequestInfo: {
    flex: 1,
  },
  friendRequestName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendRequestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  acceptButton: {
    borderRadius: 50,
    backgroundColor: '#4CAF50',
    padding: 8,
    marginHorizontal: 5,
  },
  noFriendRequestsText: {
    color: '#757575',
    textAlign: 'center',
    marginTop: 10,
  },
  declineButton: {
    borderRadius: 50,
    backgroundColor: '#FF5722',
    padding: 8,
    marginHorizontal: 5,
  },
  actionIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
    color: '#0E1E5B',
  },
  messageItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 10,
  },
  messageName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  messageText: {
    color: '#757575',
  },
  messageTime: {
    color: '#BDBDBD',
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBar: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#0E1E5B',
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#FFFFFF',
  },
  tabText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  friendName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#0E1E5B',
    padding: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});

export default MessageScreen;
