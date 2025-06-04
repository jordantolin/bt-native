import React from "react";
import RootNavigator from "./navigation/RootNavigator";
import { AuthProvider } from "./context/AuthContext";
import {
  Provider as PaperProvider,
  MD3DarkTheme as PaperDark,
} from "react-native-paper";

const theme = {
  ...PaperDark,
  colors: {
    ...PaperDark.colors,
    primary: "#ffe46b",
    secondary: "#ffe46b",
    background: "#111",
    surface: "#222",
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}
