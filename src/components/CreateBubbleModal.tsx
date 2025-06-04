import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export type NewBubble = {
  id: string;
  name: string;
  reflectionCount?: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated: (bubble: NewBubble) => void;
};

export default function CreateBubbleModal({
  visible,
  onClose,
  onCreated,
}: Props) {
  const { supabase, session } = useAuth();
  const [name, setName] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from("bubbles")
      .insert({ name, user_id: session?.user.id })
      .select("id, reflectionCount")
      .single();

    if (error) {
      console.error("Errore creazione bolla:", error);
      return;
    }

    if (data) {
      onCreated({
        id: data.id as string,
        name,
        reflectionCount: data.reflectionCount ?? 0,
      });
      setName("");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modal}>
              <Pressable style={styles.close} onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nome bolla"
                placeholderTextColor="#888"
              />
              <Pressable style={styles.button} onPress={handleCreate}>
                <Text style={styles.buttonText}>Crea</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#222",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  close: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
  closeText: {
    color: "#fff",
    fontSize: 18,
  },
  input: {
    width: "100%",
    backgroundColor: "#111",
    color: "#fff",
    borderRadius: 8,
    padding: 10,
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#ffe46b",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#111",
    fontWeight: "bold",
  },
});
