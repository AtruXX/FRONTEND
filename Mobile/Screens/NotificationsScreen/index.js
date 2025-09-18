import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationsList from '../../components/Notifications/NotificationsList';
import { useNotifications } from '../NotificationsContext';

const NotificationsScreen = ({ navigation }) => {
  const { isConnected } = useNotifications();
  const [filterType, setFilterType] = useState('all');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
      >
        <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Notificări</Text>

      <View style={styles.connectionStatus}>
        <View
          style={[
            styles.statusDot,
            { backgroundColor: isConnected ? '#4ECDC4' : '#FF6B6B' }
          ]}
        />
        <Text style={styles.statusText}>
          {isConnected ? 'Online' : 'Offline'}
        </Text>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterTab,
          filterType === 'all' && styles.activeFilterTab
        ]}
        onPress={() => setFilterType('all')}
      >
        <Text
          style={[
            styles.filterText,
            filterType === 'all' && styles.activeFilterText
          ]}
        >
          Toate
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          filterType === 'unread' && styles.activeFilterTab
        ]}
        onPress={() => setFilterType('unread')}
      >
        <Text
          style={[
            styles.filterText,
            filterType === 'unread' && styles.activeFilterText
          ]}
        >
          Necitite
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          filterType === 'documents' && styles.activeFilterTab
        ]}
        onPress={() => setFilterType('documents')}
      >
        <Text
          style={[
            styles.filterText,
            filterType === 'documents' && styles.activeFilterText
          ]}
        >
          Documente
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          filterType === 'transport' && styles.activeFilterTab
        ]}
        onPress={() => setFilterType('transport')}
      >
        <Text
          style={[
            styles.filterText,
            filterType === 'transport' && styles.activeFilterText
          ]}
        >
          Transport
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {renderHeader()}
      {renderFilterTabs()}

      <View style={styles.content}>
        <NotificationsList
          navigation={navigation}
          showHeader={false}
          filterType={filterType}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#888',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  activeFilterTab: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
});

export default NotificationsScreen;