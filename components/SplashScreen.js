import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const SplashScreen = () => {
  useEffect(() => {
    // Simulate splash screen duration (optional)
    setTimeout(() => {
      // Navigate to the Home screen after the splash screen duration
      // Replace 'Home' with the screen you want to navigate to
    }, 4000); // Adjust the time as needed for your desired splash screen duration
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
});

export default SplashScreen;