import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import axios from 'axios';
import CustomButton from '../components/CustomButton';
import messaging from '@react-native-firebase/messaging';
import {useAuth} from '../AuthContext.js';

const API_URL = 'http://192.168.1.46:5000/users';

const LoginScreen = ({navigation}) => {
  const {loginUser} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchData = async () => {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
      }

      const token = await messaging().getToken();
      return token;
    } catch (error) {
      console.error('Error during data fetching:', error);
      throw error;
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      if (response.status === 200) {
        const {user, fcmToken} = response.data;
        console.log(user);
        if (user.is_banned === 1) {
          alert(
            'Your account has been banned. Please contact support for further information.',
          );
          return;
        }

        const token = await fetchData();
        loginUser(user);

        await saveFCMToken(user.user_id, token);

        navigation.navigate('Home');
      } else {
        alert('Login failed');
      }
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  const saveFCMToken = async (userId, token) => {
    try {
      await axios.post(`${API_URL}/save-fcm-token`, {
        user_id: userId,
        fcm_token: token,
      });
    } catch (error) {
      console.error('Failed to save FCM token:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/login-bg.jpeg')}
      style={styles.container}>
      <View style={styles.overlay} />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        onChangeText={text => setEmail(text)}
      />
      <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry={true}
        onChangeText={text => setPassword(text)}
      />

      <CustomButton title="Sign In" onPress={handleLogin} />

      <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
        <Text style={styles.registerText}>If you don't have an account, </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerLink}>sign up.</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
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
  registerText: {
    color: 'white',
    fontSize: 16,
  },
  registerLink: {
    color: 'white',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
