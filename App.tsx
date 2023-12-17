import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OtpScreen from './screens/OtpScreen';
import Home from './screens/Home';
import ProfileScreen from './screens/ProfileScreen';
import MessageScreen from './screens/MessageScreen';
import messaging from '@react-native-firebase/messaging';
import ChatScreen from './screens/ChatScreen';
import TeamManagementScreen from './screens/TeamManagementScreen';
const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
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
        console.log('FCM Token:', token);

      } catch (error) {
        console.error('Error during data fetching:', error);
      }
    };

    fetchData();

    const handleInitialNotification = async () => {
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('Notification caused app to open from quit state:', initialNotification.notification);
      }
    };

    handleInitialNotification();

    const handleBackgroundNotification = async () => {
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage.notification);
      });
    };

    handleBackgroundNotification();

    const handleBackgroundMessage = async () => {
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });
    };

    handleBackgroundMessage();

    const handleForegroundMessage = () => {
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
      });

      return () => unsubscribe();
    };

    handleForegroundMessage();
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

const AppNavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Message"
            component={MessageScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TeamManagement"
            component={TeamManagementScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Otp"
            component={OtpScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default App;
