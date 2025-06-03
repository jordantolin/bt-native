import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Bubble Trouble Native 👾</Text>

      <View style={styles.buttonWrapper}>
        <Button
          title="Apri le Bolle"
          onPress={() => navigation.navigate('Bubbles')}
          color="#ffe46b"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#ffe46b',
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: 200,
  },
});
