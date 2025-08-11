import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform, SafeAreaView, StatusBar, ScrollView, RefreshControl, Alert } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from "./styles"; 
import { BASE_URL } from "../../utils/BASE_URL";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    company: "",
    name: "",
    role: "",
    initials: "",
    phone: "",
    yearsInCompany: 0,
    currentLocation: "",
    managerContact: ""
  });
  const [documents, setDocuments] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dispatcherNumber = '0745346397';

  const toggleContact = () => {
    setContactExpanded(!contactExpanded);
  };

  const toggleDocuments = () => {
    setDocumentsExpanded(!documentsExpanded);
  };

  const callDispatcher = () => {
    const phoneUrl = Platform.OS === 'android'
      ? `tel:${dispatcherNumber}`
      : `telprompt:${dispatcherNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch(error => console.log('Error with phone call:', error));
  };

  const callManager = () => {
    if (!profileData.managerContact) {
      Alert.alert('Eroare', 'Nu există numărul de telefon al managerului');
      return;
    }
    
    const phoneUrl = Platform.OS === 'android'
      ? `tel:${profileData.managerContact}`
      : `telprompt:${profileData.managerContact}`;

    Linking.canOpenURL(phoneUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        }
      })
      .catch(error => console.log('Error with phone call:', error));
  };

  const openDocument = (documentUrl) => {
    Linking.canOpenURL(documentUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(documentUrl);
        } else {
          Alert.alert('Eroare', 'Nu se poate deschide documentul');
        }
      })
      .catch(error => console.log('Error opening document:', error));
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchProfileData(),
      fetchDocuments(),
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const fetchProfileData = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        console.error('No auth token found');
        return;
      }

      const headers = {
        'Authorization': `Token ${authToken}`,
      };

      const response = await fetch(`${BASE_URL}profile/`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      const nameParts = data.name.split(' ');
      const initials = nameParts.length > 1
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
        : nameParts[0].substring(0, 2);

      // Calculate years in company (assuming you have hire_date in profile data)
      const yearsInCompany = data.hire_date 
        ? new Date().getFullYear() - new Date(data.hire_date).getFullYear()
        : 0;

      setProfileData({
        name: data.name,
        role: "Sofer",
        initials: initials.toUpperCase(),
        company: data.company || "",
        phone: data.phone_number || "N/A",
        yearsInCompany: yearsInCompany,
        currentLocation: data.current_location || "Necunoscut",
        managerContact: data.manager_phone || ""
      });

    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) return;

      const headers = {
        'Authorization': `Token ${authToken}`,
      };

      const response = await fetch(`${BASE_URL}personal-documents`, {
        method: 'GET',
        headers: headers
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const documentsData = await response.json();
      setDocuments(documentsData);

      // Fetch expiration info for each document
      const expirationPromises = documentsData.map(async (doc) => {
        try {
          const expResponse = await fetch(`${BASE_URL}personal-documents/expiration/${doc.id}`, {
            method: 'GET',
            headers: headers
          });
          
          if (expResponse.ok) {
            const expData = await expResponse.json();
            return { ...doc, days_left: expData.days_left };
          }
          return { ...doc, days_left: null };
        } catch (error) {
          console.error('Error fetching expiration for doc:', doc.id, error);
          return { ...doc, days_left: null };
        }
      });

      const documentsWithExpiration = await Promise.all(expirationPromises);
      
      // Filter documents that are expiring soon (less than 30 days)
      const expiring = documentsWithExpiration.filter(doc => 
        doc.days_left !== null && doc.days_left <= 30
      );
      
      setExpiringDocuments(expiring);

    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const getExpirationColor = (daysLeft) => {
    if (daysLeft <= 7) return '#FF7285'; // danger
    if (daysLeft <= 30) return '#FFBD59'; // warning
    return '#63C6AE'; // success
  };

  const getExpirationText = (daysLeft) => {
    if (daysLeft <= 0) return 'EXPIRAT';
    if (daysLeft === 1) return '1 zi';
    return `${daysLeft} zile`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#373A56" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInitials}>{profileData.initials}</Text>
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{profileData.name}</Text>
            <Text style={styles.profileRole}>{profileData.role}</Text>
            <Text style={styles.profileCompany}>{profileData.company}</Text>
          </View>
        </View>

        {/* Essential Information Section */}
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Informații Esențiale</Text>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Telefon</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{profileData.phone}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Ani în firmă</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{profileData.yearsInCompany} ani</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Locația curentă</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{profileData.currentLocation}</Text>
          </View>

          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Documente</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{documents.length} încărcate</Text>
          </View>
        </View>

        {/* Expiring Documents Alert */}
        {expiringDocuments.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={20} color="#FFBD59" />
              <Text style={styles.alertTitle}>Documente ce expiră curând</Text>
            </View>
            {expiringDocuments.map((doc) => (
              <View key={doc.id} style={styles.alertItem}>
                <Text style={styles.alertDocTitle}>{doc.title}</Text>
                <Text style={[
                  styles.alertExpiration, 
                  { color: getExpirationColor(doc.days_left) }
                ]}>
                  {getExpirationText(doc.days_left)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Settings Section */}
        <Text style={styles.settingsTitle}>Opțiuni</Text>

        {/* Documents Section */}
        <View style={styles.settingOuterContainer}>
          <TouchableOpacity
            style={styles.settingContainer}
            onPress={toggleDocuments}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="file-text" size={20} color="#6B6F8D" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Documentele Mele</Text>
              <Text style={styles.settingSubtitle}>Vezi și descarcă documentele tale</Text>
            </View>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{documents.length}</Text>
            </View>
            <Ionicons
              name={documentsExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#6B6F8D"
            />
          </TouchableOpacity>

          {documentsExpanded && (
            <View style={styles.dropdownContainer}>
              {documents.length === 0 ? (
                <Text style={styles.noDocumentsText}>Nu există documente încărcate</Text>
              ) : (
                documents.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    style={styles.documentItem}
                    onPress={() => openDocument(doc.document)}
                  >
                    <View style={styles.documentInfo}>
                      <Text style={styles.documentTitle}>{doc.title}</Text>
                      <Text style={styles.documentExpiration}>
                        Expiră: {new Date(doc.expiration_date).toLocaleDateString('ro-RO')}
                      </Text>
                    </View>
                    <Ionicons name="download-outline" size={20} color="#5A5BDE" />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Manager Contact Section */}
        {profileData.managerContact && (
          <View style={styles.settingOuterContainer}>
            <TouchableOpacity
              style={styles.settingContainer}
              onPress={callManager}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconContainer}>
                <Feather name="user-check" size={20} color="#6B6F8D" />
              </View>
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Contact Manager</Text>
                <Text style={styles.settingSubtitle}>Sună managerul firmei</Text>
              </View>
              <Feather name="phone" size={20} color="#5A5BDE" />
            </TouchableOpacity>
          </View>
        )}

        {/* Dispatcher Contact Section */}
        <View style={styles.settingOuterContainer}>
          <TouchableOpacity
            style={styles.settingContainer}
            onPress={toggleContact}
            activeOpacity={0.7}
          >
            <View style={styles.settingIconContainer}>
              <Feather name="phone" size={20} color="#6B6F8D" />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Contact Dispecer</Text>
              <Text style={styles.settingSubtitle}>Contactează-ți telefonic dispecerul</Text>
            </View>
            <Ionicons
              name={contactExpanded ? "chevron-up" : "chevron-down"}
              size={24}
              color="#6B6F8D"
            />
          </TouchableOpacity>

          {contactExpanded && (
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownText}>
                Atinge pentru a apela dispecerul:
              </Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={callDispatcher}
              >
                <Feather name="phone-call" size={18} color="#FFFFFF" />
                <Text style={styles.callButtonText}>{dispatcherNumber}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');

              if (!token) {
                Alert.alert('Eroare', 'Nu s-a găsit token-ul de autentificare.');
                return;
              }

              const response = await fetch(`${BASE_URL}auth/token/logout`, {
                method: 'POST',
                headers: {
                  'Authorization': `Token ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                await AsyncStorage.removeItem('authToken');
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              } else {
                const err = await response.json();
                console.error('Logout failed:', err);
                Alert.alert('Eroare', 'Delogarea a eșuat.');
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Eroare', 'Ceva a mers greșit în timpul delogării.');
            }
          }}
        >
          <Text style={styles.signOutText}>Delogheaza-te</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;