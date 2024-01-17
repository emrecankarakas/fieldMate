import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

import {useNavigation} from '@react-navigation/native';

const AdminAddFieldOwner = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');

  const goBackToAdminHome = () => {
    navigation.navigate('AdminHome');
  };

  const handleAddFieldOwner = async () => {
    try {
      console.log('Adding Field Owner:', {email, password, fullName, userName});

      const response = await fetch(
        'http://192.168.1.33:5000/admin/add-field-owner',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            fullName,
            userName,
          }),
        },
      );

      if (response.ok) {
        Alert.alert('Field owner added successfully');
      } else {
        Alert.alert('Error adding field owner:', response.statusText);
      }
    } catch (error) {
      Alert.alert('Error adding field owner:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrowBtn}
          onPress={goBackToAdminHome}>
          <Image
            source={require('../assets/icons/back-arrow.png')}
            style={styles.backArrowIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Mate</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter full name"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Username:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            value={userName}
            onChangeText={setUserName}
          />
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddFieldOwner}>
          <Text style={styles.addButtonLabel}>Add Field Owner</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#0E1E5B',
  },
  input: {
    height: 40,
    borderColor: '#0E1E5B',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#0E1E5B',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AdminAddFieldOwner;
