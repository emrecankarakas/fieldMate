import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import {useAuth} from '../AuthContext';
import avatarMapping from '../assets/avatars/avatarMapping';
import BottomMenu from '../components/BottomMenu';
import {useNavigation} from '@react-navigation/native';
import TeamChatScreen from './TeamChatScreen';
const TeamManagementScreen = () => {
  const [activeTab, setActiveTab] = useState('team');
  const [teamName, setTeamName] = useState('');
  const [friends, setFriends] = useState([]);
  const [teamRequests, setTeamRequests] = useState([]);
  const [userTeam, setUserTeam] = useState(null);
  const [userInfoModalVisible, setUserInfoModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigation = useNavigation();
  const [selectedPlayers, setSelectedPlayers] = useState({
    GK: null,
    CB1: null,
    CB2: null,
    CB3: null,
    CM1: null,
    CM2: null,
    CF: null,
  });
  const [selectedRole, setSelectedRole] = useState(null);

  const {updateUser, user} = useAuth();
  const API_URL = 'http://192.168.1.33:5000/users';

  const handleTeamChatNavigation = () => {
    navigation.navigate('TeamChat');
  };

  const fetchTeamRequests = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-team-requests/${user.user_id}`,
      );
      const data = await response.json();

      if (response.ok) {
        setTeamRequests(data.teamRequests);
      } else {
        console.error('Failed to fetch team requests:', data);
      }
    } catch (error) {
      console.error('Error fetching team requests:', error);
    }
  };
  const fetchUserTeam = async () => {
    if (user.team) {
      try {
        const response = await fetch(`${API_URL}/get-team/${user.team}`);
        const data = await response.json();

        if (response.ok) {
          setUserTeam(data.team);
        } else {
          console.log('Failed to fetch user team:', data);
        }
      } catch (error) {
        console.log('Error fetching user team:', error);
      }
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch(`${API_URL}/get-friends/${user.user_id}`);
      const data = await response.json();

      if (response.ok) {
        const captain = {
          user_id: user.user_id,
          avatar: user.avatar,
          fullname: user.fullname,
          email: user.email,
          age: user.age,
          role: user.role,
          username: user.username,
          team: user.team,
        };
        setFriends([captain, ...data.friends]);
      } else {
        console.error('Failed to fetch user friends:', data);
      }
    } catch (error) {
      console.error('Error fetching user friends:', error);
    }
  };

  useEffect(() => {
    fetchTeamRequests();
    fetchFriends();
    fetchUserTeam();
  }, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    let userAssigned = false;
    for (const role in selectedPlayers) {
      if (
        selectedPlayers[role] &&
        selectedPlayers[role].user_id === user.user_id
      ) {
        userAssigned = true;
        break;
      }
    }

    if (!userAssigned) {
      Alert.alert('Error', 'You must assign yourself to a team role');
      return;
    }

    for (const role in selectedPlayers) {
      if (!selectedPlayers[role]) {
        Alert.alert('Error', `Please select a player for the ${role} role`);
        return;
      }
    }

    const assignedPlayers = Object.values(selectedPlayers);
    const uniquePlayers = [...new Set(assignedPlayers)];
    if (assignedPlayers.length !== uniquePlayers.length) {
      Alert.alert('Error', 'Each player can only be assigned to one role');
      return;
    }

    await createTeam();
  };
  const findRoleForUser = (userTeam, selectedUser) => {
    for (const role in userTeam) {
      const player = userTeam[role];

      if (player && player.user_id === selectedUser.user_id) {
        return role;
      }
    }
    return null;
  };
  const findNameForUser = (userTeam, selectedUser) => {
    for (const role in userTeam) {
      const player = userTeam[role];

      if (player && player.user_id === selectedUser) {
        return player.fullname;
      }
    }
    return null;
  };

  const openFriendsModal = role => {
    setSelectedRole(role);
  };

  const closeFriendsModal = () => {
    setSelectedRole(null);
  };

  const handleLeaveTeam = async selectedUser => {
    if (selectedUser.user_id === userTeam.captain_id) {
      Alert.alert(
        'Before you leave the team, you have to give the captaincy to someone else.',
      );
    } else {
      const role = findRoleForUser(userTeam.players, selectedUser);
      const response = await fetch(`${API_URL}/remove-team-player`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamId: user.team,
          role,
          userId: selectedUser.user_id,
        }),
      });

      if (response.ok) {
        const updatedUserResponse = await fetch(
          `${API_URL}/get-user/${user.user_id}`,
        );
        const updatedUserData = await updatedUserResponse.json();
        if (updatedUserResponse.ok) {
          console.log('Player removed from the team successfully');
          updateUser(updatedUserData.user);
          fetchUserTeam();
        }

        fetchUserTeam();
      } else {
        console.error(
          'Failed to remove player from the team:',
          response.statusText,
        );
      }
    }
  };
  const handleFriendSelect = friend => {
    if (selectedPlayers[selectedRole]) {
      Alert.alert(
        'Player Assigned',
        `A player is already assigned to the ${selectedRole} role. Do you want to replace them?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Replace',
            onPress: () => handleReplacement(friend),
          },
        ],
      );
    } else {
      handlePlayerSelect(selectedRole, friend);
      closeFriendsModal();
    }
  };
  const handlePlayerClick = user => {
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
  const handlePlayerSelect = (role, player) => {
    const isPlayerAlreadyAssigned = Object.values(selectedPlayers).some(
      p => p && p.user_id === player.user_id && p !== selectedPlayers[role],
    );

    if (isPlayerAlreadyAssigned) {
      Alert.alert('Error', 'Each player can only be assigned to one role');
      return;
    }

    let updatedPlayer;

    if (player.user_id !== user.user_id) {
      updatedPlayer = {
        ...player,
        status: 'pending',
      };
    } else {
      updatedPlayer = {
        ...player,
        status: 'active',
      };
    }

    setSelectedPlayers(prevPlayers => ({
      ...prevPlayers,
      [role]: updatedPlayer,
    }));
  };
  const handleTeamFriendSelect = (teamId, role, friend) => {
    Alert.alert(
      'Player Assigned',
      `Are you sure you want to add the ${friend.fullname} to the team?  `,
      [
        {text: 'No', style: 'cancel'},
        {
          text: 'Yes',
          onPress: () => {
            sendTeamRequest(teamId, role, friend);
            closeFriendsModal();
          },
        },
      ],
    );
  };

  const sendTeamRequest = async (teamId, role, friend) => {
    try {
      if (friend && friend.user_id) {
        if (
          !userTeam.players ||
          typeof userTeam.players !== 'object' ||
          !Object.values(userTeam.players).some(
            player => player && player.user_id === friend.user_id,
          )
        ) {
          const response = await fetch(
            `${API_URL}/update-team-player/${teamId}/${role}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                updatedPlayer: {...friend, status: 'pending'},
                captainName: user.fullname,
              }),
            },
          );

          if (response.ok) {
            console.log('Team player updated successfully');
            fetchUserTeam();
          } else {
            console.error('Failed to update team player:', response.statusText);
          }
        } else {
          Alert.alert(
            'Friend is Already in a Team',
            'Selected friend is already part of another team or is in your team players.',
          );
        }
      } else {
        console.error('Invalid friend object or user_id is missing.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const handlePromoteCaptain = async (teamId, newCaptain) => {
    if (newCaptain.status === 'active') {
      const newCaptainId = newCaptain.user_id;
      try {
        const response = await fetch(`${API_URL}/update-captain/${teamId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({newCaptainId}),
        });

        const data = await response.json();

        if (response.ok) {
          console.log('Captain updated successfully');
          closeModal();
          fetchUserTeam();
        } else {
          console.error('Failed to update captain:', data.message);
        }
      } catch (error) {
        console.error('Error updating captain:', error);
      }
    } else {
      Alert.alert('User cannot become captain without joining the team.');
    }
  };

  const handleReplacement = newPlayer => {
    const roleToReplace = selectedRole;
    const currentPlayer = selectedPlayers[roleToReplace];

    if (currentPlayer === newPlayer) {
      Alert.alert('Error', 'Cannot replace with the same player');
    } else if (
      Object.values(selectedPlayers).some(
        p =>
          p &&
          p.user_id === newPlayer.user_id &&
          p !== selectedPlayers[roleToReplace],
      )
    ) {
      Alert.alert('Error', 'New player is already assigned to another role');
    } else {
      let updatedPlayer;

      if (newPlayer.user_id !== user.user_id) {
        updatedPlayer = {
          ...newPlayer,
          status: 'pending',
        };
      } else {
        updatedPlayer = {
          ...newPlayer,
          status: 'active',
        };
      }

      setSelectedPlayers(prevPlayers => ({
        ...prevPlayers,
        [roleToReplace]: updatedPlayer,
      }));
      closeFriendsModal();
    }
  };

  const createTeam = async () => {
    try {
      const response = await fetch(`${API_URL}/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamName,
          captainId: user.user_id,
          selectedPlayers,
          captainName: user.fullname,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const updatedUserResponse = await fetch(
          `${API_URL}/get-user/${user.user_id}`,
        );
        const updatedUserData = await updatedUserResponse.json();

        if (updatedUserResponse.ok) {
          updateUser(updatedUserData.user);
          fetchTeamRequests();
          fetchUserTeam();
        } else {
          console.error('Failed to fetch updated user data:', updatedUserData);
        }
        Alert.alert('Success', 'Team created successfully');
      } else {
        Alert.alert('Error', 'Failed to create team');
        console.error('Failed to create team:', data);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team');
    }
  };
  const handleRemovePlayerFromTeam = async (teamId, userTeam, selectedUser) => {
    const user_id = selectedUser.user_id;
    const role = findRoleForUser(userTeam.players, selectedUser);

    try {
      if (selectedUser.status === 'pending') {
        const response = await fetch(`${API_URL}/reject-team-request`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            receiver_id: user_id,
            team_id: teamId,
            role,
          }),
        });

        if (response.ok) {
          console.log('Team request rejected successfully');
          closeModal();
          fetchUserTeam();
        } else {
          console.error('Failed to reject team request:', response.statusText);
        }
      } else if (selectedUser.status === 'active') {
        const response = await fetch(`${API_URL}/remove-team-player`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            teamId: teamId,
            role,
            userId: selectedUser.user_id,
          }),
        });

        if (response.ok) {
          console.log('Player removed from the team successfully');
          closeModal();
          fetchUserTeam();
        } else {
          console.error(
            'Failed to remove player from the team:',
            response.statusText,
          );
        }
      } else {
        console.error('Invalid status:', status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const acceptTeamRequest = async requestId => {
    try {
      const response = await fetch(`${API_URL}/accept-team-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.user_id,
          requestId: requestId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Team request accepted successfully');

        const updatedUserResponse = await fetch(
          `${API_URL}/get-user/${user.user_id}`,
        );
        const updatedUserData = await updatedUserResponse.json();
        fetchUserTeam();

        if (updatedUserResponse.ok) {
          updateUser(updatedUserData.user);
          fetchTeamRequests();
          fetchUserTeam();
        } else {
          console.error('Failed to fetch updated user data:', updatedUserData);
        }
      } else {
        Alert.alert('Error', 'Failed to accept team request');
        console.error('Failed to accept team request:', data);
      }
    } catch (error) {
      console.error('Error accepting team request:', error);
      Alert.alert('Error', 'Failed to accept team request');
    }
  };

  const rejectTeamRequest = async (
    teamRequestId,
    receiver_id,
    team_id,
    role,
  ) => {
    try {
      const response = await fetch(`${API_URL}/reject-team-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teamRequestId: teamRequestId,
          receiver_id: receiver_id,
          team_id: team_id,
          role: role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Team request rejected successfully');
        fetchTeamRequests();
      } else {
        Alert.alert('Error', 'Failed to reject team request');
        console.error('Failed to reject team request:', data);
      }
    } catch (error) {
      console.error('Error rejecting team request:', error);
      Alert.alert('Error', 'Failed to reject team request');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'team' && styles.activeTab]}
          onPress={() => setActiveTab('team')}>
          <Text style={styles.tabText}>Team</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}>
          <Text style={styles.tabText}>Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'createTeam' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('createTeam')}>
          <Text style={styles.tabText}>Create Team</Text>
        </TouchableOpacity>
        {userTeam && (
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'teamChat' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('teamChat')}>
            <Text style={styles.tabText}>Team Chat</Text>
          </TouchableOpacity>
        )}
      </View>
      {activeTab === 'team' && (
        <View style={styles.teamContainer}>
          {userTeam ? (
            <View>
              {userTeam.captain_id === user.user_id ? (
                <View>
                  <Text style={styles.title}>
                    Your Team: {userTeam.team_name}
                  </Text>

                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginVertical: 8,
                    }}>
                    Team Players:
                  </Text>
                  <View style={styles.rolesContainer}>
                    {Object.keys(userTeam.players).map((role, index) => (
                      <TouchableOpacity
                        key={role}
                        style={styles.roleItem}
                        onPress={() =>
                          !userTeam.players[role] &&
                          userTeam.captain_id === user.user_id
                            ? openFriendsModal(role)
                            : handlePlayerClick(userTeam.players[role])
                        }>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            marginVertical: 2,
                          }}>
                          {role}:
                        </Text>
                        {userTeam.players[role] ? (
                          <View style={styles.selectedPlayerContainer}>
                            <Image
                              source={
                                avatarMapping[userTeam.players[role].avatar]
                              }
                              style={styles.selectedPlayerAvatar}
                            />
                            <View style={styles.playerContainer}>
                              <Text style={styles.playerName}>
                                {userTeam.players[role].fullname}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <Text style={styles.plusText}>+</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View>
                  <Text style={styles.title}>
                    Your Team: {userTeam.team_name}
                  </Text>
                  <Text style={styles.title}>
                    Team Leader:{' '}
                    {findNameForUser(userTeam.players, userTeam.captain_id)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      marginVertical: 8,
                    }}>
                    Team Players:
                  </Text>
                  <View style={styles.rolesContainer}>
                    {Object.keys(userTeam.players).map((role, index) => (
                      <TouchableOpacity
                        key={role}
                        style={styles.roleItem}
                        onPress={() =>
                          userTeam.players[role] !== null &&
                          handlePlayerClick(userTeam.players[role])
                        }>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            marginVertical: 2,
                          }}>
                          {role}:
                        </Text>
                        {userTeam.players[role] !== null ? (
                          <View style={styles.selectedPlayerContainer}>
                            <Image
                              source={
                                avatarMapping[userTeam.players[role].avatar]
                              }
                              style={styles.selectedPlayerAvatar}
                            />
                            <View style={styles.playerContainer}>
                              <Text style={styles.playerName}>
                                {userTeam.players[role].fullname}
                              </Text>
                            </View>
                          </View>
                        ) : (
                          <Text style={styles.plusText}>Empty</Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
              <TouchableOpacity
                style={styles.leaveTeamButton}
                onPress={() => handleLeaveTeam(user)}>
                <Text style={styles.createTeamButtonText}>Leave Team</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text>You are not part of any team yet.</Text>
            </>
          )}
        </View>
      )}

      {activeTab === 'requests' && (
        <View style={styles.requestContainer}>
          {teamRequests.map(request => (
            <View key={request.request_id} style={styles.requestItem}>
              <Text style={styles.requestName}>{request.fullname}</Text>
              <Text style={styles.invitationText}>
                {`You have been invited to join ${request.team_name} team as a ${request.role} player by ${request.captain_name}`}
              </Text>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => acceptTeamRequest(request.request_id)}>
                <Image
                  source={require('../assets/icons/tick.png')}
                  style={styles.icon}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() =>
                  rejectTeamRequest(
                    request.request_id,
                    user.user_id,
                    request.team_id,
                    request.role,
                  )
                }>
                <Text style={styles.rejectButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {activeTab === 'createTeam' && (
        <View style={styles.createTeamContainer}>
          {user.team ? (
            <Text style={styles.errorMessage}>
              You are already part of a team. You cannot create a new team.
            </Text>
          ) : (
            <>
              <Text style={[styles.title, {marginBottom: 20}]}>
                Create Team
              </Text>

              <Text
                style={{fontSize: 16, fontWeight: 'bold', marginVertical: 8}}>
                Team Name:
              </Text>
              <TextInput
                style={styles.input}
                value={teamName}
                onChangeText={setTeamName}
              />

              <View style={styles.rolesContainer}>
                {Object.keys(selectedPlayers).map((role, index) => (
                  <View key={role} style={styles.roleItem}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        marginVertical: 2,
                      }}>
                      {role}:
                    </Text>
                    <TouchableOpacity onPress={() => openFriendsModal(role)}>
                      {selectedPlayers[role] ? (
                        <View style={styles.selectedPlayerContainer}>
                          <Image
                            source={avatarMapping[selectedPlayers[role].avatar]}
                            style={styles.selectedPlayerAvatar}
                          />
                          <Text style={styles.selectedPlayerName}>
                            {selectedPlayers[role].fullname}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.friendItem}>+</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.createTeamButton}
                onPress={handleCreateTeam}>
                <Text style={styles.createTeamButtonText}>Create Team</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      {activeTab === 'teamChat' && (
        <>
          <TeamChatScreen teamPlayers={userTeam?.players} />
          <TouchableOpacity
            onPress={handleTeamChatNavigation}></TouchableOpacity>
        </>
      )}
      <Modal
        visible={selectedRole !== null}
        animationType="slide"
        transparent={false}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Select a friend for {selectedRole}:</Text>
          <FlatList
            data={friends}
            keyExtractor={(item, index) =>
              item.id ? item.id.toString() : index.toString()
            }
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.friendItem}
                onPress={() =>
                  userTeam && userTeam.captain_id === user.user_id
                    ? handleTeamFriendSelect(
                        userTeam.team_id,
                        selectedRole,
                        item,
                      )
                    : handleFriendSelect(item)
                }>
                <Image
                  source={avatarMapping[item.avatar]}
                  style={styles.friendAvatar}
                />
                <Text style={styles.friendName}>{item.fullname}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={styles.createTeamButton}
            onPress={closeFriendsModal}>
            <Text style={styles.createTeamButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={userInfoModalVisible}
        onRequestClose={closeModal}>
        <View style={styles.modalContainer2}>
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
            {selectedUser && selectedUser.status && (
              <Text
                style={
                  styles.userInfo
                }>{`Status: ${selectedUser.status}`}</Text>
            )}
            {userTeam &&
              userTeam.captain_id === user.user_id &&
              userTeam.captain_id !== selectedUser?.user_id && (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.promoteButton]}
                    onPress={() =>
                      handlePromoteCaptain(user.team, selectedUser)
                    }>
                    <Text style={styles.buttonText}>Make Captain</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.removeButton]}
                    onPress={() =>
                      handleRemovePlayerFromTeam(
                        user.team,
                        userTeam,
                        selectedUser,
                      )
                    }>
                    <Text style={styles.buttonText}>Kick Him</Text>
                  </TouchableOpacity>
                </View>
              )}

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
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  buttonContainer: {
    width: '70%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  promoteButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  removeButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  requestName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 16,
    color: 'white',
  },

  invitationText: {
    flex: 1,
    fontSize: 16,
    color: '#555',
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  rejectButton: {
    backgroundColor: 'red',
    borderRadius: 40,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
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
  acceptButton: {
    marginLeft: 10,
    marginRight: 15,
    backgroundColor: '#0E1E5B',
    borderRadius: 40,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
  },
  modalContainer2: {
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
  teamContainer: {
    flex: 1,
    padding: 16,
  },
  requestContainer: {
    flex: 1,
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 18,
    marginTop: 6,
  },
  container: {
    flex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  friendItem: {
    fontSize: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  friendName: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  createTeamContainer: {
    flex: 1,
    padding: 16,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleItem: {
    flex: 1,
    minWidth: '48%',
    marginVertical: 8,
  },
  selectedPlayerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  selectedPlayerAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  selectedPlayerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  plusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  createTeamButton: {
    fontSize: 18,
    color: '#fff',
    backgroundColor: '#0E1E5B',
    marginTop: 32,
    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  leaveTeamButton: {
    fontSize: 18,
    color: '#fff',
    backgroundColor: '#0E1E5B',
    marginTop: 64,

    padding: 12,
    borderRadius: 8,
    textAlign: 'center',
  },
  createTeamButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TeamManagementScreen;
