import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const TopMenu = ({activeTab, onTabPress}) => {
  return (
    <View style={styles.container}>
      {['Players', 'Matches', 'Fields'].map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.tab,
            activeTab === tab.toLowerCase() && styles.activeTab,
          ]}
          onPress={() => onTabPress(tab.toLowerCase())}>
          <Text
            style={
              activeTab === tab.toLowerCase()
                ? styles.activeText
                : styles.inactiveText
            }>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
      {activeTab && (
        <View
          style={[
            styles.activeTabIndicator,
            {
              left:
                33.33 * ['players', 'matches', 'fields'].indexOf(activeTab) +
                '%',
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    height: 50,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  activeTabIndicator: {
    height: 2,
    width: '33.33%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#0E1E5B',
  },
  activeText: {
    fontSize: 17,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  inactiveText: {
    fontSize: 17,
    color: 'black',
    textAlign: 'center',
  },
});

export default TopMenu;
