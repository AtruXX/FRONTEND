import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import COLORS from '../../utils/COLORS.js'; // Adjust import path as needed
// Simple arrow and refresh icons using Unicode characters
const BackIcon = ({ color = COLORS.medium, size = 20 }) => (
  <Text style={[{ fontSize: size, color, fontWeight: 'bold' }]}>←</Text>
);
const RetryIcon = ({ color = COLORS.primary, size = 18 }) => (
  <Text style={[{ fontSize: size, color, fontWeight: 'bold' }]}>↻</Text>
);
const { width } = Dimensions.get('window');
const PageHeader = ({
  onBack,
  onRetry,
  showRetry = true,
  showBack = true,
  title = "",
  containerStyle = {},
  buttonStyle = {},
  titleStyle = {},
  backIconColor = COLORS.medium,
  retryIconColor = COLORS.primary,
  iconSize = 20,
}) => {
  const NeumorphicButton = ({ onPress, children, style, disabled = false }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style,
      ]}
    >
      <View style={[styles.buttonInner, disabled && styles.buttonInnerDisabled]}>
        {children}
      </View>
    </TouchableOpacity>
  );
  return (
    <View style={[styles.headerContainer, containerStyle]}>
      <StatusBar backgroundColor={COLORS.background} barStyle="dark-content" />
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {showBack && (
            <NeumorphicButton
              onPress={onBack}
              style={[styles.iconButton, buttonStyle]}
            >
              <BackIcon color={backIconColor} size={iconSize} />
            </NeumorphicButton>
          )}
        </View>
        <View style={styles.centerSection}>
          {title ? (
            <Text style={[styles.titleText, titleStyle]}>{title}</Text>
          ) : null}
        </View>
        <View style={styles.rightSection}>
          {showRetry && (
            <NeumorphicButton
              onPress={onRetry}
              style={[styles.iconButton, buttonStyle]}
            >
              <RetryIcon color={retryIconColor} size={iconSize} />
            </NeumorphicButton>
          )}
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight + 10,
    paddingBottom: 10,
    // Neumorphic container shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 50,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    elevation: 0,
    // Neumorphic outer shadow (dark)
    shadowColor: '#000000',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Light shadow for neumorphic effect
    backgroundColor: COLORS.background,
  },
  buttonInner: {
    borderRadius: 12,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    // Inner light shadow
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: -2,
      height: -2,
    },
    shadowOpacity: 0.7,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: COLORS.background,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonInnerDisabled: {
    opacity: 0.6,
  },
  iconButton: {
    // Circular icon button
    borderRadius: 22,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  backButtonText: {
    color: COLORS.medium,
  },
  retryButtonText: {
    color: COLORS.primary,
  },
});
export default PageHeader;