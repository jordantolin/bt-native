import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { RootStackParamList } from '../navigation/RootNavigator';

export default function AuthScreen() {
  const { supabase } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields');
      return;
    }

    const { data, error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    console.log('Supabase Auth Response:', { data, error });

    if (error) {
      Alert.alert('Auth error', error.message);
      return;
    }

    Alert.alert('Success', isLogin ? 'Logged in!' : 'Signed up!');
    // 🔁 Non resetto, ma lascio che RootNavigator reindirizzi in base a session/profile
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title={isLogin ? 'Login' : 'Sign Up'} onPress={handleAuth} />

      <Text style={styles.switch} onPress={() => setIsLogin((prev) => !prev)}>
        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 28,
    color: '#ffe46b',
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  switch: {
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
  },
});
