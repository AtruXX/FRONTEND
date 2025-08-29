import { StyleSheet } from 'react-native';
import COLORS from '../../utils/COLORS';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.medium,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: COLORS.medium,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    // Neumorphic shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    marginLeft: 8,
  },
  expiredSectionTitle: {
    color: COLORS.danger,
  },
  documentCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    // Neumorphic shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    // Light inner shadow effect
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    backgroundColor: '#FFF5F5', // Very light red background
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // Neumorphic icon container
    shadowColor: '#000000',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  expiredTitle: {
    color: COLORS.danger,
  },
  documentCategory: {
    fontSize: 12,
    color: COLORS.medium,
    textTransform: 'uppercase',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  documentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expirationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  daysLeft: {
    fontSize: 14,
    color: COLORS.medium,
    marginLeft: 6,
    fontWeight: '500',
  },
  expiredDays: {
    color: COLORS.danger,
    fontWeight: '600',
  },
  expirationDate: {
    fontSize: 12,
    color: COLORS.light,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: COLORS.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
});