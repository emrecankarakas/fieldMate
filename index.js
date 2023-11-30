import {AppRegistry, Alert} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
messaging().onMessage(async remoteMessage => {
  Alert.alert(
    remoteMessage.notification.title,
    remoteMessage.notification.body,
  );
});

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log('onNotificationOpenedApp: ', JSON.stringify(remoteMessage));
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log(
        'Notification caused app to open from quit state:',
        JSON.stringify(remoteMessage),
      );
    }
  });
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
