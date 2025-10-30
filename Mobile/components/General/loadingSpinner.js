// Create a new file: LoadingContext.js
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
const LoadingContext = createContext();
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};
export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const fadeValue = useRef(new Animated.Value(0)).current;
  // Create animated value for circular rotation
  const spinValue = useRef(new Animated.Value(0)).current;
  const showLoading = useCallback(() => setIsLoading(true), []);
  const hideLoading = useCallback(() => setIsLoading(false), []);
  useEffect(() => {
    let spinAnimation;
    if (isLoading) {
      // Fade in the overlay
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      // Continuous circular rotation
      spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
    } else {
      // Fade out the overlay
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      if (spinAnimation) {
        spinAnimation.stop();
      }
    };
  }, [isLoading, fadeValue, spinValue]);
  // Convert the animated value to a rotation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      {isLoading && (
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: fadeValue,
            }
          ]}
        >
          <View style={styles.content}>
            <Text style={styles.loadingText}>O secunda..</Text>
            <Animated.View
              style={[
                styles.spinner,
                {
                  transform: [{ rotate: spin }]
                }
              ]}
            >
              <View style={styles.spinnerInner} />
            </Animated.View>
          </View>
        </Animated.View>
      )}
    </LoadingContext.Provider>
  );
};
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    padding: 30,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  loadingText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'rgba(90, 91, 222, 0.3)',
    borderTopColor: '#5A5BDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});