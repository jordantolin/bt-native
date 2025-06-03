import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function UsernameSetupScreen({ navigation }: any) {
  const { supabase, session } = useAuth();
  const [username, setUsername] = useState('');

  const handleSave = async () => {
    if (!username) return;

    const { error } = await supabase.from('profiles').upsert({
      id: session?.user.id,
      username,
    });

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    // Navigazione aggiornata
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your username</Text>
      <TextInput
        placeholder="username"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholderTextColor="#888"
      />
      <Button title="Continue" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', justifyContent: 'center', padding: 32 },
  title: { fontSize: 24, color: '#ffe46b', textAlign: 'center', marginBottom: 20 },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
});
