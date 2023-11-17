import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';

const PlayerAd = ({playerAdInfo, onInvitePress}) => {
  const {
    name,
    role,
    availableHours,
    availableDays,
    location,
    avatar,
    alternatives,
  } = playerAdInfo;

  return (
    <View style={styles.playerCard}>
      <View style={styles.avatarContainer}>
        <Image style={styles.avatar} source={avatar} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text>Location: {location}</Text>
          <Text>Time: {availableHours}</Text>
          <Text>Days: {availableDays}</Text>
          <Text>Alternatives: {alternatives}</Text>
        </View>
        <TouchableOpacity style={styles.inviteButton} onPress={onInvitePress}>
          <Text style={{color: 'white'}}>Invite</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
  },
  avatarContainer: {
    width: 100,
    marginRight: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 25,
    marginBottom: 10,
  },
  contentContainer: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'column',
    marginLeft: 16,
  },
  infoContainer: {
    marginBottom: 12,
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 12,
    color: '#888',
  },

  inviteButton: {
    backgroundColor: '#0e1e5b',
    width: 100,
    padding: 3,
    borderRadius: 20,
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    elevation: 5,
  },
});

export default PlayerAd;
