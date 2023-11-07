import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  cstmBtn: {
    width: 260,
    height: 46,
    backgroundColor: '#0e1e5b',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6594c0',
  },
  cstmText: {
    color: 'white',
    fontSize: 22,
    textAlign: 'center',
  },
});

const CustomButton = ({title, onPress}) => {
  return (
    <TouchableOpacity style={styles.cstmBtn} onPress={onPress}>
      <Text style={styles.cstmText}>{title}</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
