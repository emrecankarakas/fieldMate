import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';

const MatchAd = ({team1Info, team2Info, onLocationPress}) => {
  const renderPlayerIcons = players => {
    return players.map((player, index) => (
      <View
        key={index}
        style={[
          styles.playerIcon,
          {
            backgroundColor: player.isFull ? '#0B0B0B' : '#fff',
          },
        ]}>
        <Text
          style={[
            styles.playerPosition,
            {color: player.isFull ? '#fff' : '#000'},
          ]}>
          {player.position}
        </Text>
      </View>
    ));
  };

  const handleLocationPress = () => {
    const locationQuery = `${team1Info.location} `;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      locationQuery,
    )}`;
    Linking.openURL(mapUrl);
  };
  return (
    <ScrollView style={styles.matchCard}>
      <View style={styles.teamContainer}>
        <View style={styles.teamInfoContainer}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={team1Info.logo} />
            <Text style={styles.teamName}>{team1Info.name}</Text>
          </View>
          <View style={styles.playerIconsContainer}>
            {renderPlayerIcons(team1Info.players)}
          </View>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.matchInfoText}>Time</Text>
          <Text style={styles.matchInfoText}>{team1Info.time}</Text>
          <Text style={styles.matchInfoText}>Day</Text>
          <Text style={styles.matchInfoText}>{team1Info.day}</Text>
        </View>
        <View style={styles.teamInfoContainer}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={team2Info.logo} />
            <Text style={styles.teamName}>{team2Info.name}</Text>
          </View>
          <View style={styles.playerIconsContainer}>
            {renderPlayerIcons(team2Info.players)}
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleLocationPress}
        style={styles.locationContainer}>
        <Text
          style={{
            textDecorationStyle: 'solid',
            color: 'black',
            fontSize: 12,
          }}>
          Location:{' '}
          <Text style={styles.locationText}>{team1Info.location}</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  matchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  teamContainer: {
    flexDirection: 'row',
  },
  teamInfoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teamName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  playerIconsContainer: {
    backgroundColor: '#DEDEDE',
    borderRadius: 12,
    padding: 2.8,
    flexDirection: 'row',
    marginTop: 5,
  },
  playerIcon: {
    width: 18,
    height: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 1,
  },
  playerPosition: {
    color: '#fff',
    fontSize: 10,
  },
  matchInfoText: {
    color: 'black',
    fontSize: 11,
  },
  locationContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  locationText: {
    marginTop: -5,
    color: '#000',
    textDecorationLine: 'underline',
    fontSize: 12,
  },
  infoContainer: {
    marginLeft: -16,
    marginRight: -16,
    alignItems: 'center',
    marginBottom: 16,
  },
});

export default MatchAd;