import React, { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import ChatMessage, { Message } from "../components/ChatMessage";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useAuth } from "../context/AuthContext";

type ChatRouteProp = RouteProp<RootStackParamList, "Chat">;

export default function ChatScreen() {
  const route = useRoute<ChatRouteProp>();
  const { bubbleId } = route.params;
  const { supabase, session } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, bubble_id, user_id, content, type, created_at, profiles(username)",
      )
      .eq("bubble_id", bubbleId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Errore caricamento messaggi:", error);
      return;
    }
    setMessages((data ?? []) as unknown as Message[]);
  };

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel("chat:" + bubbleId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `bubble_id=eq.${bubbleId}`,
        },
        () => fetchMessages(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bubbleId]);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const { error } = await supabase.from("messages").insert({
      bubble_id: bubbleId,
      user_id: session?.user.id,
      content: text,
      type: "text",
    });
    if (error) {
      console.error("Invio fallito:", error);
    } else {
      setText("");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessage message={item} />}
        contentContainerStyle={styles.list}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Scrivi un messaggio"
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
        />
        <Pressable style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendText}>Invia</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  list: {
    padding: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#333",
    backgroundColor: "#111",
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#ffe46b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sendText: {
    color: "#111",
    fontWeight: "bold",
  },
});
