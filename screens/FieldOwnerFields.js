import React, {useEffect, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, Text, Image} from 'react-native';
import axios from 'axios';
import {useAuth} from '../AuthContext';
import {useNavigation} from '@react-navigation/native';
import FieldAd from '../components/FieldAd';
const FieldOwnerFields = () => {
  const [fields, setFields] = useState([]);
  const navigation = useNavigation();
  const {user} = useAuth();
  const goToBackFieldOwnerHome = () => {
    navigation.navigate('FieldOwnerHome');
  };
  useEffect(() => {
    getFieldsByOwner();
  }, []);
  const getFieldsByOwner = async () => {
    try {
      const response = await axios.get(
        `http://192.168.1.33:5000/field/get-fields-by-owner/${user.user_id}`,
      );
      setFields(response.data.fields);
    } catch (error) {
      console.error('Failed to get fields by owner', error);
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
      <View style={styles.fieldListContainer}>
        {fields.map((field, index) => (
          <View key={index}>
            <FieldAd
              fieldInfo={field}
              isFieldOwner={true}
              onUpdate={getFieldsByOwner}
            />
          </View>
        ))}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
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
  fieldListContainer: {
    padding: 10,
  },
});

export default FieldOwnerFields;
