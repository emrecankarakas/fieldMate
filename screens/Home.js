import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import TopMenu from '../components/TopMenu';
import BottomMenu from '../components/BottomMenu';
import FilterButton from '../components/FilterButton';
import PlayerAd from '../components/PlayerAd';
import MatchAd from '../components/MatchAd';

const Home = () => {
  const [activeTab, setActiveTab] = useState('matches');

  const handleTabPress = tab => {
    setActiveTab(tab);
  };

  const renderFilterOptions = () => {
    switch (activeTab) {
      case 'players':
        return ['Role', 'Hour', 'Location'];
      case 'matches':
        return ['Role', 'Location', 'Date'];
      case 'fields':
        return ['Location', 'Date'];
      default:
        return [];
    }
  };
  const matchAds = [
    {
      team1Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team A',
        players: [
          {position: 'GK', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CM', isFull: false},
          {position: 'CF', isFull: true},
        ],
        time: '19:00-20:00',
        day: 'Monday',
        location: 'Çakmak, Yıldızlar Halı Saha',
      },
      team2Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team B',
        players: [
          {position: 'GK', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CM', isFull: false},
          {position: 'CF', isFull: true},
        ],
      },
    },
    {
      team1Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team A',
        players: [
          {position: 'GK', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CM', isFull: true},
          {position: 'CF', isFull: false},
        ],
        time: '19:00-20:00',
        day: 'Thursday',
        location: 'İstanbul, Çakmak, Yıldızlar Halı Saha',
      },
      team2Info: {
        logo: require('../assets/avatars/avatar1.png'),
        name: 'Team B',
        players: [
          {position: 'GK', isFull: true},
          {position: 'CB', isFull: false},
          {position: 'CB', isFull: true},
          {position: 'CB', isFull: true},
          {position: 'CM', isFull: false},
          {position: 'CM', isFull: true},
          {position: 'CF', isFull: false},
        ],
      },
    },
  ];

  const userPlayerAds = [
    {
      name: 'Furkan Uçukoğlu',
      role: 'Defender',
      availableHours: '2 PM - 8 PM',
      availableDays: 'Tue, Thu, Sat',
      location: 'City B',
      avatar: require('../assets/avatars/avatar1.png'),
      alternatives: 'Midfield, Striker',
    },
    {
      name: 'Emrecan Karakaş',
      role: 'Midfielder',
      availableHours: '10 AM - 6 PM',
      availableDays: 'Mon, Wed, Fri',
      location: 'Şile',
      avatar: require('../assets/avatars/avatar1.png'),
      alternatives: 'Midfield, Striker',
    },
    {
      name: 'Emrecan Karakaş',
      role: 'Midfielder',
      availableHours: '10 AM - 6 PM',
      availableDays: 'Mon, Wed, Fri',
      location: 'Şile',
      avatar: require('../assets/avatars/avatar1.png'),
      alternatives: 'Midfield, Striker',
    },
    {
      name: 'Emrecan Karakaş',
      role: 'Midfielder',
      availableHours: '10 AM - 6 PM',
      availableDays: 'Mon, Wed, Fri',
      location: 'Şile',
      avatar: require('../assets/avatars/avatar1.png'),
      alternatives: 'Midfield, Striker',
    },
    {
      name: 'Emrecan Karakaş',
      role: 'Midfielder',
      availableHours: '10 AM - 6 PM',
      availableDays: 'Mon, Wed, Fri',
      location: 'Şile',
      avatar: require('../assets/avatars/avatar1.png'),
      alternatives: 'Midfield, Striker',
    },
    {
      name: 'Emrecan Karakaş',
      role: 'Midfielder',
      availableHours: '10 AM - 6 PM',
      availableDays: 'Mon, Wed, Fri',
      location: 'Şile',
      avatar: require('../assets/avatars/avatar1.png'),
      alternatives: 'Midfield, Striker',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0E1E5B" />
      <TopMenu activeTab={activeTab} onTabPress={handleTabPress} />
      <FilterButton
        filterOptions={renderFilterOptions()}
        onFilterPress={() => {}}
      />

      <ScrollView style={styles.contentContainer}>
        {activeTab === 'players' &&
          userPlayerAds.map((playerAd, index) => (
            <View key={index}>
              <PlayerAd playerAdInfo={playerAd} />
            </View>
          ))}

        {activeTab === 'matches' &&
          matchAds.map((matchAd, index) => (
            <View key={index}>
              <MatchAd {...matchAd} />
            </View>
          ))}
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => ''}>
        <View>
          <Text style={styles.addButtonText}>+</Text>
        </View>
      </TouchableOpacity>
      <BottomMenu />
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: '#0e1e5b',
    width: 36,
    height: 36,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  addButtonText: {
    color: 'white',
    fontSize: 22,
  },
  container: {
    backgroundColor: '#D9D9D9',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});

export default Home;
