import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
} from 'react-native';
import {useAuth} from '../AuthContext';
import BottomMenu from '../components/BottomMenu';
import avatarMapping from '../assets/avatars/avatarMapping';

const ProfileScreen = ({navigation}) => {
  const {user, logoutUser} = useAuth();

  const handleLogout = () => {
    logoutUser();
  };

  const timestampToAge = timestamp => {
    const age =
      (new Date().getTime() - timestamp) / (1000 * 60 * 60 * 24 * 365);

    return Math.floor(age);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Image
            source={require('../assets/icons/back-arrow.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Field Mate</Text>

        <TouchableOpacity onPress={handleLogout} style={{right: 20}}>
          <Text style={{color: 'white', fontSize: 16, fontWeight: 'bold'}}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
        <View style={styles.profileContent}>
          {user && (
            <>
              <Image
                source={avatarMapping[user.avatar]}
                style={styles.avatar}
              />
              <Text style={styles.profileName}>{user.fullname}</Text>
              <Text style={styles.userInfo}>{`Email: ${user.email}`}</Text>
              <Text style={styles.userInfo}>{`Role: ${user.role}`}</Text>
              <Text style={styles.userInfo}>{`Age: ${timestampToAge(
                user.age,
              )}`}</Text>
            </>
          )}
        </View>
      </View>

      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#D9D9D9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#0E1E5B',
    height: 50,
  },
  backButton: {
    left: 20,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  headerTitle: {
    fontFamily: 'ShadowsIntoLight-Regular',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  profileContent: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
});

export default ProfileScreen;
