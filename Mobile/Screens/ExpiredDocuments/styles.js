import { StyleSheet } from 'react-native';
import COLORS from '../../utils/COLORS';

// Enhanced color palette for better visual hierarchy
const ENHANCED_COLORS = {
  ...COLORS,
  background: "#F4F5FB",
  card: "#FFFFFF",
  primary: "#5A5BDE",
  secondary: "#6F89FF",
  accent: "#FF8C66",
  accent2: "#81C3F8",
  dark: "#373A56",
  medium: "#6B6F8D",
  light: "#A0A4C1",
  border: "#E2E5F1",
  success: "#63C6AE",
  warning: "#FFBD59",
  danger: "#FF7285",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ENHANCED_COLORS.background,
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: ENHANCED_COLORS.medium,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: ENHANCED_COLORS.dark,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  errorMessage: {
    fontSize: 16,
    color: ENHANCED_COLORS.medium,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: ENHANCED_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    // Enhanced shadow for better depth
    shadowColor: ENHANCED_COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  retryButtonText: {
    color: ENHANCED_COLORS.card,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: ENHANCED_COLORS.dark,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  expiredSectionTitle: {
    color: ENHANCED_COLORS.danger,
  },
  documentCard: {
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    // Enhanced neomorphic shadow
    shadowColor: ENHANCED_COLORS.dark,
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  expiredCard: {
    borderLeftWidth: 4,
    borderLeftColor: ENHANCED_COLORS.danger,
    backgroundColor: '#FFF5F5',
    // Enhanced shadow for expired cards
    shadowColor: ENHANCED_COLORS.danger,
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: ENHANCED_COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    // Enhanced neomorphic icon container
    shadowColor: ENHANCED_COLORS.dark,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: ENHANCED_COLORS.dark,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  expiredTitle: {
    color: ENHANCED_COLORS.danger,
  },
  documentCategory: {
    fontSize: 12,
    color: ENHANCED_COLORS.medium,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.8,
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
    color: ENHANCED_COLORS.medium,
    marginLeft: 8,
    fontWeight: '600',
  },
  expiredDays: {
    color: ENHANCED_COLORS.danger,
    fontWeight: '700',
  },
  expirationDate: {
    fontSize: 12,
    color: ENHANCED_COLORS.light,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: ENHANCED_COLORS.card,
    borderRadius: 16,
    marginHorizontal: 20,
    marginVertical: 20,
    // Enhanced empty state styling
    shadowColor: ENHANCED_COLORS.dark,
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: ENHANCED_COLORS.dark,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  emptyMessage: {
    fontSize: 16,
    color: ENHANCED_COLORS.medium,
    textAlign: 'center',
    lineHeight: 24,
  },
});

// Additional styles for enhanced functionality
export const documentTypeColors = {
  license: ENHANCED_COLORS.primary,
  insurance: ENHANCED_COLORS.accent2,
  permit: ENHANCED_COLORS.warning,
  certificate: ENHANCED_COLORS.success,
  default: ENHANCED_COLORS.medium,
};