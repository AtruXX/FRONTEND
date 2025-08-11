import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import COLORS from '../../utils/COLORS.js';

const LoadingSpinner = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.text}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  content: {
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    color: COLORS.medium,
    fontSize: 18,
  },
});

export default LoadingSpinner;