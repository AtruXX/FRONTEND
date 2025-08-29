// ProfileScreen/index.js - Optimized version
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Linking, 
  Platform, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGetUserProfileQuery } from '../../services/profileService';
import { useGetTotalTransportsQuery } from '../../services/transportService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import { styles } from "./styles";
import { BASE_URL } from "../../utils/BASE_URL";
import PageHeader from "../../components/General/Header";

// Memoized components for better performance
const ProfileInfo = React.memo(({ profileData }) => {
  const initials = useMemo(() => 
    profileData?.initials || 'N/A'
  , [profileData?.initials]);

  const role = useMemo(() => 
    profileData?.is_driver ? 'Șofer' : 
    profileData?.is_dispatcher ? 'Dispecer' : 'Utilizator'
  , [profileData?.is_driver, profileData?.is_dispatcher]);

  return (
    <View style={styles.profileInfoContainer}>
      <View style={styles.profileContainer}>
        <Text style={styles.profileInitials}>{initials}</Text>
      </View>
      <View style={styles.profileTextContainer}>
        <Text style={styles.profileName}>{profileData?.name || 'Nume necunoscut'}</Text>
        <Text style={styles.profileRole}>{role}</Text>
        <Text style={styles.profileCompany}>{profileData?.company || 'Companie necunoscută'}</Text>
      </View>
    </View>
  );
});

const DataRow = React.memo(({ label, value, valueStyle }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label}</Text>
    <Text style={styles.dataDivider}>|</Text>
    <Text style={[styles.dataValue, valueStyle]}>{value}</Text>
  </View>
));

const DataSection = React.memo(({ title, children }) => (
  <View style={styles.dataContainer}>
    <Text style={styles.dataTitle}>{title}</Text>
    {children}
  </View>
));

const SettingItem = React.memo(({ 
  iconName, 
  title, 
  subtitle, 
  onPress, 
  showChevron = true,
  badge,
  expandable = false,
  expanded = false
}) => (
  <TouchableOpacity
    style={styles.settingContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingIconContainer}>
      <Feather name={iconName} size={20} color="#6B6F8D" />
    </View>
    <View style={styles.settingTextContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingSubtitle}>{subtitle}</Text>
    </View>
    {badge && (
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    )}
    {showChevron && (
      <Ionicons
        name={expandable ? (expanded ? "chevron-up" : "chevron-down") : "chevron-forward"}
        size={24}
        color="#6B6F8D"
      />
    )}
  </TouchableOpacity>
));

const DocumentItem = React.memo(({ doc, onPress }) => (
  <TouchableOpacity
    style={styles.documentItem}
    onPress={() => onPress(doc.document)}
  >
    <View style={styles.documentInfo}>
      <Text style={styles.documentTitle}>{doc.title}</Text>
      <Text style={styles.documentExpiration}>
        Expiră: {new Date(doc.expiration_date).toLocaleDateString('ro-RO')}
      </Text>
    </View>
    <Ionicons name="download-outline" size={20} color="#5A5BDE" />
  </TouchableOpacity>
));

const AlertItem = React.memo(({ doc }) => {
  const getExpirationColor = useCallback((daysLeft) => {
    if (daysLeft <= 7) return '#FF7285';
    if (daysLeft <= 30) return '#FFBD59';
    return '#63C6AE';
  }, []);

  const getExpirationText = useCallback((daysLeft) => {
    if (daysLeft <= 0) return 'EXPIRAT';
    if (daysLeft === 1) return '1 zi';
    return `${daysLeft} zile`;
  }, []);

  return (
    <View style={styles.alertItem}>
      <Text style={styles.alertDocTitle}>{doc.title}</Text>
      <Text style={[
        styles.alertExpiration,
        { color: getExpirationColor(doc.days_left) }
      ]}>
        {getExpirationText(doc.days_left)}
      </Text>
    </View>
  );
});

const ProfileScreen = React.memo(() => {
  const navigation = useNavigation();
  const { showLoading, hideLoading } = useLoading();
  
  // Get user profile using the service
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile
  } = useGetUserProfileQuery();

  // Get total transports count
  const {
    data: transportsData,
    isLoading: transportsLoading,
    error: transportsError,
    refetch: refetchTransports
  } = useGetTotalTransportsQuery();

  const [documents, setDocuments] = useState([]);
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const dispatcherNumber = '0745346397';

  // Update global loading state based on profile and transports loading
  useEffect(() => {
    if (profileLoading || transportsLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [profileLoading, transportsLoading, showLoading, hideLoading]);

  // Memoized calculations
  const profileCalculations = useMemo(() => {
    if (!profileData) return {};

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

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('ro-RO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const getDriverStatus = () => {
      if (!profileData?.driver) return 'Inactiv';
      return profileData.driver.on_road ? 'Pe drum' : 'În depou';
    };

    const getDriverRating = () => {
      if (!profileData?.driver) return 'N/A';
      const rating = profileData.driver.average_rating;
      return rating > 0 ? `${rating.toFixed(1)}/5.0` : 'Fără evaluare';
    };

    return {
      timeInCompany: calculateTimeInCompany(profileData.hire_date),
      age: calculateAge(profileData.dob),
      formattedLastLogin: profileData?.last_login ? new Date(profileData.last_login).toLocaleString('ro-RO') : 'N/A',
      formattedLicenseExpiration: formatDate(profileData?.license_expiration_date),
      driverStatus: getDriverStatus(),
      driverRating: getDriverRating(),
      userType: profileData?.is_admin ? 'Administrator' : 
                profileData?.is_driver ? 'Șofer' : 
                profileData?.is_dispatcher ? 'Dispecer' : 'Utilizator standard'
    };
  }, [profileData]);

  // Memoized handlers
  const toggleContact = useCallback(() => {
    setContactExpanded(!contactExpanded);
  }, [contactExpanded]);

  const toggleDocuments = useCallback(() => {
    setDocumentsExpanded(!documentsExpanded);
  }, [documentsExpanded]);

  const callDispatcher = useCallback(() => {
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
  }, [dispatcherNumber]);

  const callManager = useCallback(() => {
    const managerPhone = '+40755123456';
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
  }, []);

  const openDocument = useCallback((documentUrl) => {
    Linking.canOpenURL(documentUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(documentUrl);
        } else {
          Alert.alert('Eroare', 'Nu se poate deschide documentul');
        }
      })
      .catch(error => console.log('Error opening document:', error));
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      showLoading();
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
    } finally {
      hideLoading();
    }
  }, [navigation, showLoading, hideLoading]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchTransports()]);
    setRefreshing(false);
  }, [refetchProfile, refetchTransports]);

  const handleRetry = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  // Memoized render functions
  const renderDocumentItem = useCallback((doc) => (
    <DocumentItem key={doc.id} doc={doc} onPress={openDocument} />
  ), [openDocument]);

  const renderAlertItem = useCallback((doc) => (
    <AlertItem key={doc.id} doc={doc} />
  ), []);

  // Error state
  if (profileError || transportsError) {
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
          <Text style={styles.errorTitle}>Eroare la încărcarea datelor</Text>
          <Text style={styles.errorText}>Nu s-au putut încărca informațiile profilului sau transporturilor</Text>
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
        removeClippedSubviews={true}
      >
        {/* Profile Info */}
        <ProfileInfo profileData={profileData} />

        {/* Essential Information Section */}
        <DataSection title="Informații Personale">
          <DataRow label="Email" value={profileData?.email || 'N/A'} />
          <DataRow label="Telefon" value={profileData?.phone_number || 'N/A'} />
          <DataRow label="Vârsta" value={profileCalculations.age} />
          <DataRow label="Ani în firmă" value={profileCalculations.timeInCompany} />
          <DataRow 
            label="Status cont" 
            value={profileData?.is_active ? 'Activ' : 'Inactiv'}
            valueStyle={{ color: profileData?.is_active ? '#63C6AE' : '#FF7285' }}
          />
        </DataSection>

        {/* Driver Specific Information */}
        {profileData?.is_driver && (
          <DataSection title="Informații Șofer">
            <DataRow 
              label="Status curent" 
              value={profileCalculations.driverStatus}
              valueStyle={{ 
                color: profileData?.driver?.on_road ? '#FFBD59' : '#63C6AE' 
              }}
            />
            <DataRow label="Evaluare" value={profileCalculations.driverRating} />
            <DataRow 
              label="Transport activ" 
              value={profileData?.driver?.active_transport ? `#${profileData.driver.active_transport}` : 'Niciun transport'}
            />
            <DataRow 
              label="Total transporturi" 
              value={`${transportsData?.totalTransports || 0} transporturi`}
            />
            <DataRow label="Expirare permis" value={profileCalculations.formattedLicenseExpiration} />
          </DataSection>
        )}

        {/* Last Login Information */}
        <DataSection title="Informații Sesiune">
          <DataRow label="Ultima autentificare" value={profileCalculations.formattedLastLogin} />
          <DataRow label="Tip utilizator" value={profileCalculations.userType} />
        </DataSection>

        {/* Expiring Documents Alert */}
        {expiringDocuments.length > 0 && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <Ionicons name="warning" size={20} color="#FFBD59" />
              <Text style={styles.alertTitle}>Documente ce expiră curând</Text>
            </View>
            {expiringDocuments.map(renderAlertItem)}
          </View>
        )}

        {/* Settings Section */}
        <Text style={styles.settingsTitle}>Opțiuni</Text>

        {/* Documents Section */}
        <View style={styles.settingOuterContainer}>
          <SettingItem
            iconName="file-text"
            title="Documentele Mele"
            subtitle="Vezi și descarcă documentele tale"
            onPress={toggleDocuments}
            badge={documents.length}
            expandable={true}
            expanded={documentsExpanded}
          />
          {documentsExpanded && (
            <View style={styles.dropdownContainer}>
              {documents.length === 0 ? (
                <Text style={styles.noDocumentsText}>Nu există documente încărcate</Text>
              ) : (
                documents.map(renderDocumentItem)
              )}
            </View>
          )}
        </View>

        {/* Manager Contact Section */}
        <View style={styles.settingOuterContainer}>
          <SettingItem
            iconName="user-check"
            title="Contact Manager"
            subtitle="Sună managerul firmei"
            onPress={callManager}
            showChevron={false}
          />
        </View>

        {/* Dispatcher Contact Section */}
        <View style={styles.settingOuterContainer}>
          <SettingItem
            iconName="phone"
            title="Contact Dispecer"
            subtitle="Contactează-ți telefonic dispecerul"
            onPress={toggleContact}
            expandable={true}
            expanded={contactExpanded}
          />
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
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Deloghează-te</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
});

ProfileScreen.displayName = 'ProfileScreen';

export default ProfileScreen;