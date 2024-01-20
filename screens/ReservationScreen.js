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

const ReservationScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState('matches');
  const [reservedFields, setReservedFields] = useState([]);
  const [matchRequests, setMatchRequests] = useState([]);
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
  }, [activeTab]);

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
                            toggleCreateMatchModal();
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
                  </View>
                </View>
              )}
            />
          </>
        ) : (
          <View style={styles.requestContainer}>
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
          </View>
        )}
      </View>
      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
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
