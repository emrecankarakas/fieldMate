import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './screens/LoginScreen'; 
import RegisterScreen from './screens/RegisterScreen'; 
import OtpScreen from './screens/OtpScreen';
import Home from './screens/Home';
import ProfileScreen from './screens/ProfileScreen';
import MessageScreen from './screens/MessageScreen';

const Stack = createStackNavigator();

const App = () => {
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
