import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Feather name="menu" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Profile Info */}
      <View style={styles.profileInfoContainer}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.profileImage}
        />
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>Andrei Popescu</Text>
          <Text style={styles.profileRole}>Driver</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Feather name="bell" size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      {/* Profile Details Section */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View style={styles.iconCircle}>
            <Feather name="user" size={20} color="#777" />
          </View>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Profile details</Text>
            <Text style={styles.sectionSubtitle}>Manage your account</Text>
          </View>
          <Ionicons name="chevron-down" size={24} color="#777" />
        </View>
      </View>
      
      {/* General Data Section */}
      <View style={styles.dataContainer}>
        <Text style={styles.dataTitle}>General data</Text>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Company</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>Gigi Trans SRL</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Truck ID</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>TRK-7842</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>License</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>B-234567</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Phone</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>0745123456</Text>
        </View>
        
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Email</Text>
          <Text style={styles.dataDivider}>|</Text>
          <Text style={styles.dataValue}>andrei.driver@gmail.com</Text>
        </View>
      </View>
      
      {/* Settings Section */}
      <Text style={styles.settingsTitle}>Settings</Text>
      
      {/* Notifications Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingIconContainer}>
          <Feather name="bell" size={20} color="#777" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Notifications</Text>
          <Text style={styles.settingSubtitle}>Manage your notifications</Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#777" />
      </View>
      
      {/* Routes Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingIconContainer}>
          <Feather name="map" size={20} color="#777" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Routes</Text>
          <Text style={styles.settingSubtitle}>View your assigned routes</Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#777" />
      </View>
      
      {/* Dispatcher Contact Section */}
      <View style={styles.settingContainer}>
        <View style={styles.settingIconContainer}>
          <Feather name="phone" size={20} color="#777" />
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>Dispatcher Contact</Text>
          <Text style={styles.settingSubtitle}>Contact your dispatcher</Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#777" />
      </View>
      
      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton}>
        <Text style={styles.signOutText}>Sign out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  menuButton: {
    padding: 4,
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '500',
  },
  profileRole: {
    fontSize: 16,
    color: '#4285F4',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  dataContainer: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
  },
  dataRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  dataLabel: {
    fontSize: 14,
    color: '#777',
  },
  dataDivider: {
    fontSize: 14,
    color: '#777',
    marginHorizontal: 6,
  },
  dataValue: {
    fontSize: 14,
    color: '#777',
  },
  settingsTitle: {
    fontSize: 22,
    fontWeight: '500',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  settingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  addIconCircle: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    bottom: -2,
    right: -2,
  },
  settingTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
  signOutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
  },
});

export default ProfileScreen;