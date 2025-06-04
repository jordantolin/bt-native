import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TopBubblesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Top Bubbles Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});
