import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import avatarMapping from '../assets/avatars/avatarMapping';

const PlayerAd = ({playerAdInfo, onInvitePress}) => {
  const {
    name,
    role,
    available_hours,
    available_days,
    location,
    avatar,
    alternatives,
  } = playerAdInfo;

  const daysArray = available_days.replace(/["{}]/g, '').split(', ');
  const alternativesArray = alternatives.replace(/["{}]/g, '').split(', ');
  return (
    <View style={styles.playerCard}>
      <View style={styles.avatarContainer}>
        <Image style={styles.avatar} source={avatarMapping[avatar]} />
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <Text>Location: {location}</Text>
          <Text>Time: {Object.values(available_hours).join(' - ')}</Text>
          <Text>Days: {daysArray.join(', ')}</Text>

          {alternativesArray.length > 0 && (
            <Text>Alternatives: {alternativesArray.join(', ')}</Text>
          )}
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
