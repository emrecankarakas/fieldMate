import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import axios from 'axios';
import {useAuth} from '../AuthContext';
const FieldAd = ({fieldInfo, isFieldOwner, onUpdate}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isModalVisible2, setModalVisible2] = useState(false);

  const [selectedHour, setSelectedHour] = useState(null);
  const [availableHours, setAvailableHours] = useState(fieldInfo.open_hours);
  const [filteredHoursToAdd, setFilteredHoursToAdd] = useState([]);
  const [selectedFilterHours, setSelectedFilterHours] = useState([]);
  const API_URL = 'http://192.168.1.33:5000/field';
  const {user} = useAuth();
  const handleLocationPress = () => {
    const locationQuery = `${fieldInfo.location} `;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      locationQuery,
    )}`;
    Linking.openURL(mapUrl);
  };
  useEffect(() => {
    setAvailableHours(fieldInfo.open_hours);
  }, [fieldInfo]);
  const handleReservePress = hour => {
    setSelectedHour(hour);
    setModalVisible(true);
  };
  const handleFilterHourPress = useCallback(
    hour => {
      setSelectedFilterHours(prevHours => {
        const isHourSelected = prevHours.includes(hour);

        const updatedSelection = isHourSelected
          ? prevHours.filter(selectedHour => selectedHour !== hour)
          : [...prevHours, hour];

        const uniqueHours = Array.from(new Set(updatedSelection));
        const sortedUniqueHours = uniqueHours.sort((a, b) => a - b);

        const updatedSelectionStrings = sortedUniqueHours.map(selectedHour => {
          const hour12Format =
            selectedHour < 12
              ? `${selectedHour.toString().padStart(2, '0')}:00 AM`
              : `${(selectedHour % 12).toString().padStart(2, '0')}:00 PM`;

          return hour12Format;
        });

        setFilteredHoursToAdd(updatedSelectionStrings);
        return sortedUniqueHours;
      });
    },
    [setSelectedFilterHours, setFilteredHoursToAdd],
  );

  const handleCloseModal = () => {
    setSelectedHour(null);
    setModalVisible(false);
  };
  const handleDeleteHour = async () => {
    try {
      if (!selectedHour) {
        throw new Error('No hour selected to delete.');
      }

      const response = await axios.put(
        `${API_URL}/remove-hour/${fieldInfo.field_id}`,
        {
          hourToRemove: selectedHour,
        },
      );

      if (response.status === 200) {
        Alert.alert('Hour removed successfully');
        setModalVisible(false);
        onUpdate();
      } else {
        console.error('Failed to remove hour');
      }
    } catch (error) {
      console.error('An error occurred while removing hour', error.message);
      Alert.alert(error.message);
    }
  };

  const handleAddNewHour = () => {
    setModalVisible2(true);
  };

  const handleCloseFilterModal = () => {
    setSelectedFilterHours([]);

    setModalVisible2(false);
  };

  const handleDeleteField = async () => {
    try {
      const response = await axios.delete(
        `${API_URL}/delete-field/${fieldInfo.field_id}`,
      );

      if (response.status === 200) {
        Alert.alert('Field deleted successfully');
        onUpdate();
      } else {
        console.error('Failed to delete field');
      }
    } catch (error) {
      console.error('An error occurred while deleting field', error.message);
      Alert.alert(error.message);
    }
  };

  const handleAddNewHourSubmit = async () => {
    try {
      const selectedHoursStrings = filteredHoursToAdd;

      if (selectedHoursStrings.length === 0) {
        Alert.alert('No hours selected to add.');
        return;
      }

      const response = await axios.put(
        `${API_URL}/add-hour/${fieldInfo.field_id}`,
        {
          newHours: selectedHoursStrings,
        },
      );

      if (response.status === 200) {
        Alert.alert('Hour added successfully');
        setSelectedFilterHours([]);
        onUpdate();
        setModalVisible2(false);
      } else {
        console.error('Failed to add hours');
      }
    } catch (error) {
      console.error('An error occurred while adding hours', error);
    }
  };

  const handleReserveConfirm = async () => {
    try {
      if (selectedHour) {
        const response = await axios.post(`${API_URL}/reserve-field`, {
          fieldId: fieldInfo.field_id,
          userId: user.user_id,
          reservedHour: selectedHour,
          reservedDate: fieldInfo.date,
        });

        if (response.status === 201) {
          setAvailableHours(prevHours =>
            prevHours.filter(h => h !== selectedHour),
          );
          setModalVisible(false);
        } else {
          console.error('Reservation failed.');
        }
      }
    } catch (error) {
      console.error('An error occurred during the reservation process.', error);
    }
  };
  const renderFilterHoursSelector = useCallback(() => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible2}
        onRequestClose={handleCloseFilterModal}>
        <View style={styles.modalContainer2}>
          <ScrollView contentContainerStyle={styles.modalContent2}>
            <Text style={styles.modalTitle2}>Select Hours</Text>
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
                              backgroundColor: selectedFilterHours.includes(
                                hour,
                              )
                                ? '#0e1e5b'
                                : '#F5F5F5',
                            },
                            fieldInfo.open_hours.includes(formattedHour)
                              ? styles.disabledHourButton
                              : null,
                          ]}
                          onPress={() => handleFilterHourPress(hour)}
                          disabled={fieldInfo.open_hours.includes(
                            formattedHour,
                          )}>
                          <Text
                            style={{
                              color: selectedFilterHours.includes(hour)
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
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleCloseFilterModal}
                style={[styles.button, styles.closeModalButton]}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddNewHourSubmit}
                style={[styles.button, styles.reserveButton]}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  }, [
    isModalVisible,
    selectedFilterHours,
    handleFilterHourPress,
    handleAddNewHourSubmit,
  ]);
  const renderAvailableHours = useCallback(() => {
    if (Array.isArray(availableHours)) {
      return availableHours.map((hour, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handleReservePress(hour)}
          style={[
            styles.availableHourContainer,
            selectedHour === hour && styles.selectedHour,
          ]}>
          <Text style={styles.availableHourText}>{hour}</Text>
        </TouchableOpacity>
      ));
    } else {
      return null;
    }
  }, [availableHours, selectedHour, handleReservePress]);

  return (
    <View style={styles.fieldCard}>
      <View style={styles.fieldInfoContainer}>
        <View style={styles.logoContainer}>
          <Image
            style={styles.logo}
            source={require('../assets/facilities_SOC_Duggins_aerial_lighted_DJI_0237_edited.jpg')}
          />
          <Text style={styles.fieldName}>{fieldInfo.name}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.fieldInfoText}>Location: </Text>
          <Text style={styles.fieldInfoText}>{fieldInfo.location}</Text>
          <Text style={styles.fieldInfoText}>Date: </Text>
          <Text style={styles.fieldInfoText}>{fieldInfo.date}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLocationPress}
        style={styles.locationContainer}>
        <Text style={styles.locationText}>Show on Map</Text>
      </TouchableOpacity>

      {isFieldOwner && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleDeleteField}
            style={[styles.button, styles.deleteButton]}>
            <Text style={styles.buttonText}>Delete Field</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAddNewHour}
            style={[styles.button, styles.addButton]}>
            <Text style={styles.buttonText}>Add New Hour</Text>
          </TouchableOpacity>
          {renderFilterHoursSelector()}
        </View>
      )}

      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={styles.availableHoursScrollView}>
        {renderAvailableHours()}
      </ScrollView>

      <Modal animationType="slide" transparent={true} visible={isModalVisible}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {isFieldOwner ? (
              <>
                <Text style={styles.modalTitle}>
                  Do you want to delete this hour ?
                </Text>
                {selectedHour && (
                  <Text style={styles.selectedHourText}>
                    Selected Hour: {selectedHour}
                  </Text>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={[styles.button, styles.closeModalButton]}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleDeleteHour();
                    }}
                    style={[styles.button, styles.reserveButton]}
                    disabled={!selectedHour}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>
                  Do you want to reserve this time?
                </Text>
                {selectedHour && (
                  <Text style={styles.selectedHourText}>
                    Selected Hour: {selectedHour}
                  </Text>
                )}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={[styles.button, styles.closeModalButton]}>
                    <Text style={styles.buttonText}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      handleReserveConfirm();
                    }}
                    style={[styles.button, styles.reserveButton]}
                    disabled={!selectedHour}>
                    <Text style={styles.buttonText}>Reserve</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  disabledHourButton: {
    backgroundColor: 'gray',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  addButton: {
    backgroundColor: 'green',
    flex: 1,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: 'red',
    flex: 1,
    marginRight: 8,
  },
  reserveButton: {
    backgroundColor: '#0e1e5b',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    width: '50%',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  reserveButton: {
    backgroundColor: '#0e1e5b',
  },
  closeModalButton: {
    backgroundColor: 'gray',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
  },
  fieldCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fieldInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
    flex: 1,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fieldName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  infoContainer: {
    marginLeft: 16,
    flex: 2,
  },
  fieldInfoText: {
    color: 'black',
    fontSize: 12,
    marginBottom: 4,
  },
  locationContainer: {
    alignItems: 'flex-start',
    marginTop: 16,
  },
  locationText: {
    color: '#0e1e5b',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  availableHoursScrollView: {
    marginTop: 16,
  },
  availableHourContainer: {
    backgroundColor: '#0e1e5b',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  availableHourText: {
    color: 'white',
    fontSize: 12,
  },
  selectedHour: {
    backgroundColor: 'gold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    marginTop: 200,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectedHourText: {
    fontSize: 12,
    marginBottom: 8,
  },
  hoursSelector: {
    marginBottom: 16,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalContainer2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent2: {
    marginTop: 130,

    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    width: '100%',
  },
  modalTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

export default FieldAd;
