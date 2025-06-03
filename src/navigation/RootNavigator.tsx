import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';

import AuthScreen from '../screens/AuthScreen';
import UsernameSetupScreen from '../screens/UsernameSetupScreen';
import HomeScreen from '../screens/HomeScreen';
import BubblesScreen from '../screens/BubblesScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Auth: undefined;
  UsernameSetup: undefined;
  Home: undefined;
  Bubbles: undefined;
  Chat: { bubbleId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { session, supabase } = useAuth();
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Errore nel recupero profilo:', error);
          setProfileExists(false);
        } else {
          setProfileExists(!!data);
        }
      }
      setLoading(false);
    };

    checkProfile();
  }, [session]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>Caricamento...</Text>
      </View>
    );
  }

  return (
<NavigationContainer>
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {(() => {
      if (!session) {
        return <Stack.Screen name="Auth" component={AuthScreen} />;
      }

      if (session && profileExists === false) {
        return <Stack.Screen name="UsernameSetup" component={UsernameSetupScreen} />;
      }

      if (session && profileExists === true) {
        return (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Bubbles" component={BubblesScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
          </>
        );
      }

      // fallback
      return <Stack.Screen name="Auth" component={AuthScreen} />;
    })()}
  </Stack.Navigator>
</NavigationContainer>


  );
}
