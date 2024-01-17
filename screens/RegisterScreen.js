import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  StatusBar,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import axios from 'axios';
import AvatarSelection from '../components/AvatarSelection';
import AgePicker from '../components/AgePicker';
import DropDownPicker from 'react-native-dropdown-picker';

const API_URL = 'http://192.168.1.33:5000/users';

const avatarOptions = [
  {name: 'avatar1', image: require('../assets/avatars/avatar1.png')},
  {name: 'avatar2', image: require('../assets/avatars/avatar2.png')},
  {name: 'avatar3', image: require('../assets/avatars/avatar3.png')},
  {name: 'avatar4', image: require('../assets/avatars/avatar4.png')},
  {name: 'avatar5', image: require('../assets/avatars/avatar5.png')},
  {name: 'avatar6', image: require('../assets/avatars/avatar6.png')},
  {name: 'avatar7', image: require('../assets/avatars/avatar4.png')},
  {name: 'avatar8', image: require('../assets/avatars/avatar5.png')},
  {name: 'avatar9', image: require('../assets/avatars/avatar6.png')},
];
const footballRoles = [
  {label: 'Goalkeeper', value: 'goalkeeper'},
  {label: 'Defender', value: 'defender'},
  {label: 'Midfielder', value: 'midfielder'},
  {label: 'Forward', value: 'forward'},
];
const RegisterScreen = ({navigation}) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [username, setUsername] = useState('');

  const handleDateSelect = date => {
    setSelectedDate(date);
  };

  const handleSelectAvatar = avatar => {
    setSelectedAvatar(avatar);
    setIsModalVisible(false);
  };

  const handleRegister = async () => {
    if (
      !fullname ||
      !email ||
      !password ||
      !selectedAvatar ||
      !selectedRole ||
      !selectedDate ||
      !username
    ) {
      alert('Please fill in all the required fields.');
      return;
    }
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email,
        username,
      });

      if (response.status === 200) {
        navigation.navigate('Otp', {
          fullname,
          email,
          password,
          avatar: selectedAvatar.name,
          role: selectedRole,
          age: selectedDate,
          username,
        });
      } else {
        alert('Registration failed.');
      }
    } catch (error) {
      console.error(error);
      const response = error.response;
      alert(response.data.message);
      console.log('Full error object:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/register-bg.jpg')}
      style={styles.container}>
      <View style={styles.overlay} />
      {selectedAvatar ? (
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={[styles.avatarOption, styles.selectedAvatarOption]}>
          <Image source={selectedAvatar.image} style={styles.avatarImage} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={[styles.avatarOption, styles.chooseAvatarButton]}>
          <Text style={styles.avatarText}>Choose Avatar</Text>
        </TouchableOpacity>
      )}
      <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        onChangeText={text => setFullname(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={text => setUsername(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        onChangeText={text => setEmail(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={text => setPassword(text)}
      />
      <DropDownPicker
        placeholder="Select a role"
        open={open}
        value={selectedRole}
        items={footballRoles}
        setOpen={setOpen}
        setValue={setSelectedRole}
        setItems={footballRoles}
        containerStyle={styles.dropdownContainer}
        style={styles.dropdownStyle}
        dropDownStyle={styles.dropDownStyle}
        zIndex={1000}
        textStyle={{
          color: 'gray',
        }}
      />
      <AgePicker onDateSelect={handleDateSelect} />

      <CustomButton title="Sign Up" onPress={handleRegister} />
      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
        <Text style={styles.loginText}>If you have an account, </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>sign in.</Text>
        </TouchableOpacity>
      </View>

      <AvatarSelection
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAvatarSelect={handleSelectAvatar}
        avatarOptions={avatarOptions}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  container: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: 'white',
    width: 260,
    height: 46,
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
  loginText: {
    color: 'white',
    fontSize: 16,
  },
  loginLink: {
    color: 'white',
    textDecorationLine: 'underline',
  },
  avatarOption: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: 'white',
  },
  selectedAvatarOption: {
    marginBottom: 20,
    backgroundColor: 'rgba(256, 256, 256, 0.6)',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  chooseAvatarButton: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 12,
    color: 'black',
  },
  dropdownContainer: {
    width: 260,
    height: 40,
    marginBottom: 25,
  },
  dropdownStyle: {
    width: 260,
  },
  dropDownStyle: {
    width: 260,
  },
});

export default RegisterScreen;
