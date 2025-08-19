// Create a new file: LoadingContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  
  // Create animated values for 3 dots
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  useEffect(() => {
    let dotAnimation;
    
    if (isLoading) {
      // Fade in the overlay
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Animate dots in sequence
      const animateDots = () => {
        dotAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(dot1, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
        dotAnimation.start();
      };
      animateDots();
    } else {
      // Fade out the overlay
      Animated.timing(fadeValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (dotAnimation) {
        dotAnimation.stop();
      }
    };
  }, [isLoading, fadeValue, dot1, dot2, dot3]);

  const getDotStyle = (animatedValue) => ({
    opacity: animatedValue,
    transform: [
      {
        scale: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1.2],
        }),
      },
    ],
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
            <View style={styles.dotsContainer}>
              <Animated.View
                style={[
                  styles.dot,
                  getDotStyle(dot1)
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  getDotStyle(dot2)
                ]}
              />
              <Animated.View
                style={[
                  styles.dot,
                  getDotStyle(dot3)
                ]}
              />
            </View>
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
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginHorizontal: 4,
  },
});