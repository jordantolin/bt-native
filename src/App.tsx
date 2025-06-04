import React from 'react';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import RootNavigator from './navigation/RootNavigator';
import { AuthProvider } from './context/AuthContext';

const theme = {
  ...MD3DarkTheme,
  roundness: 24,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#ffe46b',
    background: '#111111',
    surface: '#222222',
  },
};

export default function App() {
  return (
    <AuthProvider>
      <PaperProvider theme={theme}>
        <RootNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
