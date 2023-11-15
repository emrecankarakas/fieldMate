import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from './screens/LoginScreen'; 
import RegisterScreen from './screens/RegisterScreen'; 
import OtpScreen from './screens/OtpScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
