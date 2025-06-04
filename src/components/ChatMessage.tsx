import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

export type Message = {
  id: string;
  bubble_id: string;
  user_id: string;
  content: string;
  type: string;
  created_at: string;
  profiles?: { username: string | null } | null;
};

type Props = {
  message: Message;
};

export default function ChatMessage({ message }: Props) {
  const { session } = useAuth();
  const isOwn = session?.user.id === message.user_id;

  const renderContent = () => {
    switch (message.type) {
      case "text":
        return <Text style={styles.text}>{message.content}</Text>;
      case "voice":
        return <Text style={styles.placeholder}>[Voice message]</Text>;
      case "gif":
      case "image":
        return <Text style={styles.placeholder}>[Image]</Text>;
      default:
        return <Text style={styles.text}>{message.content}</Text>;
    }
  };

  return (
    <View style={[styles.row, isOwn ? styles.rowOwn : styles.rowOther]}>
      {!isOwn && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {message.profiles?.username?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
      )}
      <View
        style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}
      >
        {!isOwn && (
          <Text style={styles.username}>
            {message.profiles?.username ?? "Anon"}
          </Text>
        )}
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  rowOwn: {
    justifyContent: "flex-end",
  },
  rowOther: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#444",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleOwn: {
    backgroundColor: "#ffe46b",
    borderTopRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: "#222",
    borderTopLeftRadius: 0,
  },
  username: {
    fontSize: 12,
    color: "#ccc",
    marginBottom: 2,
  },
  text: {
    color: "#fff",
  },
  placeholder: {
    color: "#bbb",
    fontStyle: "italic",
  },
});
