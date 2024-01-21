import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
  Image,
} from 'react-native';
import {useAuth} from '../AuthContext';
import BottomMenu from '../components/BottomMenu';
import ReservationTopMenu from '../components/ReservationTopMenu';
import MatchAd from '../components/MatchAd';
import {ScrollView} from 'react-native-gesture-handler';

const ReservationScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('matches');
  const [reservedFields, setReservedFields] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
  const [isRoleModalVisible, setRoleModalVisible] = useState(false);
  const [matchAds, setMatchAds] = useState([]);
  const {user} = useAuth();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isCreateMatchModalVisible, setCreateMatchModalVisible] =
    useState(false);
  const handleTabPress = tab => {
    setActiveTab(tab);
  };
  useEffect(() => {
    fetchReservationsByUser(user.user_id);
    fetchMatchRequestsByUser(user.user_id);
    fetchMatches();
  }, [activeTab]);
  const roleOptions = ['GK', 'CB1', 'CB2', 'CB3', 'CM1', 'CM2', 'CF'];

  const leaveTeam = async matchAd => {
    try {
      Alert.alert(
        'Confirm',
        'Are you sure you want to leave the match?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Leave',
            onPress: async () => {
              const response = await fetch(
                'http://192.168.1.33:5000/users/leave-match',
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    match_id: matchAd.match_id,
                    user_id: user.user_id,
                  }),
                },
              );

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                  errorData.message || 'Failed to leave the team for the match',
                );
              }

              const responseData = await response.json();
              Alert.alert('Left the team successfully');
              fetchMatches();
              return responseData;
            },
          },
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.error(error);

      throw new Error('Failed to leave the team for the match');
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.33:5000/users/get-all-matches`,
      );

      if (response.ok) {
        const data = await response.json();
        setMatchAds(data.matches);
      } else {
        console.error('Error fetching matches:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };
  const fetchMatchRequestsByUser = async userId => {
    try {
      const response = await fetch(
        `http://192.168.1.33:5000/users/get-match-requests/${userId}`,
      );
      const data = await response.json();
      console.log(data.reservations);

      setMatchRequests(data.reservations);
    } catch (error) {
      console.error('Error fetching match requests by user:', error);
    }
  };
  const isUserInMatch = (match, userId) => {
    const allPlayers = [
      ...match.team1_info.players,
      ...match.team2_info.players,
    ];
    return allPlayers.some(player => player.userId === userId);
  };
  const acceptMatchRequest = async (
    matchId,
    request_id,
    teamName,
    userId,
    position,
  ) => {
    try {
      const response = await fetch(
        'http://192.168.1.33:5000/users/accept-match-request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_id: matchId,
            match_request_id: request_id,
            team_name: teamName,
            user_id: userId,
            position: position,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept match request');
      }

      const responseData = await response.json();
      Alert.alert('Match request accepted');
      fetchReservationsByUser(user.user_id);
      fetchMatchRequestsByUser(user.user_id);
      fetchMatches();
      return responseData;
    } catch (error) {
      console.error(error);

      throw new Error('Failed to accept match request');
    }
  };
  const rejectMatchRequest = async matchRequestId => {
    try {
      const response = await fetch(
        'http://192.168.1.33:5000/users/reject-match-request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            match_request_id: matchRequestId,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject match request');
      }

      const responseData = await response.json();
      Alert.alert('Match request declined');
      fetchReservationsByUser(user.user_id);
      fetchMatchRequestsByUser(user.user_id);
      return responseData;
    } catch (error) {
      console.error(error.message);
      throw new Error('Failed to reject match request');
    }
  };
  const handleRoleSelect = role => {
    handleCreateMatch(role);
    setRoleModalVisible(false);
  };
  const fetchReservationsByUser = async userId => {
    try {
      const response = await fetch(
        `http://192.168.1.33:5000/field/get-reservations-by-user/${userId}`,
      );
      const data = await response.json();
      setReservedFields(data.reservations);
    } catch (error) {
      console.error('Error fetching reservations by user:', error);
    }
  };
  const handleCancelReservation = async reservationId => {
    try {
      const response = await fetch(
        `http://192.168.1.33:5000/field/cancel-reservation/${reservationId}`,
        {
          method: 'DELETE',
        },
      );

      if (response.ok) {
        fetchReservationsByUser(user.user_id);
      } else {
        console.error('Error cancelling reservation:', response.statusText);
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };
  const handleCreateMatchPress = item => {
    setSelectedReservation(item);
    toggleCreateMatchModal();
  };
  const toggleCreateMatchModal = () => {
    setCreateMatchModalVisible(!isCreateMatchModalVisible);
  };
  const handleCreateMatch = async role => {
    try {
      if (role) {
        const {
          reserved_hour,
          reserved_date,
          location,
          field_id,
          reservation_id,
        } = selectedReservation;

        const team1Info = {
          name: 'Team A',
          players: roleOptions.map(position => ({
            position,
            isFull: position === role,
            userId: position === role ? user.user_id : null,
          })),
        };

        const team2Info = {
          name: 'Team B',
          players: roleOptions.map(position => ({
            position,
            isFull: false,
            userId: null,
          })),
        };

        const requestBody = {
          team1Info,
          team2Info,
          fieldInfo: {
            time: reserved_hour,
            day: reserved_date,
            location: location,
          },
          fieldId: field_id,
          userId: user.user_id,
          reservation_id,
        };

        const createMatchResponse = await fetch(
          'http://192.168.1.33:5000/users/create-match',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          },
        );

        const createMatchData = await createMatchResponse.json();

        if (createMatchResponse.ok) {
          setCreateMatchModalVisible(false);

          Alert.alert('Success', createMatchData.message);
        } else {
          setCreateMatchModalVisible(false);

          Alert.alert(
            'Error',
            createMatchData.message || 'Failed to create match',
          );
        }
      }
    } catch (error) {
      console.error('Error creating match:', error);
    }
  };

  const handleCreateMatchWithTeam = async () => {
    try {
      const teamResponse = await fetch(
        `http://192.168.1.33:5000/users/get-team/${user.team}`,
      );
      const teamData = await teamResponse.json();

      if (teamResponse.ok) {
        const {
          reserved_hour,
          reserved_date,
          location,
          field_id,
          reservation_id,
        } = selectedReservation;

        const team1Info = {
          name: teamData.team.team_name,
          players: [
            {position: 'GK', isFull: false, userId: null},
            {position: 'CB1', isFull: false, userId: null},
            {position: 'CB2', isFull: false, userId: null},
            {position: 'CB3', isFull: false, userId: null},
            {position: 'CM1', isFull: false, userId: null},
            {position: 'CM2', isFull: false, userId: null},
            {position: 'CF', isFull: false, userId: null},
          ],
        };

        Object.keys(teamData.team.players).forEach(position => {
          const player = teamData.team.players[position];
          const playerIndex = team1Info.players.findIndex(
            p => p.position === position,
          );

          if (playerIndex !== -1) {
            team1Info.players[playerIndex] = {
              ...team1Info.players[playerIndex],
              isFull: true,
              userId: player.user_id,
            };
          }
        });

        const team2Info = {
          name: 'Team B',
          players: [
            {position: 'GK', isFull: false, userId: null},
            {position: 'CB1', isFull: false, userId: null},
            {position: 'CB2', isFull: false, userId: null},
            {position: 'CB3', isFull: false, userId: null},
            {position: 'CM1', isFull: false, userId: null},
            {position: 'CM2', isFull: false, userId: null},
            {position: 'CF', isFull: false, userId: null},
          ],
        };

        const requestBody = {
          team1Info,
          team2Info,
          fieldInfo: {
            time: reserved_hour,
            day: reserved_date,
            location: location,
          },
          fieldId: field_id,
          userId: user.user_id,
          reservation_id,
        };

        const createMatchResponse = await fetch(
          'http://192.168.1.33:5000/users/create-match',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
          },
        );
        const createMatchData = await createMatchResponse.json();
        if (createMatchResponse.ok) {
          Alert.alert('Success', createMatchData.message);
        } else {
          Alert.alert(
            'Error',
            createMatchData.message || 'Failed to create match',
          );
        }

        toggleCreateMatchModal();
      } else {
        console.error(
          'Error fetching user team details:',
          teamResponse.statusText,
        );
      }
    } catch (error) {
      console.error('Error creating match with team:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
      <ReservationTopMenu activeTab={activeTab} onTabPress={handleTabPress} />
      <View style={styles.contentContainer}>
        {activeTab === 'fields' ? (
          <>
            <FlatList
              data={reservedFields}
              keyExtractor={item => item.reservation_id}
              renderItem={({item}) => (
                <View style={styles.reservationItem}>
                  <Text>{`Field Name: ${item.field_name}`}</Text>
                  <Text>{`Reserved Hour: ${item.reserved_hour}`}</Text>
                  <Text>{`Reserved Date: ${item.reserved_date}`}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() =>
                        handleCancelReservation(item.reservation_id)
                      }>
                      <Text style={styles.cancelButtonText}>
                        Cancel Reservation
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.createMatchButton}
                      onPress={() => handleCreateMatchPress(item)}>
                      <Text style={styles.createMatchButtonText}>
                        Create Match
                      </Text>
                    </TouchableOpacity>
                    <Modal
                      animationType="slide"
                      transparent={true}
                      visible={isCreateMatchModalVisible}
                      onRequestClose={toggleCreateMatchModal}>
                      <View style={styles.modalContainer}>
                        <TouchableOpacity
                          style={styles.createMatchButtonModal}
                          onPress={() => {
                            setRoleModalVisible(true);
                          }}>
                          <Text style={styles.createMatchButtonTextModal}>
                            Create Match
                          </Text>
                        </TouchableOpacity>
                        {user.team ? (
                          <TouchableOpacity
                            style={styles.createMatchWithTeamButton}
                            onPress={() => {
                              handleCreateMatchWithTeam();
                            }}>
                            <Text style={styles.createMatchWithTeamButtonText}>
                              Create Match with Team
                            </Text>
                          </TouchableOpacity>
                        ) : null}
                        <TouchableOpacity
                          style={styles.cancelModalButton}
                          onPress={toggleCreateMatchModal}>
                          <Text style={styles.cancelModalButtonText}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </Modal>
                    <Modal
                      transparent={true}
                      animationType="slide"
                      visible={isRoleModalVisible}
                      onRequestClose={() => setRoleModalVisible(false)}>
                      <View style={styles.modalContainer}>
                        <Text style={styles.title}>Select Your Role</Text>
                        {roleOptions.map((role, index) => (
                          <TouchableOpacity
                            key={index}
                            style={styles.roleButton}
                            onPress={() => handleRoleSelect(role)}>
                            <Text style={styles.roleButtonText}>{role}</Text>
                          </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => setRoleModalVisible(false)}>
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </Modal>
                  </View>
                </View>
              )}
            />
          </>
        ) : (
          <ScrollView style={styles.requestContainer}>
            {matchRequests?.map(request => (
              <View key={request.request_id} style={styles.requestItem}>
                <Text style={styles.requestName}>{request.fullname}</Text>
                <Text style={styles.invitationText}>
                  {`You have been invited to the  ${request.position} role in the ${request.team_name} for the match that will be played in ${request.field_info.location} on ${request.field_info.day} at ${request.field_info.time}.`}
                </Text>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() =>
                    acceptMatchRequest(
                      request.match_id,
                      request.id,
                      request.team_name,
                      user.user_id,
                      request.position,
                    )
                  }>
                  <Image
                    source={require('../assets/icons/tick.png')}
                    style={styles.icon}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => rejectMatchRequest(request.id)}>
                  <Text style={styles.rejectButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.matchContainer}>
              {matchAds.map((matchAd, index) => (
                <View key={index}>
                  {isUserInMatch(matchAd, user.user_id) && (
                    <MatchAd
                      joinable={false}
                      fieldInfo={matchAd.field_info}
                      team1Info={matchAd.team1_info}
                      team2Info={matchAd.team2_info}
                      onLeavePress={() => leaveTeam(matchAd)}
                    />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  matchContainer: {
    marginTop: 20,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  roleButton: {
    backgroundColor: '#0E1E5B',
    padding: 15,
    borderRadius: 16,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },

  roleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  createMatchButtonModal: {
    backgroundColor: '#0E1E5B',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
  },

  createMatchButtonTextModal: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  createMatchWithTeamButton: {
    backgroundColor: '#0E1E5B',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
  },

  createMatchWithTeamButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  cancelModalButton: {
    backgroundColor: '#FF4949',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },

  cancelModalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  reservationItem: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  createMatchButton: {
    backgroundColor: '#0E1E5B',
    padding: 10,
    marginTop: 10,
    borderRadius: 16,
    alignItems: 'center',
    width: '45%',
  },

  createMatchButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cancelButton: {
    backgroundColor: '#0E1E5B',
    padding: 10,
    marginTop: 10,
    borderRadius: 16,
    alignItems: 'center',
    width: '45%',
  },

  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },

  contentContainer: {
    flex: 1,
    padding: 20,
  },
});

export default ReservationScreen;
