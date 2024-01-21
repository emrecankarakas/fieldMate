import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {useAuth} from '../AuthContext';
import BottomMenu from '../components/BottomMenu';
import avatarMapping from '../assets/avatars/avatarMapping';
import DropDownPicker from 'react-native-dropdown-picker';
import AvatarSelection from '../components/AvatarSelection';

const footballRoles = [
  {label: 'Goalkeeper', value: 'goalkeeper'},
  {label: 'Defender', value: 'defender'},
  {label: 'Midfielder', value: 'midfielder'},
  {label: 'Forward', value: 'forward'},
];

const avatarOptions = [
  {name: 'avatar1', image: require('../assets/avatars/avatar1.png')},
  {name: 'avatar2', image: require('../assets/avatars/avatar2.png')},
  {name: 'avatar3', image: require('../assets/avatars/avatar3.png')},
  {name: 'avatar4', image: require('../assets/avatars/avatar4.png')},
  {name: 'avatar5', image: require('../assets/avatars/avatar5.png')},
  {name: 'avatar6', image: require('../assets/avatars/avatar6.png')},
];

const ProfileScreen = ({navigation}) => {
  const {user, logoutUser, updateUser} = useAuth();
  const [isEditVisible, setEditVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [selectedAvatar, setSelectedAvatar] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleLogout = () => {
    logoutUser();
  };

  const timestampToAge = timestamp => {
    const age =
      (new Date().getTime() - timestamp) / (1000 * 60 * 60 * 24 * 365);

    return Math.floor(age);
  };

  const handleEditProfile = () => {
    setEditVisible(!isEditVisible);
  };

  const handleSelectAvatar = avatar => {
    setSelectedAvatar(avatar.name);
    setIsModalVisible(false);
  };

  const handleSaveChanges = async () => {
    try {
      if (
        (currentPassword && !newPassword) ||
        (!currentPassword && newPassword)
      ) {
        alert(
          'Both current and new password are required for password change.',
        );
        return;
      }

      const updatedUser = {
        user_id: user.user_id,
        oldPassword: currentPassword,
        newPassword: newPassword,
        role: selectedRole,
        avatar: selectedAvatar,
      };

      const response = await fetch(
        'http://192.168.1.33:5000/users/update-user',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedUser),
        },
      );

      const responseData = await response.json();

      if (response.ok) {
        const updatedUserInfo = {
          role: selectedRole,
          avatar: selectedAvatar,
        };

        if (selectedRole === user.role && selectedAvatar === user.avatar) {
          alert('No changes detected. Profile remains the same.');
        } else {
          updateUser({
            ...user,
            ...updatedUserInfo,
          });
          alert('Profile updated successfully!');
        }
      } else {
        alert(responseData.message || 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('An error occurred while updating profile.');
    }
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
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Image
            source={require('../assets/icons/logout.png')}
            style={styles.logoutIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleEditProfile}
          style={styles.editProfileButton}>
          {!isEditVisible ? (
            <Image
              source={require('../assets/icons/user-avatar.png')}
              style={styles.editProfileIcon}
            />
          ) : (
            <Image
              source={require('../assets/icons/profile.png')}
              style={styles.editProfileIcon}
            />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.contentContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
        {!isEditVisible ? (
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
        ) : (
          <View style={styles.editProfileContent}>
            {!selectedAvatar ? (
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={[styles.avatarOption, styles.selectedAvatarOption]}>
                <Image
                  source={avatarMapping[user.avatar]}
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={[styles.avatarOption, styles.chooseAvatarButton]}>
                <Image
                  source={avatarMapping[selectedAvatar]}
                  style={styles.avatarImage}
                />
              </TouchableOpacity>
            )}
            <DropDownPicker
              placeholder="Select a role"
              open={open}
              value={selectedRole}
              items={footballRoles}
              setOpen={setOpen}
              setValue={setSelectedRole}
              setItems={footballRoles}
              containerStyle={styles.dropdownContainer}
              style={styles.dropdownStyle}
              dropDownStyle={styles.dropDownStyle}
              zIndex={1000}
              textStyle={{
                color: 'gray',
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry={true}
              onChangeText={text => setCurrentPassword(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry={true}
              onChangeText={text => setNewPassword(text)}
            />
            <TouchableOpacity
              style={styles.saveChangesButton}
              onPress={() => handleSaveChanges}>
              <Text style={styles.saveChangesButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <BottomMenu />
      <AvatarSelection
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onAvatarSelect={handleSelectAvatar}
        avatarOptions={avatarOptions}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    right: 20,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  backButton: {
    left: 20,
  },
  backIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  editProfileButton: {
    right: 60,
    position: 'absolute',
  },
  editProfileIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
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
  editProfileContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  saveChangesButton: {
    backgroundColor: '#0E1E5B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 20,
  },
  saveChangesButtonText: {
    color: 'white',
    fontSize: 16,
  },
  avatarOption: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: 'white',
  },
  selectedAvatarOption: {
    marginBottom: 20,
    backgroundColor: 'rgba(256, 256, 256, 0.6)',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  chooseAvatarButton: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  avatarText: {
    fontSize: 12,
    color: 'black',
  },
  dropdownContainer: {
    width: 260,
    height: 40,
    marginBottom: 25,
  },
  dropdownStyle: {
    width: 260,
  },
  dropDownStyle: {
    width: 260,
  },
  input: {
    backgroundColor: 'white',
    width: 260,
    height: 46,
    padding: 10,
    marginBottom: 20,
    borderRadius: 6,
  },
});

export default ProfileScreen;
