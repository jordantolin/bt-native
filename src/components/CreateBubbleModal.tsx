import React, { useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  IconButton,
  Menu,
} from "react-native-paper";
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
  const [topic, setTopic] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !topic) return;
    const { data, error } = await supabase
      .from("bubbles")
      .insert({
        name,
        topic,
        description,
        user_id: session?.user.id,
      })
      .select("id")
      .single();
    if (error) {
      console.error("Errore creazione bolla:", error);
      return;
    }
    if (data) {
      onCreated({ id: data.id as string, name });
      setName("");
      setTopic(null);
      setDescription("");
      onClose();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modal}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View>
            <IconButton icon="close" onPress={onClose} style={styles.close} />
            <Text style={styles.title}>+ Create New Bubble</Text>
            <Text style={styles.subtitle}>
              Create a new bubble that will last for 24 hours. Invite others to
              join your conversation!
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Enter bubble name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TextInput
                  mode="outlined"
                  placeholder="Select a topic"
                  value={topic ?? ""}
                  onFocus={() => setMenuVisible(true)}
                  style={styles.input}
                  right={<TextInput.Icon icon="menu-down" />}
                />
              }
            >
              {TOPICS.map((t) => (
                <Menu.Item
                  key={t}
                  onPress={() => {
                    setTopic(t);
                    setMenuVisible(false);
                  }}
                  title={t}
                />
              ))}
            </Menu>
            <TextInput
              mode="outlined"
              placeholder="What would you like to discuss in this bubble?"
              multiline
              value={description}
              onChangeText={setDescription}
              style={[styles.input, styles.desc]}
            />
            <Button
              mode="contained"
              style={styles.button}
              textColor="#111"
              onPress={handleCreate}
            >
              Create Bubble
            </Button>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    margin: 20,
    backgroundColor: "#121212",
    padding: 24,
    borderRadius: 12,
  },
  close: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  title: {
    color: "#ffe46b",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 16,
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    marginVertical: 8,
  },
  input: {
    marginBottom: 12,
  },
  desc: {
    minHeight: 80,
  },
  button: {
    backgroundColor: "#ffe46b",
    alignSelf: "center",
    marginTop: 8,
  },
});
