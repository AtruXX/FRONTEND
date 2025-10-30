import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNotifications } from '../../Screens/NotificationsContext';
const NotificationBadge = ({
  size = 'medium',
  showZero = false,
  style,
  textStyle,
  backgroundColor = '#FF6B6B'
}) => {
  const { unreadCount } = useNotifications();
  if (!showZero && unreadCount === 0) {
    return null;
  }
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, borderRadius: 8 };
      case 'large':
        return { width: 24, height: 24, borderRadius: 12 };
      default:
        return { width: 20, height: 20, borderRadius: 10 };
    }
  };
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };
  const displayCount = unreadCount > 99 ? '99+' : unreadCount.toString();
  return (
    <View
      style={[
        styles.badge,
        getSize(),
        { backgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          { fontSize: getTextSize() },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {displayCount}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 20,
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});
export default NotificationBadge;