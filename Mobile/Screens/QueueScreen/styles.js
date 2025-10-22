// QueueScreen/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },

  // Queue Status Section
  queueStatusContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  queueStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  queueStatusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },

  queueStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },

  queueStat: {
    alignItems: 'center',
  },

  queueStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
  },

  queueStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },

  readyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  readyText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
    marginLeft: 6,
  },

  warningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  warningText: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
    marginLeft: 6,
    textAlign: 'center',
  },

  waitingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },

  waitingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 6,
  },

  // List Container
  listContainer: {
    padding: 16,
  },

  // Queue Item
  queueItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },

  nextQueueItem: {
    backgroundColor: '#F8F9FF',
  },

  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },

  queueItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  positionBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
  },

  positionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },

  queueItemDetails: {
    flex: 1,
  },

  queueItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },

  queueItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 1,
  },

  statusIndicator: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  queueItemContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },

  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  statusItem: {
    width: '48%',
    marginBottom: 12,
  },

  statusLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  statusIcon: {
    marginRight: 4,
  },

  statusText: {
    fontWeight: '500',
    fontSize: 12,
  },

  queueItemActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  queueItemFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },

  waitingText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Start Button
  startButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  startButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },

  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },

  buttonIcon: {
    marginRight: 8,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },

  refreshButton: {
    flexDirection: 'row',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },

  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },

  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },

  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});