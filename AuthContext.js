import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user from AsyncStorage:', error);
      }
    };

    loadUser();

    const unsubscribe = messaging().onTokenRefresh(token => {
      if (user) {
        updateUserFCMToken(user, token);
      }
    });

    return unsubscribe;
  }, [user]);

  const loginUser = async userData => {
    setUser(userData);

    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to AsyncStorage:', error);
    }
  };

  const logoutUser = async () => {
    setUser(null);

    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user from AsyncStorage:', error);
    }
  };

  const updateUserFCMToken = async (currentUser, token) => {
    console.log(
      `Updating FCM token for user: ${currentUser.user_id}, FCM Token: ${token}`,
    );
  };

  return (
    <AuthContext.Provider value={{user, loginUser, logoutUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
