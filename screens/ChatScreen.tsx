import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, FlatList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, Message } from "@/context/AppContext";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { askQuestionAboutVisit } from "@/utils/openai";

export default function ChatScreen() {
  const { theme } = useTheme();
  const { chatMessages, addChatMessage, visits, readingLevel } = useAppContext();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const visitId = route.params?.visitId;
  
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messages = chatMessages[visitId] || [];
  const visit = visits.find((v) => v.id === visitId);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    addChatMessage(visitId, userMessage);
    setInputText("");
    setIsLoading(true);

    const response = await askQuestionAboutVisit(
      userMessage.text,
      visit?.summary || "",
      readingLevel
    );

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      isUser: false,
      timestamp: new Date(),
    };

    addChatMessage(visitId, aiMessage);
    setIsLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messageList,
          { paddingBottom: insets.bottom + 80 },
        ]}
        renderItem={({ item }) => (
          <MessageBubble message={item} isUser={item.isUser} theme={theme} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Ask anything about this visit. The AI will help explain medical terms and answer your questions.
            </ThemedText>
          </View>
        }
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundSecondary,
            paddingBottom: insets.bottom + Spacing.md,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.backgroundDefault,
              color: theme.text,
            },
          ]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about this visit..."
          placeholderTextColor={theme.textSecondary}
          multiline
          maxLength={500}
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() && !isLoading ? theme.primary : theme.backgroundDefault,
            },
          ]}
        >
          <Icon
            name="send"
            size={20}
            color={inputText.trim() && !isLoading ? "white" : theme.textSecondary}
          />
        </Pressable>
      </View>
    </View>
  );
}

function MessageBubble({ message, isUser, theme }: { message: Message; isUser: boolean; theme: any }) {
  return (
    <View style={[styles.messageBubbleContainer, isUser && styles.userMessageContainer]}>
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isUser ? theme.primary : theme.backgroundSecondary,
          },
        ]}
      >
        <ThemedText style={[styles.messageText, { color: isUser ? "white" : theme.text }]}>
          {message.text}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing["3xl"],
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  messageBubbleContainer: {
    maxWidth: "80%",
    alignSelf: "flex-start",
  },
  userMessageContainer: {
    alignSelf: "flex-end",
  },
  messageBubble: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
