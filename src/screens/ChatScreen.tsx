import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator';

type ChatRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const { bubbleId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat della Bolla</Text>
      <Text style={styles.subtitle}>bubbleId: {bubbleId}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffe46b',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
  },
});
