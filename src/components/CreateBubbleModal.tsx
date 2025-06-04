import React, { useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import {
  Modal,
  Portal,
  TextInput,
  Button,
  Menu,
  IconButton,
} from "react-native-paper";
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
  const [topic, setTopic] = useState("Filosofia");
  const [desc, setDesc] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    const { data, error } = await supabase
      .from("bubbles")
      .insert({
        name,
        topic,
        description: desc,
        user_id: session?.user.id,
      })
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
      setDesc("");
      setTopic("Filosofia");
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
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setMenuVisible(true)}
                  style={styles.dropdown}
                  textColor="#ffe46b"
                >
                  {topic}
                </Button>
              }
            >
              {[
                "Filosofia",
                "Spiritualità",
                "Tecnologia",
                "Arte",
                "Musica",
                "Scienza",
                "Altro",
              ].map((t) => (
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
              label="Nome bolla"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Descrizione"
              value={desc}
              onChangeText={setDesc}
              multiline
              style={styles.input}
            />
            <Button
              mode="contained"
              onPress={handleCreate}
              style={styles.button}
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
  dropdown: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#ffe46b",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
});
