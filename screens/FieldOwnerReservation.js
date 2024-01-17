import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  FlatList,
} from 'react-native';
import {useAuth} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';
const FieldOwnerReservation = () => {
  const [reservations, setReservations] = useState([]);
  const navigation = useNavigation();

  const goToBackFieldOwnerHome = () => {
    navigation.navigate('FieldOwnerHome');
  };
  useEffect(() => {
    fetchReservations();
  }, []);
  const fetchReservations = async () => {
    try {
      const response = await fetch(
        'http://192.168.1.33:5000/field/get-all-reservations',
      );
      const data = await response.json();

      setReservations(data.reservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
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
        fetchReservations();
      } else {
        console.error('Error cancelling reservation:', response.statusText);
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrowBtn}
          onPress={goToBackFieldOwnerHome}>
          <Image
            source={require('../assets/icons/back-arrow.png')}
            style={styles.backArrowIcon}
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
      <View style={styles.itemContainer}>
        <FlatList
          data={reservations}
          keyExtractor={item => item.reservation_id}
          renderItem={({item}) => (
            <View style={styles.reservationItem}>
              <Text>{`Field Name: ${item.field_name}`}</Text>
              <Text>{`Reserved Hour: ${item.reserved_hour}`}</Text>
              <Text>{`Reserved Date: ${item.reserved_date}`}</Text>
              <Text>{`User Name: ${item.username}`}</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelReservation(item.reservation_id)}>
                <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  reservationItem: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cancelButton: {
    backgroundColor: '#0E1E5B',
    padding: 10,
    marginTop: 10,
    borderRadius: 16,
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    bottom: 10,
  },

  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
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
    marginLeft: 50,
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
  backArrowBtn: {
    position: 'absolute',
    left: 20,
  },
  backArrowIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  container: {
    backgroundColor: '#D9D9D9',
    flex: 1,
  },
  itemContainer: {
    backgroundColor: '#D9D9D9',
    flex: 1,
    padding: 10,
  },
});

export default FieldOwnerReservation;
