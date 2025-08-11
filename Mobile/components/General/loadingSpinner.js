// Create a new file: LoadingContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import COLORS from '../../utils/COLORS.js';

const LoadingContext = createContext();

const loadingMessages = [
  "Just a moment...",
  "Almost there!",
  "Loading magic ✨",
  "Getting things ready...",
  "Hold tight!",
  "Working on it...",
];

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  useEffect(() => {
    let spinAnimation;
    let messageInterval;
    
    if (isLoading) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleValue, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous spin animation
      const spin = () => {
        spinValue.setValue(0);
        spinAnimation = Animated.timing(spinValue, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        });
        spinAnimation.start(() => {
          if (isLoading) {
            spin();
          }
        });
      };
      spin();

      // Pulsing animation for the spinner
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isLoading) {
            pulse();
          }
        });
      };
      pulse();

      // Change loading message every 2 seconds
      messageInterval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 2000);
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    return () => {
      if (spinAnimation) {
        spinAnimation.stop();
      }
      if (messageInterval) {
        clearInterval(messageInterval);
      }
    };
  }, [isLoading, spinValue, fadeValue, scaleValue, pulseValue]);

  const spinAnimation = spinValue.interpolate({
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
          <Animated.View 
            style={[
              styles.content,
              {
                transform: [{ scale: scaleValue }],
              }
            ]}
          >
            <View style={styles.spinnerContainer}>
              <Animated.View
                style={[
                  styles.spinner,
                  {
                    transform: [
                      { rotate: spinAnimation },
                      { scale: pulseValue },
                    ],
                  },
                ]}
              />
              <View style={styles.spinnerGlow} />
            </View>
            <Text style={styles.loadingText}>
              {loadingMessages[messageIndex]}
            </Text>
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      opacity: fadeValue,
                    }
                  ]}
                />
              ))}
            </View>
          </Animated.View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  spinnerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#6366f1', // indigo-500
    borderRightColor: '#8b5cf6', // violet-500
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  spinnerGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    zIndex: -1,
  },
  loadingText: {
    color: '#374151', // gray-700
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9ca3af', // gray-400
    marginHorizontal: 3,
  },
});