import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../context/AuthContext";

export type NewBubble = {
  id: string;
  name: string;
  reflectionCount?: number;
};

const TOPICS = [
  "Filosofia",
  "Spiritualità",
  "Tecnologia",
  "Arte",
  "Musica",
  "Scienza",
  "Altro",
];

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
  const [topic, setTopic] = useState(TOPICS[0]);
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from("bubbles")
      .insert({ name, topic, description, user_id: session?.user.id })
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
        reflectionCount: (data as any).reflectionCount ?? 0,
      });
      setName("");
      setTopic(TOPICS[0]);
      setDescription("");
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
              <Text style={styles.title}>+ Create New Bubble</Text>
              <Text style={styles.subtitle}>
                Create a new bubble that will last for 24 hours. Invite others
                to join your conversation!
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter bubble name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
              />
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={topic}
                  onValueChange={(val) => setTopic(val)}
                  dropdownIconColor="#ffe46b"
                  style={styles.picker}
                >
                  {TOPICS.map((t) => (
                    <Picker.Item label={t} value={t} key={t} />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={[styles.input, styles.desc]}
                placeholder="What would you like to discuss in this bubble?"
                placeholderTextColor="#888"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={handleCreate}>
                <Text style={styles.buttonText}>Create Bubble</Text>
              </TouchableOpacity>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  closeText: {
    fontSize: 22,
    color: "#ccc",
  },
  title: {
    color: "#ffe46b",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#ccc",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    backgroundColor: "#222",
    color: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  desc: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerWrapper: {
    backgroundColor: "#222",
    borderRadius: 8,
    marginBottom: 12,
  },
  picker: {
    color: "#f5f5f5",
    height: 40,
    width: "100%",
  },
  button: {
    backgroundColor: "#ffe46b",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#111",
    fontWeight: "bold",
  },
});
