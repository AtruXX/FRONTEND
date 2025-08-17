import React, { useState } from "react";
import { View, Text, TouchableOpacity, Linking, Platform, SafeAreaView, ScrollView, RefreshControl, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetUserProfileQuery } from '../../services/profileService';
import { styles } from "./styles";
import { BASE_URL } from "../../utils/BASE_URL";
import PageHeader from "../../components/General/Header";

const ProfileScreen = () => {
  const navigation = useNavigation();
  
  // Get user profile using the service
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  const [documents, setDocuments] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatcherNumber = '0745346397';

  // Calculate years and months since hire date
  const calculateTimeInCompany = (hireDate) => {
    if (!hireDate) return 'N/A';
    
    const hired = new Date(hireDate);
    const now = new Date();
    
    let years = now.getFullYear() - hired.getFullYear();
    let months = now.getMonth() - hired.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) {
      return months === 1 ? '1 lună' : `${months} luni`;
    } else if (months === 0) {
      return years === 1 ? '1 an' : `${years} ani`;
    } else {
      return `${years} ${years === 1 ? 'an' : 'ani'} și ${months} ${months === 1 ? 'lună' : 'luni'}`;
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    
    const birth = new Date(dateOfBirth);
    const now = new Date();
    
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    
    if (months < 0 || (months === 0 && now.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    
    if (now.getDate() < birth.getDate()) {
      months--;
    }
    
    if (years === 0) {
      return months === 1 ? '1 lună' : `${months} luni`;
    } else if (months === 0) {
      return years === 1 ? '1 an' : `${years} ani`;
    } else {
      return `${years} ${years === 1 ? 'an' : 'ani'} și ${months} ${months === 1 ? 'lună' : 'luni'}`;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get driver status text
  const getDriverStatus = () => {
    if (!profileData?.driver) return 'Inactiv';
    return profileData.driver.on_road ? 'Pe drum' : 'În depou';
  };

  // Get driver rating display
  const getDriverRating = () => {
    if (!profileData?.driver) return 'N/A';
    const rating = profileData.driver.average_rating;
    return rating > 0 ? `${rating.toFixed(1)}/5.0` : 'Fără evaluare';
  };

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
    const managerPhone = '+40755123456'; // You can get this from API later
    const phoneUrl = Platform.OS === 'android'
      ? `tel:${managerPhone}`
      : `telprompt:${managerPhone}`;
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
      const expiring = documentsWithExpiration.filter(doc =>
        doc.days_left !== null && doc.days_left <= 30
      );
      setExpiringDocuments(expiring);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchProfile(),
      fetchDocuments(),
    ]);
    setRefreshing(false);
  };

  const handleRetry = async () => {
    await onRefresh();
  };

  const getExpirationColor = (daysLeft) => {
    if (daysLeft <= 7) return '#FF7285';
    if (daysLeft <= 30) return '#FFBD59';
    return '#63C6AE';
  };

  const getExpirationText = (daysLeft) => {
    if (daysLeft <= 0) return 'EXPIRAT';
    if (daysLeft === 1) return '1 zi';
    return `${daysLeft} zile`;
  };

  // Loading state
  if (profileLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Profil"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass-outline" size={40} color="#5A5BDE" />
          <Text style={styles.loadingText}>Se încarcă profilul...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader
          title="Profil"
          onBack={() => navigation.goBack()}
          onRetry={handleRetry}
          showRetry={true}
          showBack={true}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={40} color="#FF7285" />
          <Text style={styles.errorTitle}>Eroare la încărcarea profilului</Text>
          <Text style={styles.errorText}>Nu s-au putut încărca informațiile profilului</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Încearcă din nou</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title="Profil"
        onBack={() => navigation.goBack()}
        onRetry={handleRetry}
        showRetry={true}
        showBack={true}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Info */}
        <View style={styles.profileInfoContainer}>
          <View style={styles.profileContainer}>
            <Text style={styles.profileInitials}>{profileData?.initials || 'N/A'}</Text>
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>{profileData?.name || 'Nume necunoscut'}</Text>
            <Text style={styles.profileRole}>
              {profileData?.is_driver ? 'Șofer' : profileData?.is_dispatcher ? 'Dispecer' : 'Utilizator'}
            </Text>
            <Text style={styles.profileCompany}>{profileData?.company || 'Companie necunoscută'}</Text>
          </View>
        </View>

        {/* Essential Information Section */}
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Informații Personale</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Email</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{profileData?.email || 'N/A'}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Telefon</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{profileData?.phone_number || 'N/A'}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Vârsta</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{calculateAge(profileData?.dob)}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Ani în firmă</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>{calculateTimeInCompany(profileData?.hire_date)}</Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Status cont</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={[styles.dataValue, { color: profileData?.is_active ? '#63C6AE' : '#FF7285' }]}>
              {profileData?.is_active ? 'Activ' : 'Inactiv'}
            </Text>
          </View>
        </View>

        {/* Driver Specific Information */}
        {profileData?.is_driver && (
          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Informații Șofer</Text>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Status curent</Text>
              <Text style={styles.dataDivider}>|</Text>
              <Text style={[styles.dataValue, { 
                color: profileData?.driver?.on_road ? '#FFBD59' : '#63C6AE' 
              }]}>
                {getDriverStatus()}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Evaluare</Text>
              <Text style={styles.dataDivider}>|</Text>
              <Text style={styles.dataValue}>{getDriverRating()}</Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Transport activ</Text>
              <Text style={styles.dataDivider}>|</Text>
              <Text style={styles.dataValue}>
                {profileData?.driver?.active_transport ? `#${profileData.driver.active_transport}` : 'Niciun transport'}
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Total transporturi</Text>
              <Text style={styles.dataDivider}>|</Text>
              <Text style={styles.dataValue}>
                {profileData?.driver?.id_transports?.length || 0} transporturi
              </Text>
            </View>
            
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Expirare permis</Text>
              <Text style={styles.dataDivider}>|</Text>
              <Text style={styles.dataValue}>{formatDate(profileData?.license_expiration_date)}</Text>
            </View>
          </View>
        )}

        {/* Last Login Information */}
        <View style={styles.dataContainer}>
          <Text style={styles.dataTitle}>Informații Sesiune</Text>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Ultima autentificare</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>
              {profileData?.last_login ? new Date(profileData.last_login).toLocaleString('ro-RO') : 'N/A'}
            </Text>
          </View>
          
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Tip utilizator</Text>
            <Text style={styles.dataDivider}>|</Text>
            <Text style={styles.dataValue}>
              {profileData?.is_admin ? 'Administrator' : 
               profileData?.is_driver ? 'Șofer' : 
               profileData?.is_dispatcher ? 'Dispecer' : 'Utilizator standard'}
            </Text>
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
          <Text style={styles.signOutText}>Deloghează-te</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;