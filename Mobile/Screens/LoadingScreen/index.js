import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

const LoadingScreen = ({ timeout = 10000, onTimeout }) => {
  const [progress, setProgress] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeout / 1000);
  
  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + timeout;
    
    // Update progress every 100ms
    const progressInterval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / timeout) * 100, 100);
      setProgress(newProgress);
      
      // Calculate time left in seconds
      const secondsLeft = Math.max(Math.ceil((endTime - now) / 1000), 0);
      setTimeLeft(secondsLeft);
      
      if (elapsed >= timeout) {
        clearInterval(progressInterval);
        setIsTimedOut(true);
        if (onTimeout) onTimeout(false); // Simulate negative result
      }
    }, 100);
    
    return () => clearInterval(progressInterval);
  }, [timeout, onTimeout]);
  
  return (
    <View style={styles.container}>
      <View style={styles.loadingCard}>
        <Text style={styles.title}>Se încarcă...</Text>
        
        {!isTimedOut ? (
          <>
            <ActivityIndicator size="large" color="#3B82F6" style={styles.spinner} />
            <Text style={styles.timeText}>{timeLeft} secunde rămase</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
          </>
        ) : (
          <Text style={styles.errorMessage}>Continue indisponibil.</Text>
        )}
      </View>
    </View>
  );
};



export default LoadingScreen;