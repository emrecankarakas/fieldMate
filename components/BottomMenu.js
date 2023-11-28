import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const BottomMenu = () => {
  const navigation = useNavigation();

  const handlePress = screenName => {
    navigation.navigate(screenName);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.circle}
        onPress={() => handlePress('Profile')}>
        <Image
          source={require('../assets/icons/user.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.circle}
        onPress={() => handlePress('Message')}>
        <Image
          source={require('../assets/icons/message.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
      <View style={styles.bigCircleContainer}>
        <View style={styles.bigCircle}>
          <TouchableOpacity onPress={() => handlePress('Home')}>
            <View style={styles.bigCircleInner}>
              <Image
                source={require('../assets/icons/football.png')}
                style={styles.bigIcon}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity style={styles.circle} onPress={''}>
        <Image
          source={require('../assets/icons/people.png')}
          style={styles.icon2}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.circle} onPress={''}>
        <Image
          source={require('../assets/icons/calendar.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
  },

  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0E1E5B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
  },

  bigCircleContainer: {
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bigCircle: {
    width: 70,
    height: 70,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    marginHorizontal: 'auto',
    backgroundColor: 'white',
  },

  bigCircleInner: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#0E1E5B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    width: 21,
    height: 21,
    tintColor: 'white',
  },

  icon2: {
    width: 26,
    height: 26,
    tintColor: 'white',
  },

  bigIcon: {
    width: 38,
    height: 38,
    tintColor: 'white',
  },
});

export default BottomMenu;
