import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';

const ConfirmBox = ({
  labels,
  showDetails,
  onConfirmPress,
  onDenyPress,
  onRemoveBanPress,
  reportedText,
  reportDate,
}) => {
  const formattedDate = new Date(reportDate).toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const handleRemoveBan = () => {
    Alert.alert(
      'Remove Ban',
      'Are you sure you want to remove the ban?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: onRemoveBanPress,
        },
      ],
      {cancelable: false},
    );
  };

  return (
    <View style={styles.reportList}>
      <View>
        {labels.map((item, index) => (
          <Text key={index} style={styles.labels}>
            {item}
          </Text>
        ))}
      </View>
      <View style={styles.buttonsContainer}>
        {showDetails ? (
          <TouchableOpacity
            style={styles.detailsButtonContainer}
            onPress={() => {
              Alert.alert(
                'Report Details',
                `Reported Text: ${reportedText}\nReport Date: ${formattedDate}`,
              );
            }}>
            <Text style={styles.detailsButtonText}>Details</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bannedButtonContainer}
            onPress={handleRemoveBan}>
            <Text style={styles.bannedText}>Banned</Text>
          </TouchableOpacity>
        )}
        {showDetails && (
          <View style={styles.iconsButtonContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={onDenyPress}>
              <Image
                style={[styles.icon, {tintColor: 'red'}]}
                source={require('../assets/icons/close.png')}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={onConfirmPress}>
              <Image
                style={[styles.icon, {tintColor: 'green'}]}
                source={require('../assets/icons/tick.png')}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reportList: {
    flexDirection: 'row',
    padding: 5,
    marginTop: 13,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderRadius: 14,
  },
  labels: {
    fontSize: 16,
    padding: 5,
    color: '#000',
  },
  buttonsContainer: {
    marginTop: 15,
  },
  detailsButtonContainer: {
    backgroundColor: '#0E1E5B',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    width: 75,
    padding: 3,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  bannedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  iconsButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  iconButton: {
    marginLeft: 3,
    marginTop: 15,
    borderRadius: 14,
    padding: 3,
  },
  icon: {
    width: 16,
    height: 16,
  },
  bannedButtonContainer: {
    backgroundColor: 'red',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    width: 80,
    padding: 2,
    right: 20,
  },
});

export default ConfirmBox;
