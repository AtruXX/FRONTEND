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
import { useGetPersonalDocumentsQuery } from '../../services/documentsService';
import { styles } from "./styles";
import { BASE_URL } from "../../utils/BASE_URL";
import PageHeader from "../../components/General/Header";
// Memoized components for better performance
const ProfileInfo = React.memo(({ profileData }) => {
  const initials = useMemo(() => 
    profileData?.initials || 'N/A'
  , [profileData?.initials]);
  const role = useMemo(() => {
    if (profileData?.is_admin) return 'Administrator';
    if (profileData?.is_driver) return 'Șofer';
    if (profileData?.is_dispatcher) return 'Dispecer';
    return 'Utilizator';
  }, [profileData?.is_admin, profileData?.is_driver, profileData?.is_dispatcher]);
  return (
    <View style={styles.profileInfoContainer}>
      <View style={styles.profileContainer}>
        <Text style={styles.profileInitials}>{String(initials || 'N/A')}</Text>
      </View>
      <View style={styles.profileTextContainer}>
        <Text style={styles.profileName}>{String(profileData?.name || 'Nume necunoscut')}</Text>
        <Text style={styles.profileRole}>{String(role || 'Utilizator')}</Text>
        <Text style={styles.profileCompany}>{String(profileData?.company || 'Companie necunoscută')}</Text>
      </View>
    </View>
  );
});
const DataRow = React.memo(({ label, value, valueStyle }) => (
  <View style={styles.dataRow}>
    <Text style={styles.dataLabel}>{label || ''}</Text>
    <Text style={styles.dataDivider}>|</Text>
    <Text style={[styles.dataValue, valueStyle]}>{value || 'N/A'}</Text>
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
      <Text style={styles.settingTitle}>{title || ''}</Text>
      <Text style={styles.settingSubtitle}>{subtitle || ''}</Text>
    </View>
    {badge !== undefined && badge !== null && (
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{String(badge)}</Text>
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
    onPress={() => onPress(doc.document || doc.url)}
  >
    <View style={styles.documentInfo}>
      <Text style={styles.documentTitle}>{doc.name || doc.title}</Text>
      <Text style={styles.documentExpiration}>
        {doc.expiration_date ? 
          `Expiră: ${new Date(doc.expiration_date).toLocaleDateString('ro-RO')}` : 
          'Fără dată de expirare'
        }
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
      <Text style={styles.alertDocTitle}>{doc.name || doc.title}</Text>
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
  // Get personal documents
  const {
    data: documentsData,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments
  } = useGetPersonalDocumentsQuery();
  const [expiringDocuments, setExpiringDocuments] = useState([]);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dispatcherNumber = '0745346397';
  // Process documents to identify expiring ones
  useEffect(() => {
    if (documentsData && Array.isArray(documentsData)) {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      const expiring = documentsData.filter(doc => {
        if (!doc.expiration_date) return false;
        const expirationDate = new Date(doc.expiration_date);
        const timeDifference = expirationDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));
        return daysLeft <= 30 && daysLeft >= 0;
      }).map(doc => {
        const expirationDate = new Date(doc.expiration_date);
        const timeDifference = expirationDate.getTime() - today.getTime();
        const daysLeft = Math.ceil(timeDifference / (1000 * 3600 * 24));
        return {
          ...doc,
          days_left: daysLeft
        };
      });
      setExpiringDocuments(expiring);
    }
  }, [documentsData]);
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
      if (!profileData.is_active) return 'Cont dezactivat';
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
                profileData?.is_dispatcher ? 'Dispecer' : 'Utilizator Standard'
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
      .catch(error => {});
  }, [dispatcherNumber]);
  const callManager = useCallback(() => {
    const managerPhone = '+40755123456';
    Alert.alert(
      'Contact Manager',
      `Dorești să suni managerul la numărul ${managerPhone}?`,
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Sună',
          onPress: () => {
            const phoneUrl = Platform.OS === 'android'
              ? `tel:${managerPhone}`
              : `telprompt:${managerPhone}`;
            Linking.canOpenURL(phoneUrl)
              .then(supported => {
                if (supported) {
                  return Linking.openURL(phoneUrl);
                } else {
                  Alert.alert('Eroare', 'Nu se poate inițializa apelul telefonic');
                }
              })
              .catch(error => {
                Alert.alert('Eroare', 'A apărut o eroare la inițializarea apelului');
              });
          },
        },
      ]
    );
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
      .catch(error => {});
  }, []);
  const handleSignOut = useCallback(async () => {
    Alert.alert(
      'Delogare',
      'Ești sigur că vrei să te deloghezi din aplicație?',
      [
        {
          text: 'Anulează',
          style: 'cancel',
        },
        {
          text: 'Deloghează-te',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              // Clear local storage first
              await AsyncStorage.multiRemove([
                'authToken',
                'driverId',
                'userName',
                'userCompany',
                'isDriver',
                'isDispatcher'
              ]);
              // Then try to logout from server
              if (token) {
                try {
                  const response = await fetch(`${BASE_URL}auth/token/logout/`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Token ${token}`,
                      'Content-Type': 'application/json',
                    },
                  });
                  if (!response.ok) {
                  }
                } catch (networkError) {
                }
              }
              // Always navigate to login screen regardless of server response
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              Alert.alert('Eroare', 'A apărut o eroare în timpul delogării. Încearcă din nou.');
            }
          },
        },
      ]
    );
  }, [navigation]);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchTransports(), refetchDocuments()]);
    setRefreshing(false);
  }, [refetchProfile, refetchTransports, refetchDocuments]);
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
  if (profileError || transportsError || documentsError) {
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
          <Text style={styles.errorText}>Nu s-au putut încărca informațiile profilului, transporturilor sau documentelor</Text>
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
            <DataRow label="Evaluare medie" value={profileCalculations.driverRating} />
            <DataRow
              label="Transport activ"
              value={profileData?.active_transport ? `Transport #${profileData.active_transport}` : 'Niciun transport activ'}
            />
            <DataRow
              label="Total transporturi"
              value={profileData?.driver?.id_transports ? `${profileData.driver.id_transports.length || 0} transporturi` : '0 transporturi'}
            />
            <DataRow label="Expirare permis" value={profileCalculations.formattedLicenseExpiration} />
          </DataSection>
        )}
        {/* Dispatcher Specific Information */}
        {profileData?.is_dispatcher && (
          <DataSection title="Informații Dispecer">
            <DataRow
              label="Total transporturi coordonate"
              value={`${transportsData?.totalTransports || 0} transporturi`}
            />
            <DataRow
              label="Transporturi active"
              value={`${transportsData?.activeTransports || 0} active`}
            />
          </DataSection>
        )}
        {/* Admin Specific Information */}
        {profileData?.is_admin && (
          <DataSection title="Informații Administrator">
            <DataRow
              label="Nivel acces"
              value="Administrator complet"
              valueStyle={{ color: '#FF7285', fontWeight: '700' }}
            />
            <DataRow
              label="Companie"
              value={profileData?.company || 'N/A'}
            />
          </DataSection>
        )}
        {/* Account Information */}
        <DataSection title="Informații Cont">
          <DataRow label="Ultima autentificare" value={profileCalculations.formattedLastLogin} />
          <DataRow label="Tip utilizator" value={profileCalculations.userType} />
          <DataRow
            label="Data angajării"
            value={profileData?.hire_date ? new Date(profileData.hire_date).toLocaleDateString('ro-RO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
          />
          <DataRow
            label="Data nașterii"
            value={profileData?.dob ? new Date(profileData.dob).toLocaleDateString('ro-RO', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'N/A'}
          />
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
            badge={(documentsData || []).length}
            expandable={true}
            expanded={documentsExpanded}
          />
          {documentsExpanded && (
            <View style={styles.dropdownContainer}>
              {(!documentsData || documentsData.length === 0) ? (
                <Text style={styles.noDocumentsText}>Nu există documente încărcate</Text>
              ) : (
                documentsData.map(renderDocumentItem)
              )}
            </View>
          )}
        </View>
        {/* Emergency Contact Section */}
        <View style={styles.settingOuterContainer}>
          <SettingItem
            iconName="phone-call"
            title="Contact Manager"
            subtitle="Apel de urgență către management"
            onPress={callManager}
            showChevron={false}
          />
        </View>
        {/* My Transports Section */}
        {profileData?.is_driver && (
          <View style={styles.settingOuterContainer}>
            <SettingItem
              iconName="truck"
              title="Transporturile Mele"
              subtitle="Vezi transporturile tale atribuite"
              onPress={() => navigation.navigate('TransportsScreen')}
              badge={profileData?.driver?.id_transports?.length || transportsData?.totalTransports || 0}
              showChevron={true}
            />
          </View>
        )}
        {/* Notifications Settings */}
        <View style={styles.settingOuterContainer}>
          <SettingItem
            iconName="bell"
            title="Notificări"
            subtitle="Gestionează preferințele de notificare"
            onPress={() => navigation.navigate('NotificationsScreen')}
            showChevron={true}
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
                Apel direct către dispecerul tău:
              </Text>
              <TouchableOpacity
                style={styles.callButton}
                onPress={callDispatcher}
              >
                <Feather name="phone-call" size={18} color="#FFFFFF" />
                <Text style={styles.callButtonText}>{String(dispatcherNumber || 'N/A')}</Text>
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