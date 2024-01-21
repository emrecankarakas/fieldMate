import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import {useAuth} from '../AuthContext';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
const FieldOwnerHome = () => {
  const {logoutUser, user} = useAuth();
  const [selectedHours, setSelectedHours] = useState([]);
  const [date, setDate] = useState(new Date());
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
  const [newFieldInfo, setNewFieldInfo] = useState({
    name: '',
    location: '',
    openHours: [],
    selectedDate: new Date(),
    fieldOwnerId: user?.user_id,
  });
  const navigation = useNavigation();

  const handleDateChange = useCallback(
    (event, selectedDate) => {
      if (selectedDate) {
        const currentDate = selectedDate || date;
        setDate(currentDate);
        setNewFieldInfo(prevState => ({
          ...prevState,
          selectedDate: currentDate,
        }));
        setIsDateTimePickerVisible(false);
      }
    },
    [date, setNewFieldInfo, setIsDateTimePickerVisible],
  );

  const handleLogout = useCallback(() => {
    logoutUser();
  }, [logoutUser]);

  const handleFilterHourPress = useCallback(
    hour => {
      setSelectedHours(prevHours => {
        const isHourSelected = prevHours.includes(hour);

        const updatedSelection = isHourSelected
          ? prevHours.filter(selectedHour => selectedHour !== hour)
          : [...prevHours, hour];

        const uniqueHours = Array.from(new Set(updatedSelection));

        const updatedSelectionStrings = uniqueHours
          .sort((a, b) => a - b)
          .map(selectedHour => {
            const hour12Format =
              selectedHour < 12
                ? `${selectedHour.toString().padStart(2, '0')}:00 AM`
                : `${(selectedHour % 12).toString().padStart(2, '0')}:00 PM`;

            return hour12Format;
          });

        setNewFieldInfo(prevState => ({
          ...prevState,
          openHours: updatedSelectionStrings,
        }));

        return uniqueHours;
      });
    },
    [setSelectedHours, setNewFieldInfo],
  );

  const handleSubmit = async () => {
    try {
      if (!newFieldInfo.name || !newFieldInfo.location) {
        Alert.alert('Error', 'Field Name and Location cannot be empty');
        return;
      }

      setNewFieldInfo(prevState => ({
        ...prevState,
      }));

      const response = await axios.post(
        'http://192.168.1.33:5000/field/add-field',
        newFieldInfo,
      );

      if (response.status === 201) {
        Alert.alert('Success', 'Field added successfully');
      }
    } catch (error) {
      console.error(error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        Alert.alert('Error', error.response.data.message);
      } else {
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    }
  };

  const renderFilterHoursSelector = useCallback(
    () => (
      <View style={styles.hoursSelector}>
        {[0, 1, 2, 3, 4, 5].map(row => (
          <View key={row} style={styles.hourRow}>
            {Array.from({length: 4}, (_, index) => index + row * 4).map(
              hour => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.hourButton,
                    {
                      backgroundColor: selectedHours.includes(hour)
                        ? '#0e1e5b'
                        : '#D9D9D9',
                    },
                  ]}
                  onPress={() => handleFilterHourPress(hour)}>
                  <Text
                    style={{
                      color: selectedHours.includes(hour) ? 'white' : 'black',
                    }}>
                    {hour < 12
                      ? `${hour.toString().padStart(2, '0')}:00 AM`
                      : `${(hour % 12).toString().padStart(2, '0')}:00 PM`}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        ))}
      </View>
    ),
    [selectedHours, handleFilterHourPress],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Image
            source={require('../assets/icons/logout.png')}
            style={styles.logoutButtonIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Mate</Text>
        <TouchableOpacity
          style={styles.reservationBtn}
          onPress={() => navigation.navigate('FieldOwnerReservation')}>
          <Image
            source={require('../assets/icons/booking.png')}
            style={styles.reservationIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.reservationBtn}
          onPress={() => navigation.navigate('FieldOwnerFields')}>
          <Image
            source={require('../assets/icons/football-field.png')}
            style={styles.reservationIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.addFieldForm}>
        <Text style={styles.formTitle}>Add New Field</Text>

        <TextInput
          placeholder="Field Name"
          style={styles.inputField}
          value={newFieldInfo.name}
          onChangeText={text => setNewFieldInfo({...newFieldInfo, name: text})}
        />

        <TextInput
          placeholder="Location"
          style={styles.inputField}
          value={newFieldInfo.location}
          onChangeText={text =>
            setNewFieldInfo({...newFieldInfo, location: text})
          }
        />
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setIsDateTimePickerVisible(true)}>
          <Text style={styles.toggleButtonText}>Select Day</Text>
        </TouchableOpacity>

        {isDateTimePickerVisible && (
          <DateTimePicker
            style={{width: '100%', marginBottom: 10}}
            value={date}
            mode="date"
            format="YYYY-MM-DD"
            confirmBtnText="Confirm"
            cancelBtnText="Cancel"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        {renderFilterHoursSelector()}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Field</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  logoutButtonIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  toggleButton: {
    backgroundColor: '#0e1e5b',
    width: '100%',
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    color: 'white',
    fontSize: 14,
  },

  hoursSelector: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  hourButton: {
    flexDirection: 'row',
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0e1e5b',
    marginHorizontal: 9.5,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  reservationIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  reservationBtn: {
    paddingRight: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#0E1E5B',
    height: 50,
  },
  logoutButton: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  container: {
    backgroundColor: '#D9D9D9',
    flex: 1,
  },
  addFieldForm: {
    padding: 20,
  },
  formTitle: {
    fontSize: 22,
    marginBottom: 40,
  },
  inputField: {
    backgroundColor: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  submitButton: {
    backgroundColor: '#0e1e5b',
    width: '100%',
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 14,
  },
});

export default FieldOwnerHome;
