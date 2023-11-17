import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import TopMenu from '../components/TopMenu';
import BottomMenu from '../components/BottomMenu';
import FilterButton from '../components/FilterButton';
import PlayerAd from '../components/PlayerAd'; // PlayerAd bileşenini içeri aktarıyoruz

const Home = () => {
  const [activeTab, setActiveTab] = useState('matches');

  const handleTabPress = tab => {
    setActiveTab(tab);
  };

  const handleProfilePress = () => {};

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
      </ScrollView>
      <TouchableOpacity style={styles.addButton} onPress={() => ''}>
        <View>
          <Text style={styles.addButtonText}>+</Text>
        </View>
      </TouchableOpacity>
      <BottomMenu onProfilePress={handleProfilePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: 'absolute',
    bottom: 90,
    right: 16,
    backgroundColor: '#0e1e5b',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  addButtonText: {
    color: 'white',
    fontSize: 12,
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
