// QueueScreen/index.js - Queue Transport Management Screen
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import {
  useGetDriverQueueQuery,
  useStartNextTransportMutation,
  useGetNextTransportQuery
} from '../../services/transportService';
import { useLoading } from "../../components/General/loadingSpinner.js";
import PageHeader from "../../components/General/Header";

// Queue Item Component
const QueueItem = React.memo(({ item, index, isNext, isActive, onStartTransport, isStarting }) => {
  const getStatusColor = useCallback((position) => {
    if (position === 1) return '#059669'; // Green for next
    if (position === 2) return '#F59E0B'; // Amber for second
    return '#6B7280'; // Gray for others
  }, []);

  const getStatusIcon = useCallback((position) => {
    if (position === 1) return 'play-forward-circle';
    if (position === 2) return 'time';
    return 'list';
  }, []);

  const statusColor = getStatusColor(item.queue_position);
  const statusIcon = getStatusIcon(item.queue_position);

  return (
    <View style={[styles.queueItem, isNext && styles.nextQueueItem]}>
      <View style={styles.queueItemHeader}>
        <View style={styles.queueItemInfo}>
          <View style={styles.positionBadge}>
            <Text style={styles.positionText}>#{item.queue_position}</Text>
          </View>
          <View style={styles.queueItemDetails}>
            <Text style={styles.queueItemTitle}>Transport #{item.id}</Text>
            <Text style={styles.queueItemSubtitle}>
              Status: {item.status || 'atribuit'}
            </Text>
            {item.expeditor_email && (
              <Text style={styles.queueItemSubtitle}>
                Expeditor: {item.expeditor_email}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.statusIndicator, { backgroundColor: `${statusColor}15` }]}>
          <Ionicons name={statusIcon} size={20} color={statusColor} />
        </View>
      </View>

      {isNext && item.can_start && (
        <View style={styles.queueItemActions}>
          <TouchableOpacity
            style={[styles.startButton, isStarting && styles.startButtonDisabled]}
            onPress={() => onStartTransport(item)}
            disabled={isStarting}
          >
            {isStarting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="play-forward-circle" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.startButtonText}>ÎNCEPE TRANSPORTUL</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {!isNext && (
        <View style={styles.queueItemFooter}>
          <Text style={styles.waitingText}>
            Așteaptă finalizarea transporturilor anterioare
          </Text>
        </View>
      )}
    </View>
  );
});

// Empty Queue State
const EmptyQueueState = React.memo(({ onRefresh, refreshing }) => (
  <View style={styles.emptyContainer}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="list-outline" size={48} color="#6366F1" />
    </View>
    <Text style={styles.emptyTitle}>Coada de transporturi este goală</Text>
    <Text style={styles.emptyText}>
      Dispecerul va adăuga transporturi în coada ta.
      Vei primi o notificare când vor fi disponibile transporturi noi.
    </Text>
    <TouchableOpacity
      style={styles.refreshButton}
      onPress={onRefresh}
      disabled={refreshing}
    >
      <Text style={styles.refreshButtonText}>Verifică din nou</Text>
      <Ionicons name="refresh" size={18} color="white" style={{ marginLeft: 6 }} />
    </TouchableOpacity>
  </View>
));

// Error State
const ErrorState = React.memo(({ error, onRefresh }) => (
  <View style={styles.errorContainer}>
    <View style={styles.errorIconContainer}>
      <Ionicons name="alert-circle-outline" size={40} color="#EF4444" />
    </View>
    <Text style={styles.errorTitle}>Eroare la încărcarea cozii</Text>
    <Text style={styles.errorText}>
      {error.message?.includes('401')
        ? 'Sesiunea a expirat. Te rugăm să te autentifici din nou.'
        : error.message?.includes('404')
        ? 'Sistemul de coadă nu este disponibil momentan.'
        : error.message || 'Nu s-a putut încărca coada de transporturi'}
    </Text>
    <TouchableOpacity
      style={styles.retryButton}
      onPress={onRefresh}
    >
      <Text style={styles.retryButtonText}>Încearcă din nou</Text>
      <Ionicons name="refresh" size={18} color="white" style={{ marginLeft: 6 }} />
    </TouchableOpacity>
  </View>
));

// Main Queue Screen Component
const QueueScreen = React.memo(({ navigation, route }) => {
  const { showLoading, hideLoading } = useLoading();
  const [startingTransport, setStartingTransport] = useState(null);

  // Queue system hooks
  const {
    data: queueData,
    isLoading: queueLoading,
    isFetching: queueFetching,
    error: queueError,
    refetch: refetchQueue
  } = useGetDriverQueueQuery();

  const [startNextTransportMutation, { isLoading: isStartingNext }] = useStartNextTransportMutation();

  // Update global loading state
  useEffect(() => {
    if (queueLoading || isStartingNext) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [queueLoading, isStartingNext, showLoading, hideLoading]);

  // Memoized data extraction
  const { queue, nextTransportId, currentTransportId, queueCount, hasTransportable } = useMemo(() => {
    return {
      queue: queueData?.queue || [],
      nextTransportId: queueData?.next_transport_id,
      currentTransportId: queueData?.current_transport_id,
      queueCount: queueData?.queue_count || 0,
      hasTransportable: queueData?.has_transportable || false,
    };
  }, [queueData]);

  // Handlers
  const onRefresh = useCallback(async () => {
    try {
      await refetchQueue();
    } catch (error) {
      console.error('Error refreshing queue:', error);
    }
  }, [refetchQueue]);

  const handleStartTransport = useCallback(async (transport) => {
    if (!transport.can_start) {
      Alert.alert(
        'Atenție',
        'Acest transport nu poate fi început încă. Trebuie să finalizezi transportul curent sau să aștepți rândul.',
        [{ text: 'OK' }]
      );
      return;
    }

    setStartingTransport(transport.id);

    try {
      const result = await startNextTransportMutation().unwrap();

      Alert.alert(
        'Succes!',
        'TRANSPORT ÎNCEPUT CU SUCCES! DISPECERUL TĂU VA FI ANUNȚAT!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to transport main page
              navigation.navigate('TransportMainPage', { transportId: result.transport_id });
            }
          }
        ]
      );

      await onRefresh();
    } catch (error) {
      console.error('Error starting transport:', error);

      let errorMessage = 'Nu s-a putut începe transportul. Încearcă din nou.';

      if (error.message?.includes('No transport available')) {
        errorMessage = 'Nu există transporturi disponibile în coadă.';
      } else if (error.message?.includes('queue')) {
        errorMessage = 'Eroare la sistemul de coadă. Încearcă din nou.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Sesiunea a expirat. Te rugăm să te autentifici din nou.';
      }

      Alert.alert(
        'Eroare',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setStartingTransport(null);
    }
  }, [startNextTransportMutation, onRefresh, navigation]);

  const renderQueueItem = useCallback(({ item, index }) => {
    const isNext = item.queue_position === 1;
    const isActive = currentTransportId === item.id;
    const isStarting = startingTransport === item.id;

    return (
      <QueueItem
        item={item}
        index={index}
        isNext={isNext}
        isActive={isActive}
        onStartTransport={handleStartTransport}
        isStarting={isStarting}
      />
    );
  }, [currentTransportId, startingTransport, handleStartTransport]);

  const keyExtractor = useCallback((item) => item.id.toString(), []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <PageHeader
          title="COADA DE TRANSPORTURI"
          onBack={() => navigation.goBack()}
          onRetry={onRefresh}
          showRetry={true}
          showBack={true}
        />

        {/* Queue Status Header */}
        <View style={styles.queueStatusContainer}>
          <View style={styles.queueStatusHeader}>
            <Ionicons name="list" size={24} color="#6366F1" />
            <Text style={styles.queueStatusTitle}>Status Coadă</Text>
          </View>

          <View style={styles.queueStats}>
            <View style={styles.queueStat}>
              <Text style={styles.queueStatNumber}>{queueCount}</Text>
              <Text style={styles.queueStatLabel}>Transporturi în coadă</Text>
            </View>

            {currentTransportId && (
              <View style={styles.queueStat}>
                <Text style={styles.queueStatNumber}>#{currentTransportId}</Text>
                <Text style={styles.queueStatLabel}>Transport activ</Text>
              </View>
            )}

            {nextTransportId && (
              <View style={styles.queueStat}>
                <Text style={styles.queueStatNumber}>#{nextTransportId}</Text>
                <Text style={styles.queueStatLabel}>Următorul</Text>
              </View>
            )}
          </View>

          {/* Queue Status Messages */}
          {queueCount > 0 && (
            (() => {
              const allPositionsZero = queue.every(t => t.queue_position === 0);
              const noCanStart = queue.every(t => !t.can_start);

              if (allPositionsZero && noCanStart) {
                return (
                  <View style={styles.warningIndicator}>
                    <Ionicons name="warning" size={16} color="#F59E0B" />
                    <Text style={styles.warningText}>
                      Coada nu este ordonată. Contactați dispecerul pentru organizare.
                    </Text>
                  </View>
                );
              } else if (hasTransportable) {
                return (
                  <View style={styles.readyIndicator}>
                    <Ionicons name="checkmark-circle" size={16} color="#059669" />
                    <Text style={styles.readyText}>Gata pentru următorul transport</Text>
                  </View>
                );
              } else if (queueCount > 0) {
                return (
                  <View style={styles.waitingIndicator}>
                    <Ionicons name="time" size={16} color="#6B7280" />
                    <Text style={styles.waitingText}>În așteptarea organizării cozii</Text>
                  </View>
                );
              }
              return null;
            })()
          )}
        </View>

        {/* Queue Content */}
        {queueError ? (
          <ErrorState error={queueError} onRefresh={onRefresh} />
        ) : queue.length > 0 ? (
          <FlatList
            data={queue}
            keyExtractor={keyExtractor}
            renderItem={renderQueueItem}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={queueFetching}
                onRefresh={onRefresh}
                colors={['#6366F1']}
              />
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyQueueState onRefresh={onRefresh} refreshing={queueFetching} />
        )}
      </View>
    </SafeAreaView>
  );
});

QueueScreen.displayName = 'QueueScreen';

export default QueueScreen;