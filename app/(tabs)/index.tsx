import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Message, getDailyVerse, sendMessage } from "@/lib/gemini";

function WelcomeBubble({ colors }: { colors: ReturnType<typeof useColors> }) {
  const daily = getDailyVerse();
  return (
    <View style={[styles.welcomeContainer, { backgroundColor: colors.card }]}>
      <LinearGradient
        colors={[colors.purple, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeGradient}
      >
        <Text style={styles.welcomeIcon}>✝</Text>
      </LinearGradient>
      <View style={{ flex: 1 }}>
        <Text style={[styles.welcomeTitle, { color: colors.foreground }]}>
          مرحباً، أنا لارا ✝
        </Text>
        <Text style={[styles.verseText, { color: colors.mutedForeground }]}>
          "{daily.verse}"
        </Text>
        <Text style={[styles.verseRef, { color: colors.accent }]}>{daily.ref}</Text>
      </View>
    </View>
  );
}

function MessageBubble({
  message,
  colors,
}: {
  message: Message;
  colors: ReturnType<typeof useColors>;
}) {
  const isUser = message.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser && styles.bubbleRowUser]}>
      {!isUser && (
        <LinearGradient
          colors={[colors.purple, colors.lightPurple]}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>✝</Text>
        </LinearGradient>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.purple }
            : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? "#fff" : colors.foreground },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const TAB_BAR_HEIGHT = 84;
  const topPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad =
    Platform.OS === "web" ? 34 + TAB_BAR_HEIGHT : insets.bottom + TAB_BAR_HEIGHT;

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setLoading(true);
    inputRef.current?.focus();

    try {
      const reply = await sendMessage(text, messages);
      const assistantMsg: Message = {
        id: Date.now().toString() + "a",
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };
      setMessages([...currentMessages, assistantMsg]);
    } catch {
      const errMsg: Message = {
        id: Date.now().toString() + "e",
        role: "assistant",
        content: "حدث خطأ. يرجى التحقق من اتصال الإنترنت والمحاولة مجدداً.",
        timestamp: new Date(),
      };
      setMessages([...currentMessages, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const allItems = messages.length === 0 ? ["welcome"] : [...messages].reverse();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <FlatList
        data={allItems as (Message | "welcome")[]}
        keyExtractor={(item) =>
          typeof item === "string" ? item : item.id
        }
        inverted={messages.length > 0}
        renderItem={({ item }) =>
          typeof item === "string" ? (
            <WelcomeBubble colors={colors} />
          ) : (
            <MessageBubble message={item as Message} colors={colors} />
          )
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: topPad + 12, paddingBottom: 8 },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          loading ? (
            <View style={[styles.typingRow]}>
              <LinearGradient
                colors={[colors.purple, colors.lightPurple]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>✝</Text>
              </LinearGradient>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
              >
                <ActivityIndicator size="small" color={colors.purple} />
              </View>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomPad + 8,
          },
        ]}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.foreground,
            },
          ]}
          placeholder="اسأل عن الكتاب المقدس أو الإيمان..."
          placeholderTextColor={colors.mutedForeground}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          textAlignVertical="center"
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || loading}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor:
                !input.trim() || loading ? colors.muted : colors.purple,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16 },
  welcomeContainer: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  welcomeGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeIcon: { fontSize: 22, color: "#fff" },
  welcomeTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
  },
  verseText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 20,
    marginBottom: 4,
  },
  verseRef: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  bubbleRowUser: { flexDirection: "row-reverse" },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, color: "#fff" },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  typingRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 110,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
});
