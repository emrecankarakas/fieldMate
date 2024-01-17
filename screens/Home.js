import React, {useState, useEffect} from 'react';
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
  const [selectStartDate, setSelectStartDate] = useState(null);
  const [selectEndDate, setSelectEndDate] = useState(null);
  const [userPlayerAds, setUserPlayerAds] = useState([]);
  const {user, logoutUser} = useAuth();
  const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    location: null,
    day: [],
    role: [],
  });

  const [playerAdInfo, setPlayerAdInfo] = useState({
    name: user?.fullname,
    role: user?.role,
    avatar: user?.avatar,
    availableHours: {start: '', end: ''},
    availableDays: '',
    location: '',
    alternatives: '',
  });

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
    console.log('Applying filter:', filterOptions);
    setFilterModalVisible(false);
  };

  const handleLocationInputChange = text => {
    setFilterOptions(prevOptions => ({...prevOptions, location: text}));
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
  }, [activeTab]);

  const handleTabPress = tab => {
    setFilterModalVisible(false);
    setActiveTab(tab);
  };
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

  const matchAds = [
    {
      team1Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team A',
        players: [
          {position: 'GK', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CM', isFull: false},
          {position: 'CF', isFull: true},
        ],
        time: '19:00-20:00',
        day: 'Monday',
        location: 'Çakmak, Yıldızlar Halı Saha',
      },
      team2Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team B',
        players: [
          {position: 'GK', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CM', isFull: false},
          {position: 'CF', isFull: true},
        ],
      },
    },
    {
      team1Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team A',
        players: [
          {position: 'GK', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CF', isFull: false},
        ],
        time: '19:00-20:00',
        day: 'Thursday',
        location: 'İstanbul, Çakmak, Yıldızlar Halı Saha',
      },
      team2Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team B',
        players: [
          {position: 'GK', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: false},
          {position: 'CM', isFull: true},
          {position: 'CF', isFull: false},
        ],
      },
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
      <TopMenu activeTab={activeTab} onTabPress={handleTabPress} />
      <TouchableOpacity
        style={styles.addFilterBtn}
        onPress={() => setFilterModalVisible(true)}>
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
                  <PlayerAd playerAdInfo={playerAd} />
                </View>
              ))
            : userPlayerAds.map((playerAd, index) => (
                <View key={index}>
                  <PlayerAd playerAdInfo={playerAd} />
                </View>
              ))
          : activeTab === 'matches'
          ? matchAds.map((matchAd, index) => (
              <View key={index}>
                <MatchAd {...matchAd} />
              </View>
            ))
          : activeTab === 'fields'
          ? allFields.map((field, index) => (
              <View key={index}>
                <FieldAd fieldInfo={field} />
              </View>
            ))
          : null}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => ''}>
        <View>
          <Text style={styles.addButtonText} onPress={handleAddPlayerPress}>
            +
          </Text>
        </View>
      </TouchableOpacity>
      <BottomMenu />
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
