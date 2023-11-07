import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Platform, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AgePicker = ({onDateSelect}) => {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);

    const selectedTimestamp = currentDate.getTime();
    onDateSelect(selectedTimestamp);
  };

  const styles = StyleSheet.create({
    agePickerBtn: {
      width: 260,
      height: 46,
      backgroundColor: 'white',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 6,
      marginBottom: 20,
    },
    agePickerText: {
      color: 'gray',
    },
  });

  return (
    <View>
      <TouchableOpacity
        style={styles.agePickerBtn}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.agePickerText}>Date of birth</Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default AgePicker;
