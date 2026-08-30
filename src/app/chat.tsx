import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Field, Screen } from "@/components/ui";
import { COLORS } from "@/constants/store";
import { useStore } from "@/context/store-context";
import { api } from "@/lib/api";

type Message = { role: "user" | "model"; text: string };
export default function ChatScreen() {
  const { locale } = useStore();
  const en = locale === "en";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: en
        ? "Hi! I’m GESA. Ask me about products, routines, orders, or Morgen Geschäft."
        : "Hai! Aku GESA. Tanyakan produk, rutinitas, pesanan, atau Morgen Geschäft.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const send = async () => {
    const message = input.trim();
    if (!message || loading) return;
    const history = messages.slice(-10);
    setMessages([...messages, { role: "user", text: message }]);
    setInput("");
    setLoading(true);
    try {
      const result = await api<{ reply: string }>("/api/chat", {
        method: "POST",
        timeoutMs: 35000,
        body: JSON.stringify({ message, history, locale }),
      });
      setMessages((current) => [
        ...current,
        { role: "model", text: result.reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        { role: "model", text: (error as Error).message },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Screen>
      <View style={styles.notice}>
        <Ionicons name="sparkles" size={18} color={COLORS.orange} />
        <Text style={styles.noticeText}>
          {en
            ? "GESA can help with store information, but does not replace professional medical advice."
            : "GESA membantu informasi toko, tetapi bukan pengganti saran medis profesional."}
        </Text>
      </View>
      {messages.map((message, index) => (
        <View
          key={index}
          style={[
            styles.bubble,
            message.role === "user" ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.message,
              message.role === "user" && styles.userMessage,
            ]}
          >
            {message.text}
          </Text>
        </View>
      ))}
      {loading ? (
        <Text style={styles.typing}>
          {en ? "GESA is typing…" : "GESA sedang mengetik…"}
        </Text>
      ) : null}
      <View style={styles.composer}>
        <View style={styles.input}>
          <Field
            value={input}
            onChangeText={setInput}
            placeholder={en ? "Write a message…" : "Tulis pesan…"}
            multiline
          />
        </View>
        <Pressable
          style={[styles.send, (!input.trim() || loading) && styles.disabled]}
          disabled={!input.trim() || loading}
          onPress={() => void send()}
        >
          <Ionicons name="send" size={21} color={COLORS.paper} />
        </Pressable>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  notice: {
    flexDirection: "row",
    gap: 9,
    backgroundColor: COLORS.orangeSoft,
    borderRadius: 16,
    padding: 13,
  },
  noticeText: { flex: 1, color: COLORS.muted, fontSize: 11, lineHeight: 16 },
  bubble: {
    maxWidth: "84%",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 18,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.line,
    borderBottomLeftRadius: 5,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.navy,
    borderBottomRightRadius: 5,
  },
  message: { color: COLORS.ink, lineHeight: 21 },
  userMessage: { color: COLORS.paper },
  typing: { color: COLORS.muted, fontSize: 12, fontStyle: "italic" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 9 },
  input: { flex: 1 },
  send: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.orange,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,
  },
  disabled: { opacity: 0.45 },
});
