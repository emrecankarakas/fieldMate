import React, {useState} from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import Filter from './Filter';

const FilterButton = ({filterOptions, onFilterPress}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleFilterPress = () => {
    setModalVisible(true);

    onFilterPress();
  };

  const handleFilterClose = () => {
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
        <Text style={styles.buttonText}>Add Filter</Text>
      </TouchableOpacity>
      <Filter
        isVisible={modalVisible}
        onClose={handleFilterClose}
        filterOptions={filterOptions}
      />
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    height: 30,
    backgroundColor: '#0e1e5b',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6594c0',
    marginHorizontal: 16,
    marginTop: 16,
    elevation: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FilterButton;
