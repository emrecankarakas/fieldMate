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
import {useAuth} from '../AuthContext';
const AdminHomeScreen = () => {
  const navigation = useNavigation();
  const {logoutUser} = useAuth();
  const [reports, setReports] = useState([]);
  const API_URL = 'http://192.168.1.33:5000/admin';

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/get-reports`);
      const data = await response.json();

      if (response.ok) {
        const filteredReports = data.reports.filter(
          report => report.is_banned === 0,
        );
        setReports(filteredReports);
      } else {
        console.error('Failed to fetch reports');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleLogout = () => {
    logoutUser();
  };

  const goToAdminHistory = () => {
    navigation.navigate('AdminHistory');
  };
  const goToAddFieldOwner = () => {
    navigation.navigate('AdminAddFieldOwner');
  };

  const onConfirmPress = async reportId => {
    try {
      const response = await fetch(`${API_URL}/ban-user/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Success', 'User banned successfully');
        fetchReports();
      } else {
        console.error('Failed to delete report and ban user');
      }
    } catch (error) {
      console.error('Error deleting report and banning user:', error);
    }
  };

  const onDenyPress = async reportId => {
    try {
      const response = await fetch(`${API_URL}/delete-report/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        Alert.alert('Success', 'Report deleted successfully');
        fetchReports();
      } else {
        console.error('Failed to delete report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Mate</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={goToAdminHistory}>
          <Image
            source={require('../assets/icons/history.png')}
            style={styles.historyIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={goToAddFieldOwner}>
          <Image
            source={require('../assets/icons/add-user.png')}
            style={styles.addUserIcon}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        {reports.length === 0 ? (
          <Text>No reports available.</Text>
        ) : (
          reports.map((report, index) => (
            <ConfirmBox
              key={index}
              labels={[
                `Reporter: ${report.reporter_username}`,
                `Reported: ${report.reported_username}`,
                `Reason: ${report.reasons}`,
              ]}
              showDetails={true}
              onConfirmPress={() => onConfirmPress(report.report_id)}
              onDenyPress={() => onDenyPress(report.report_id)}
              reportedText={report.reported_message}
              reportDate={report.created_at}
              reportId={report.report_id}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#0E1E5B',
    height: 50,
  },
  logoutButton: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyButton: {
    paddingRight: 20,
  },
  historyIcon: {
    width: 22,
    height: 22,
    tintColor: 'white',
  },
  addUserIcon: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
  headerTitle: {
    marginRight: 30,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
});

export default AdminHomeScreen;
