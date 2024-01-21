import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import TopMenu from '../components/TopMenu';
import BottomMenu from '../components/BottomMenu';
import PlayerAd from '../components/PlayerAd';
import MatchAd from '../components/MatchAd';
import FieldAd from '../components/FieldAd';
import {useAuth} from '../AuthContext';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const Home = () => {
  const [activeTab, setActiveTab] = useState('matches');
  const [allFields, setAllFields] = useState([]);
  const [isPlayerModalVisible, setPlayerModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectStartDate, setSelectStartDate] = useState(null);
  const [selectEndDate, setSelectEndDate] = useState(null);
  const [matches, setMatches] = useState(null);
  const [userPlayerAds, setUserPlayerAds] = useState([]);
  const {user, logoutUser} = useAuth();
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isFilterMatchModalVisible, setFilterMatchModalVisible] =
    useState(false);
  const [isFilterFieldModalVisible, setFilterFieldModalVisible] =
    useState(false);
  const [receiverPlayer, setReceiverPlayer] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    location: null,
    day: [],
    role: [],
  });
  const [filterMatchOptions, setFilterMatchOptions] = useState({
    emptyRoles: [],
  });
  const [filterFieldOptions, setFilterFieldOptions] = useState({
    emptyHours: [],
  });
  const [matchAd, setMatchAd] = useState(null);
  const [playerAdInfo, setPlayerAdInfo] = useState({
    name: user?.fullname,
    role: user?.role,
    avatar: user?.avatar,
    availableHours: {start: '', end: ''},
    availableDays: '',
    location: '',
    alternatives: '',
  });

  const handleTabPress = tab => {
    setFilterMatchModalVisible(false);
    setFilterModalVisible(false);
    setFilterFieldModalVisible(false);
    setFilterMatchOptions({
      emptyRoles: [],
    });
    setFilterFieldOptions({
      emptyHours: [],
    });
    setFilterOptions({
      location: null,
      day: [],
      role: [],
    });
    setActiveTab(tab);
  };
  const isUserInTeam = teamInfo => {
    return teamInfo.players.some(player => player.userId === user.user_id);
  };
  const handleJoinPress = async matchAd => {
    setSelectedMatch(matchAd);

    const isUserInTeam1 = isUserInTeam(matchAd.team1_info);
    const isUserInTeam2 = isUserInTeam(matchAd.team2_info);

    if (isUserInTeam1 || isUserInTeam2) {
      Alert.alert('Error', 'You are already in this match.');
      return;
    }

    const emptyPositionInTeam1 = matchAd.team1_info.players.find(
      player => !player.isFull,
    );

    const emptyPositionInTeam2 = matchAd.team2_info.players.find(
      player => !player.isFull,
    );

    if (emptyPositionInTeam1 || emptyPositionInTeam2) {
      setJoinModalVisible(true);
    } else {
      Alert.alert('Error', 'No empty positions available in either team.');
    }
  };

  const API_URL = 'http://192.168.1.33:5000/users';

  const fetchAllFields = async () => {
    try {
      const response = await fetch(
        'http://192.168.1.33:5000/field/get-all-fields',
      );
      const data = await response.json();
      setAllFields(data.fields);
    } catch (error) {
      console.error('Error fetching fields:', error);
    }
  };
  const filterPlayerAd = userPlayerAd => {
    const locationMatch =
      !filterOptions.location ||
      userPlayerAd.location === filterOptions.location;

    const dayMatch =
      !filterOptions.day.length ||
      (userPlayerAd.available_days &&
        filterOptions.day.some(selectedDay =>
          userPlayerAd.available_days.includes(selectedDay),
        ));

    const roleMatch =
      !filterOptions.role.length ||
      (userPlayerAd.alternatives &&
        filterOptions.role.some(selectedRole =>
          userPlayerAd.alternatives.includes(selectedRole),
        ));

    return locationMatch && dayMatch && roleMatch;
  };

  const handleApplyFilter = () => {
    setFilterMatchModalVisible(false);
    setFilterModalVisible(false);
    setFilterFieldModalVisible(false);
  };

  const handleLocationInputChange = text => {
    setFilterOptions(prevOptions => ({...prevOptions, location: text}));
  };
  const fetchMatchesByUser = async () => {
    try {
      const response = await fetch(
        `${API_URL}/get-matches-by-user/${user.user_id}`,
      );

      if (response.ok) {
        const data = await response.json();

        return data.matches;
      } else {
        console.error('Error fetching matches:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      return null;
    }
  };

  const renderFilterDaysSelector = () => (
    <View style={styles.daysSelector}>
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <TouchableOpacity
          key={day}
          style={[
            styles.dayButton,
            {
              backgroundColor: filterOptions.day.includes(day)
                ? '#0e1e5b'
                : '#D9D9D9',
            },
          ]}
          onPress={() => handleFilterDayPress(day)}>
          <Text
            style={{
              color: filterOptions.day.includes(day) ? 'white' : 'black',
            }}>
            {day}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  const handleFilterDayPress = selectedDay => {
    const selectedDays = [...filterOptions.day];

    if (selectedDays.includes(selectedDay)) {
      const index = selectedDays.indexOf(selectedDay);
      selectedDays.splice(index, 1);
    } else {
      selectedDays.push(selectedDay);
    }

    setFilterOptions(prevOptions => ({
      ...prevOptions,
      day: selectedDays,
    }));
  };
  const checkUserBanStatus = async () => {
    try {
      const updatedUserResponse = await fetch(
        `${API_URL}/get-user/${user.user_id}`,
      );

      if (updatedUserResponse.ok) {
        const responseBody = await updatedUserResponse.json();
        const isBanned = responseBody.user.is_banned;

        if (isBanned === 1) {
          Alert.alert(
            'Ban Notice',
            'You have been banned. Please contact support for further information.',
            [{text: 'OK', onPress: () => logoutUser()}],
          );
        }
      } else {
        console.error('Failed to check user ban status');
      }
    } catch (error) {
      console.error('Error checking user ban status:', error);
    }
  };
  const renderFilterRolesSelector = () => (
    <View style={styles.rolesSelector}>
      {['Midfield', 'Striker', 'Forward', 'Goalkeeper'].map(role => (
        <TouchableOpacity
          key={role}
          style={[
            styles.roleButton,
            {
              backgroundColor: filterOptions.role.includes(role)
                ? '#0e1e5b'
                : '#D9D9D9',
            },
          ]}
          onPress={() => handleFilterRolePress(role)}>
          <Text
            style={{
              color: filterOptions.role.includes(role) ? 'white' : 'black',
            }}>
            {role}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleFilterRolePress = selectedRole => {
    const selectedRoles = [...filterOptions.role];

    if (selectedRoles.includes(selectedRole)) {
      const index = selectedRoles.indexOf(selectedRole);
      selectedRoles.splice(index, 1);
    } else {
      selectedRoles.push(selectedRole);
    }

    setFilterOptions(prevOptions => ({
      ...prevOptions,
      role: selectedRoles,
    }));
  };
  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_URL}/get-all-matches`);

      if (response.ok) {
        const data = await response.json();

        setMatchAd(data.matches);
      } else {
        console.error('Error fetching matches:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPlayerAds = async () => {
    fetch(`${API_URL}/get-all-player-ads`)
      .then(response => response.json())
      .then(data => {
        setUserPlayerAds(data.playerAds);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  useEffect(() => {
    checkUserBanStatus();
    fetchPlayerAds();
    fetchAllFields();
    fetchMatches();
  }, [activeTab]);

  const handlePlayerModalClose = () => {
    setPlayerAdInfo({
      name: user.fullname,
      role: user.role,
      avatar: user.avatar,
      availableHours: {start: '', end: ''},
      availableDays: '',
      location: '',
      alternatives: '',
    });
    setPlayerModalVisible(false);
  };
  const handleAddPlayerPress = () => {
    if (activeTab === 'players') {
      setPlayerModalVisible(true);
    }
  };
  const handleSavePlayerAd = () => {
    const dataToSend = {
      name: playerAdInfo.name,
      role: playerAdInfo.role,
      avatar: playerAdInfo.avatar,
      availableHours: playerAdInfo.availableHours,
      availableDays: playerAdInfo.availableDays,
      location: playerAdInfo.location,
      alternatives: playerAdInfo.alternatives,
    };

    const userId = user.user_id;

    fetch(`${API_URL}/save-player-ad/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    })
      .then(response => response.json())
      .then(data => {
        Alert.alert(data.message);
        fetchPlayerAds();
        setPlayerModalVisible(false);
      })
      .catch(error => {
        Alert.alert('Error:', error);
      });
  };

  const handleRolePress = selectedRole => {
    const isSelected = playerAdInfo.alternatives.includes(selectedRole);

    if (isSelected) {
      const updatedAlternatives = playerAdInfo.alternatives
        .filter(role => role !== selectedRole)
        .slice(0, 2);

      setPlayerAdInfo({
        ...playerAdInfo,
        alternatives: updatedAlternatives,
      });
    } else {
      if (playerAdInfo.alternatives.length < 2) {
        setPlayerAdInfo({
          ...playerAdInfo,
          alternatives: [...playerAdInfo.alternatives, selectedRole],
        });
      }
    }
  };

  const renderInputField = (
    placeholder,
    key,
    isMultiLine = false,
    keyboardType = 'default',
  ) => (
    <TextInput
      placeholder={placeholder}
      onChangeText={text => setPlayerAdInfo({...playerAdInfo, [key]: text})}
      style={styles.inputField}
      multiline={isMultiLine}
      keyboardType={keyboardType}
    />
  );

  const renderDaysSelector = () => {
    const handleDayPress = day => {
      const selectedDays = [...playerAdInfo.availableDays];

      if (selectedDays.includes(day)) {
        const index = selectedDays.indexOf(day);
        selectedDays.splice(index, 1);
      } else {
        if (selectedDays.length < 3) {
          selectedDays.push(day);
        } else {
          return;
        }
      }

      setPlayerAdInfo({
        ...playerAdInfo,
        availableDays: selectedDays,
      });
    };

    return (
      <View style={styles.daysSelector}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <TouchableOpacity
            key={day}
            style={[
              styles.dayButton,
              {
                backgroundColor: playerAdInfo.availableDays.includes(day)
                  ? '#0e1e5b'
                  : '#D9D9D9',
              },
            ]}
            onPress={() => handleDayPress(day)}>
            <Text
              style={{
                color: playerAdInfo.availableDays.includes(day)
                  ? 'white'
                  : 'black',
              }}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRolesSelector = () => (
    <View style={styles.rolesSelector}>
      {['Midfield', 'Striker', 'Forward', 'Goalkeeper'].map(role => (
        <TouchableOpacity
          key={role}
          style={[
            styles.roleButton,
            {
              backgroundColor: playerAdInfo.alternatives.includes(role)
                ? '#0e1e5b'
                : '#D9D9D9',
            },
          ]}
          onPress={() => handleRolePress(role)}>
          <Text
            style={{
              color: playerAdInfo.alternatives.includes(role)
                ? 'white'
                : 'black',
            }}>
            {role}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  const handleSelectMatch = match => {
    setSelectedMatch(match);
    setInviteModalVisible(true);
  };
  const handleInvitePress = async playerAd => {
    try {
      if (playerAd.user_id === user.user_id) {
        Alert.alert('Error', 'You cannot invite yourself.');
        return;
      }

      setReceiverPlayer(playerAd.user_id);
      const matchesData = await fetchMatchesByUser();

      if (matchesData !== null) {
        setMatches(matchesData);
        setInviteModalVisible(true);
      } else {
        Alert.alert('Error', 'Failed to fetch matches.');
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      Alert.alert('Error', 'Failed to fetch matches.');
    }
  };
  const joinTeam = async (position, team) => {
    try {
      const response = await fetch(`${API_URL}/accept-match-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_id: selectedMatch.match_id,
          match_request_id: selectedMatch.match_request_id,
          team_name: team,
          user_id: user.user_id,
          position: position,
        }),
      });

      if (response.ok) {
        fetchMatches();
        Alert.alert('Success', 'You joined the team.');
        setJoinModalVisible(false);
      } else {
        Alert.alert('Error', '');
      }
    } catch (error) {
      console.error('Error joining team:', error);
      Alert.alert('Error', 'Failed to join team');
    }
  };

  const sendInvite = (position, team) => {
    const endpoint = `${API_URL}/send-match-invitation`;

    const requestBody = {
      match_id: selectedMatch.match_id,
      receiver_id: receiverPlayer,
      sender_id: user.user_id,
      position: position,
      field_info: selectedMatch.field_info,
      team_name: team,
    };

    const isPlayerInAnyTeam =
      selectedMatch.team1_info.players.some(
        player => player.user_id === receiverPlayer,
      ) ||
      selectedMatch.team2_info.players.some(
        player => player.user_id === receiverPlayer,
      );

    if (isPlayerInAnyTeam) {
      Alert.alert(
        'Error',
        'The selected player is already in a team for this match.',
      );
      return;
    }

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        Alert.alert('Success', ` ${JSON.stringify(data.message)}`);
      })
      .catch(error => {
        Alert.alert('Error', 'Failed to send invitation');
      });
  };

  const renderMatches = () => {
    if (!matches || matches.length === 0) {
      return (
        <Text style={styles.noMatchText}>
          You don't have any matches at the moment.
        </Text>
      );
    }

    return matches.map((match, index) => (
      <TouchableOpacity
        key={index}
        style={styles.matchContainer}
        onPress={() => handleSelectMatch(match)}>
        <Text style={styles.matchText}>{`Match ${index + 1}:
          \nLocation: ${match.field_info.location}
          \nDay: ${match.field_info.day}
          \nTime: ${match.field_info.time}`}</Text>
      </TouchableOpacity>
    ));
  };

  const handlePositionPress = (position, team) => {
    Alert.alert(
      'Send Invite',
      `Dou you want to send for team: ${team} and position: ${position}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Invite',
          onPress: () => sendInvite(position, team),
        },
      ],
      {cancelable: false},
    );
  };
  const handlePositionPressForJoin = (position, team) => {
    Alert.alert(
      'Send Invite',
      `Dou you want to join for team: ${team} and position: ${position}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Join',
          onPress: () => joinTeam(position, team),
        },
      ],
      {cancelable: false},
    );
  };

  const renderEmptyPositionsForJoin = team => {
    return team?.players
      .filter(player => !player.isFull)
      .map(player => (
        <TouchableOpacity
          key={player.position}
          onPress={() => handlePositionPressForJoin(player.position, team.name)}
          style={styles.emptyPositionButton}>
          <Text style={styles.emptyPositionText}>{player.position}</Text>
        </TouchableOpacity>
      ));
  };
  const renderEmptyPositions = team => {
    return team?.players
      .filter(player => !player.isFull)
      .map(player => (
        <TouchableOpacity
          key={player.position}
          onPress={() => handlePositionPress(player.position, team.name)}
          style={styles.emptyPositionButton}>
          <Text style={styles.emptyPositionText}>{player.position}</Text>
        </TouchableOpacity>
      ));
  };
  const handleOpenStartTimePicker = () => {
    setStartTimePickerVisible(true);
  };
  const handleOpenEndTimePicker = () => {
    setEndTimePickerVisible(true);
  };
  const handleStartDateConfirm = date => {
    const formattedTime = `${date.getHours()}:${date.getMinutes()}`;
    setSelectStartDate(formattedTime);
    setPlayerAdInfo({
      ...playerAdInfo,
      availableHours: {...playerAdInfo.availableHours, start: formattedTime},
    });
    setStartTimePickerVisible(false);
  };

  const handleEndDateConfirm = date => {
    const formattedTime = `${date.getHours()}:${date.getMinutes()}`;
    setSelectEndDate(formattedTime);
    setPlayerAdInfo({
      ...playerAdInfo,
      availableHours: {...playerAdInfo.availableHours, end: formattedTime},
    });
    setEndTimePickerVisible(false);
  };

  const handleFilterMatchRolePress = selectedRole => {
    const selectedRoles = [...filterMatchOptions.emptyRoles];

    if (selectedRoles.includes(selectedRole)) {
      const index = selectedRoles.indexOf(selectedRole);
      selectedRoles.splice(index, 1);
    } else {
      selectedRoles.push(selectedRole);
    }

    setFilterMatchOptions(prevOptions => ({
      ...prevOptions,
      emptyRoles: selectedRoles,
    }));
  };

  const renderFilterMatchRolesSelector = () => (
    <View style={styles.rolesSelector}>
      {['GK', 'CB1', 'CB2', 'CB3', 'CM1', 'CM2', 'CF'].map(role => (
        <TouchableOpacity
          key={role}
          style={[
            styles.roleButton,
            {
              backgroundColor: filterMatchOptions.emptyRoles.includes(role)
                ? '#0e1e5b'
                : '#D9D9D9',
            },
          ]}
          onPress={() => handleFilterMatchRolePress(role)}>
          <Text
            style={{
              color: filterMatchOptions.emptyRoles.includes(role)
                ? 'white'
                : 'black',
            }}>
            {role}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const handleAddFilterButton = () => {
    if (activeTab === 'matches') {
      setFilterMatchModalVisible(true);
    }
    if (activeTab === 'players') {
      setFilterModalVisible(true);
    }
    if (activeTab === 'fields') {
      setFilterFieldModalVisible(true);
    }
  };
  const handleFilterHourPress = selectedHour => {
    const formattedHour =
      selectedHour < 12
        ? `${selectedHour.toString().padStart(2, '0')}:00 AM`
        : `${(selectedHour % 12).toString().padStart(2, '0')}:00 PM`;

    const selectedHours = [...filterFieldOptions.emptyHours];

    if (selectedHours.includes(formattedHour)) {
      const index = selectedHours.indexOf(formattedHour);
      selectedHours.splice(index, 1);
    } else {
      selectedHours.push(formattedHour);
    }

    setFilterFieldOptions(prevOptions => ({
      ...prevOptions,
      emptyHours: selectedHours,
    }));
  };

  const renderFilterHoursSelector = useCallback(() => {
    const isHourSelected = formattedHour =>
      filterFieldOptions.emptyHours.includes(formattedHour);

    return (
      <View style={styles.hoursSelector}>
        {[0, 1, 2, 3, 4, 5].map(row => (
          <View key={row} style={styles.hourRow}>
            {Array.from({length: 4}, (_, index) => index + row * 4).map(
              hour => {
                const formattedHour =
                  hour < 12
                    ? `${hour.toString().padStart(2, '0')}:00 AM`
                    : `${(hour % 12).toString().padStart(2, '0')}:00 PM`;

                return (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.hourButton,
                      {
                        backgroundColor: isHourSelected(formattedHour)
                          ? '#0e1e5b'
                          : '#D9D9D9',
                      },
                    ]}
                    onPress={() => handleFilterHourPress(hour)}>
                    <Text
                      style={{
                        color: isHourSelected(formattedHour)
                          ? 'white'
                          : 'black',
                      }}>
                      {formattedHour}
                    </Text>
                  </TouchableOpacity>
                );
              },
            )}
          </View>
        ))}
      </View>
    );
  }, [filterFieldOptions.emptyHours, handleFilterHourPress, handleApplyFilter]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
      <TopMenu activeTab={activeTab} onTabPress={handleTabPress} />
      <TouchableOpacity
        style={styles.addFilterBtn}
        onPress={() => handleAddFilterButton()}>
        <View>
          <Text style={{color: 'white'}}>Add Filter</Text>
        </View>
      </TouchableOpacity>
      <ScrollView style={styles.contentContainer}>
        {activeTab === 'players'
          ? filterOptions.day.length > 0 ||
            filterOptions.role.length > 0 ||
            filterOptions.location
            ? userPlayerAds.filter(filterPlayerAd).map((playerAd, index) => (
                <View key={index}>
                  <PlayerAd
                    playerAdInfo={playerAd}
                    onInvitePress={() => handleInvitePress(playerAd)}
                  />
                </View>
              ))
            : userPlayerAds.map((playerAd, index) => (
                <View key={index}>
                  <PlayerAd
                    playerAdInfo={playerAd}
                    onInvitePress={() => handleInvitePress(playerAd)}
                  />
                </View>
              ))
          : activeTab === 'matches'
          ? matchAd
              ?.filter(matchAd => {
                const emptyRolesMatch =
                  !filterMatchOptions.emptyRoles.length ||
                  matchAd.team1_info.players.some(
                    player =>
                      !player.isFull &&
                      filterMatchOptions.emptyRoles.includes(player.position),
                  ) ||
                  matchAd.team2_info.players.some(
                    player =>
                      !player.isFull &&
                      filterMatchOptions.emptyRoles.includes(player.position),
                  );

                return emptyRolesMatch;
              })
              .map((filteredMatchAd, index) => (
                <View key={index}>
                  <MatchAd
                    joinable={true}
                    fieldInfo={filteredMatchAd.field_info}
                    team1Info={filteredMatchAd.team1_info}
                    team2Info={filteredMatchAd.team2_info}
                    onJoinPress={() => handleJoinPress(filteredMatchAd)}
                  />
                </View>
              ))
          : activeTab === 'fields'
          ? (filterFieldOptions.emptyHours.length
              ? allFields.filter(field =>
                  filterFieldOptions.emptyHours.every(hour =>
                    field.open_hours.includes(hour),
                  ),
                )
              : allFields
            ).map((field, index) => (
              <View key={index}>
                <FieldAd fieldInfo={field} />
              </View>
            ))
          : null}
      </ScrollView>

      {activeTab === 'players' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPlayerPress}>
          <View>
            <Text style={styles.addButtonText}>+</Text>
          </View>
        </TouchableOpacity>
      )}
      <BottomMenu />
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => {
          setSelectedMatch(null);
          setInviteModalVisible(false);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent2}>
            <ScrollView>
              {selectedMatch ? (
                <View style={styles.matchContainer}>
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamHeading}>
                      {selectedMatch.team1_info.name}
                    </Text>
                    {renderEmptyPositions(selectedMatch.team1_info)}
                  </View>
                  <View style={styles.teamContainer}>
                    <Text style={styles.teamHeading}>
                      {selectedMatch.team2_info.name}
                    </Text>
                    {renderEmptyPositions(selectedMatch.team2_info)}
                  </View>
                </View>
              ) : (
                renderMatches()
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedMatch(null);
                setInviteModalVisible(false);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterMatchModalVisible}
        onRequestClose={() => setFilterMatchModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.addPlayerTitle}>Filter By Empty Roles:</Text>
            {renderFilterMatchRolesSelector()}

            <TouchableOpacity
              onPress={handleApplyFilter}
              style={styles.filterBtn}>
              <Text style={{color: 'white'}}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isPlayerModalVisible}
        onRequestClose={handlePlayerModalClose}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.addPlayerTitle}>Select Available Days:</Text>

            {renderDaysSelector()}
            <Text style={styles.addPlayerTitle}>Select Alternative Roles:</Text>

            {renderRolesSelector()}
            <Text style={styles.addPlayerTitle}>Enter Location:</Text>

            {renderInputField('Location', 'location')}
            <Text style={styles.addPlayerTitle}>
              Select Available Time Range:
            </Text>

            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                onPress={handleOpenStartTimePicker}
                style={styles.timePickerButton}>
                <Text>{selectStartDate || 'Select Time'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleOpenEndTimePicker}
                style={styles.timePickerButton}>
                <Text>{selectEndDate || 'Select Time'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={handleSavePlayerAd}
              style={styles.saveBtn}>
              <Text style={{color: 'white'}}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible && activeTab === 'players'}
        onRequestClose={() => setFilterModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.addPlayerTitle}>Filter by Available Days:</Text>
            {renderFilterDaysSelector()}

            <Text style={styles.addPlayerTitle}>
              Filter by Alternative Roles:
            </Text>
            {renderFilterRolesSelector()}

            <Text style={styles.addPlayerTitle}>Filter by Location:</Text>
            <TextInput
              placeholder="Enter Location"
              onChangeText={handleLocationInputChange}
              value={filterOptions.location}
              style={styles.inputField}
            />

            <TouchableOpacity
              onPress={handleApplyFilter}
              style={styles.filterBtn}>
              <Text style={{color: 'white'}}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={joinModalVisible}
        onRequestClose={() => {
          setSelectedMatch(null);
          setJoinModalVisible(false);
        }}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent2}>
            <ScrollView>
              <View style={styles.matchContainer}>
                <View style={styles.teamContainer}>
                  <Text style={styles.teamHeading}>
                    {selectedMatch?.team1_info.name}
                  </Text>
                  {renderEmptyPositionsForJoin(selectedMatch?.team1_info)}
                </View>
                <View style={styles.teamContainer}>
                  <Text style={styles.teamHeading}>
                    {selectedMatch?.team2_info.name}
                  </Text>
                  {renderEmptyPositionsForJoin(selectedMatch?.team2_info)}
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setSelectedMatch(null);
                setJoinModalVisible(false);
              }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterFieldModalVisible}
        onRequestClose={() => setFilterFieldModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.addPlayerTitle}>Filter By Hours:</Text>

            {renderFilterHoursSelector()}

            <TouchableOpacity
              onPress={handleApplyFilter}
              style={styles.filterBtn}>
              <Text style={{color: 'white'}}>Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <DateTimePickerModal
        isVisible={isStartTimePickerVisible}
        mode="time"
        onConfirm={handleStartDateConfirm}
        onCancel={() => setStartTimePickerVisible(false)}
      />
      <DateTimePickerModal
        isVisible={isEndTimePickerVisible}
        mode="time"
        onConfirm={handleEndDateConfirm}
        onCancel={() => setEndTimePickerVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  hoursSelector: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
  },
  hourButton: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e1e5b',
    marginHorizontal: 2,
    marginBottom: 10,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },

  inviteModalContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    maxHeight: '50%',
    alignSelf: 'center',
    width: '80%',
  },
  matchContainer: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 10,
    backgroundColor: '#D9D9D9',
    marginBottom: 10,
    padding: 10,
  },
  teamContainer: {
    flex: 1,
  },
  teamHeading: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  matchText: {
    fontSize: 16,
    marginBottom: 10,
  },
  emptyPositionButton: {
    backgroundColor: '#0e1e5b',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
    width: '100%',
    alignSelf: 'center',
  },
  emptyPositionText: {
    color: 'white',
    textAlign: 'center',
  },
  closeButton: {
    padding: 10,
    backgroundColor: '#0e1e5b',
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  addFilterBtn: {
    backgroundColor: '#0e1e5b',
    width: '92%',
    padding: 5,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    elevation: 5,
  },
  filterBtn: {
    backgroundColor: '#0e1e5b',
    width: 100,
    padding: 3,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    elevation: 5,
  },
  saveBtn: {
    backgroundColor: '#0e1e5b',
    width: 200,
    padding: 10,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    elevation: 5,
  },
  addPlayerTitle: {
    marginBottom: 10,
    fontSize: 14,
  },
  dateTimeContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timePickerButton: {
    alignItems: 'center',
    minWidth: 100,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  inputField: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  daysSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 20,
  },
  dayButton: {
    minWidth: 45,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  rolesSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 20,
  },
  roleButton: {
    minWidth: 90,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent2: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '70%',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: '#0e1e5b',
    width: 36,
    height: 36,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  addButtonText: {
    color: 'white',
    fontSize: 22,
  },
  container: {
    backgroundColor: '#D9D9D9',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});

export default Home;
