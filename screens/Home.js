import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import TopMenu from '../components/TopMenu';
import BottomMenu from '../components/BottomMenu';
import FilterButton from '../components/FilterButton';

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

  return (
    <View style={styles.container}>
      <TopMenu activeTab={activeTab} onTabPress={handleTabPress} />
      <FilterButton
        filterOptions={renderFilterOptions()}
        onFilterPress={() => {}}
      />
      <ScrollView style={styles.contentContainer}>
        <Text>Home Content Based on Active Tab: {activeTab}</Text>
      </ScrollView>

      <BottomMenu onProfilePress={handleProfilePress} />
    </View>
  );
};

const styles = StyleSheet.create({
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
