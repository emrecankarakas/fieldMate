import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import ConfirmBox from '../components/ConfirmBox';
import {useNavigation} from '@react-navigation/native';

const AdminHistoryPage = () => {
  const navigation = useNavigation();
  const [bannedReports, setBannedReports] = useState([]);

  const goBackToAdminHome = () => {
    navigation.navigate('AdminHome');
  };

  useEffect(() => {
    fetchBannedReports();
  }, []);

  const fetchBannedReports = async () => {
    try {
      const response = await fetch(
        'http://192.168.1.46:5000/admin/get-reports',
      );
      const data = await response.json();

      if (response.ok) {
        const filteredReports = data.reports.filter(
          report => report.is_banned === 1,
        );
        setBannedReports(filteredReports);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const removeBan = async reportId => {
    try {
      const response = await fetch(
        `http://192.168.1.46:5000/admin/remove-ban/${reportId}`,
        {
          method: 'PUT',
        },
      );

      if (response.ok) {
        Alert.alert('Success', 'Ban removed successfully');
        fetchBannedReports();
      } else {
        console.error('Failed to remove ban');
      }
    } catch (error) {
      console.error('Error removing ban:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backArrowBtn}
          onPress={goBackToAdminHome}>
          <Image
            source={require('../assets/icons/back-arrow.png')}
            style={styles.backArrowIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Mate</Text>
      </View>
      <View style={styles.historyContainer}>
        {bannedReports.length === 0 ? (
          <Text>No history available.</Text>
        ) : (
          bannedReports.map((report, index) => (
            <ConfirmBox
              key={index}
              labels={[
                `Report ID: ${report.report_id}`,
                `Reporter: ${report.reporter_username}`,
                `Reported: ${report.reported_username}`,
                `Reason: ${report.reasons}`,
              ]}
              showStatus={true}
              onRemoveBanPress={() => removeBan(report.report_id)}
            />
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0F0F0',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0E1E5B',
    height: 50,
  },
  backArrowBtn: {
    position: 'absolute',
    left: 20,
  },
  backArrowIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  historyContainer: {
    padding: 10,
  },
});

export default AdminHistoryPage;
