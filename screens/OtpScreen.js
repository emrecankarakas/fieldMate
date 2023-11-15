import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';

const API_URL = 'http://192.168.1.34:5000/users';

const OtpScreen = ({navigation, route}) => {
  const {fullname, email, password, avatar, role, age} = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const otpInputs = useRef([]);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendDisabled, setResendDisabled] = useState(false);

  const handleVerifyOTP = async () => {
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, {
        fullname,
        password,
        avatar,
        role,
        age,
        email,
        otpEntered: otp.join(''),
      });

      if (response.status === 201) {
        alert('Registration successful.');
        navigation.navigate('Login');
      } else {
        alert('Registration failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Registration failed.');
    }
  };

  const handleResendOTP = async () => {
    try {
      const response = await axios.post(`${API_URL}/register`, {
        email,
      });

      if (response.status === 200) {
        alert('OTP resent to your email. Use it to complete registration.');
      } else {
        alert('Resend failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Resend failed.');
    }

    setResendTimer(120);
    setResendDisabled(true);

    const intervalId = setInterval(() => {
      setResendTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 120000);
  };

  const handleOtpInputChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text === '' && index > 0) {
      otpInputs.current[index - 1].focus();
    }

    if (text !== '' && index < otp.length - 1) {
      otpInputs.current[index + 1].focus();
    }
  };

  useEffect(() => {
    otpInputs.current[0].focus();
  }, []);

  useEffect(() => {
    if (resendTimer === 0) {
      setResendDisabled(false);
    }
  }, [resendTimer]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Verification Code</Text>
      <Text style={styles.subHeaderText}>
        We have sent the verification code to
      </Text>
      <Text style={styles.emailText}>{email}</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder=""
            keyboardType="numeric"
            maxLength={1}
            value={otp[index]}
            onChangeText={text => handleOtpInputChange(text, index)}
            ref={input => (otpInputs.current[index] = input)}
          />
        ))}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.resendButton,
            resendDisabled && styles.resendDisabled,
          ]}
          onPress={handleResendOTP}
          disabled={resendDisabled}>
          <Text style={styles.buttonText}>
            Resend {resendTimer > 0 ? `(${resendTimer}s)` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={handleVerifyOTP}
          disabled={resendDisabled}>
          <Text style={styles.buttonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerText: {
    color: 'black',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  subHeaderText: {
    color: 'black',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  emailText: {
    color: 'black',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'left',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: '#D9D9D9',
    width: 65,
    height: 65,
    padding: 10,
    marginTop: 50,
    marginHorizontal: 10.5,
    borderRadius: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 30,
  },
  button: {
    backgroundColor: 'black',
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 5,
  },
  resendButton: {
    width: 'auto',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  resendDisabled: {
    backgroundColor: 'grey',
  },
});

export default OtpScreen;
