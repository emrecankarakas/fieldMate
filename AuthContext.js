import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  }, []);

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

  return (
    <AuthContext.Provider value={{user, loginUser, logoutUser}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
