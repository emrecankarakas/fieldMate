import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

const AvatarSelection = ({visible, onClose, onAvatarSelect, avatarOptions}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.avatarList}>
            {avatarOptions.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                style={styles.avatarOption}
                onPress={() => {
                  onAvatarSelect(avatar);
                  onClose();
                }}>
                <Image source={avatar.image} style={styles.avatarImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: '#6594c0',
    borderRadius: 10,
    alignItems: 'center',
  },
  avatarList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  avatarOption: {
    width: '30%',
    margin: 10,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(256, 256, 256, 0.6)',
  },
  avatarName: {
    marginTop: 5,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: '#0e1e5b',
    padding: 10,
    borderRadius: 10,
  },
  closeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default AvatarSelection;
