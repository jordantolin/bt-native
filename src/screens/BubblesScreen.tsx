import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../context/AuthContext";
import Bubble, { BubbleData } from "../components/Bubble";
import CreateBubbleModal, { NewBubble } from "../components/CreateBubbleModal";

const { width, height } = Dimensions.get("window");
const CENTER_X = width / 2;
const CENTER_Y = height / 2;
const BASE_ORBIT = 60;
const ORBIT_STEP = 50;

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Bubbles">;

export default function BubblesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { supabase } = useAuth();
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [showModal, setShowModal] = useState(false);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(""));
  };

  useEffect(() => {
    const loadBubbles = async () => {
      const { data, error } = await supabase.from("bubbles").select("id, name");
      if (error) {
        console.error("Errore caricamento bolle:", error);
        return;
      }
      const withOrbit = (data ?? []).map((item, idx) => ({
        id: item.id as string,
        label: (item as any).name ?? (item as any).label ?? item.id,
        reflectionCount: 0,
        orbitRadius: BASE_ORBIT + idx * ORBIT_STEP,
      }));
      setBubbles(withOrbit);
    };

    loadBubbles();

    const channel = supabase
      .channel("bubbles")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bubbles" },
        (payload) => {
          const item: any = payload.new;
          setBubbles((prev) => [
            ...prev,
            {
              id: item.id as string,
              label: item.label ?? item.name ?? item.id,
              reflectionCount: 0,
              orbitRadius: BASE_ORBIT + prev.length * ORBIT_STEP,
            },
          ]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <View style={styles.container}>
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          data={bubble}
          centerX={CENTER_X}
          centerY={CENTER_Y}
          onPress={(id) => navigation.navigate("Chat", { bubbleId: id })}
        />
      ))}

      <Pressable style={styles.addButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addText}>+</Text>
      </Pressable>

      <CreateBubbleModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(b: NewBubble) => {
          setBubbles((prev) => [
            ...prev,
            {
              id: b.id,
              label: b.name,
              reflectionCount: b.reflectionCount ?? 0,
              orbitRadius: BASE_ORBIT + prev.length * ORBIT_STEP,
            },
          ]);
          showToast("Bolla creata!");
        }}
      />

      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.toastText}>{toast}</Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111111",
  },
  addButton: {
    position: "absolute",
    bottom: 40,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ffe46b",
    alignItems: "center",
    justifyContent: "center",
  },
  addText: {
    color: "#111",
    fontSize: 32,
    lineHeight: 32,
  },
  toast: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  toastText: {
    backgroundColor: "#333",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
