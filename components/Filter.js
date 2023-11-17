import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';

const Filter = ({isVisible, onClose, onFilter, filterOptions}) => {
  const [filters, setFilters] = useState({});

  useEffect(() => {
    setFilters({});
  }, [isVisible]);

  const handleFilterPress = () => {
    onFilter(filters);
    onClose();
  };

  const handleFilterChange = (key, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const handleModalPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={handleModalPress}>
        <View style={styles.modalContainer}>
          <View
            style={styles.modalContent}
            onTouchStart={e => e.stopPropagation()}>
            {filterOptions.map(option => (
              <TextInput
                key={option}
                style={styles.input}
                placeholder={option}
                value={filters[option] || ''}
                onChangeText={text => handleFilterChange(option, text)}
              />
            ))}
            <TouchableOpacity
              style={styles.filterButton}
              onPress={handleFilterPress}>
              <Text style={styles.buttonText}>Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  filterButton: {
    height: 36,
    backgroundColor: '#0e1e5b',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6594c0',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Filter;
