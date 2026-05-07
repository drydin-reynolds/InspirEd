import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/Icon";
import { MarkdownText } from "@/components/MarkdownText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, Message } from "@/context/AppContext";
import { useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { askQuestionWithGemini } from "@/utils/gemini";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useReanimatedKeyboardAnimation } from "react-native-keyboard-controller";

const TAB_BAR_HEIGHT = 80;

const CHAT_INPUT_LINE_HEIGHT = 20;
const CHAT_INPUT_MAX_LINES = 9;
const CHAT_INPUT_PAD_V = Spacing.xs * 2;
const CHAT_INPUT_MIN_HEIGHT = CHAT_INPUT_LINE_HEIGHT + CHAT_INPUT_PAD_V;
const CHAT_INPUT_MAX_HEIGHT =
  CHAT_INPUT_LINE_HEIGHT * CHAT_INPUT_MAX_LINES + CHAT_INPUT_PAD_V;

export default function ChatScreen() {
  const { theme } = useTheme();
  const { chatMessages, addChatMessage, visits, readingLevel } = useAppContext();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const visitId = route.params?.visitId;
  const flatListRef = useRef<FlatList>(null);
  
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [composerInputHeight, setComposerInputHeight] = useState(
    CHAT_INPUT_MIN_HEIGHT,
  );
  const prevComposerLengthRef = useRef(0);

  const handleComposerTextChange = useCallback((text: string) => {
    setInputText(text);
    if (text.length === 0) {
      setComposerInputHeight(CHAT_INPUT_MIN_HEIGHT);
      prevComposerLengthRef.current = 0;
      return;
    }
    if (prevComposerLengthRef.current > text.length) {
      setComposerInputHeight(CHAT_INPUT_MIN_HEIGHT);
    }
    prevComposerLengthRef.current = text.length;
  }, []);

  const messages = chatMessages[visitId] || [];
  const visit = visits.find((v) => v.id === visitId);
  
  const { height: keyboardHeight } = useReanimatedKeyboardAnimation();
  
  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: keyboardHeight.value }],
    };
  });
  
  const animatedListStyle = useAnimatedStyle(() => {
    return {
      paddingBottom: -keyboardHeight.value + TAB_BAR_HEIGHT + 70 + Spacing.lg,
    };
  });

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
    setComposerInputHeight(CHAT_INPUT_MIN_HEIGHT);
    prevComposerLengthRef.current = 0;
    setIsLoading(true);

    const response = await askQuestionWithGemini(
      userMessage.text,
      {
        summary: visit?.summary,
        transcription: visit?.transcription,
        keyPoints: visit?.keyPoints,
        diagnoses: visit?.diagnoses,
        actions: visit?.actions,
        medicalTerms: visit?.medicalTerms,
      },
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

  const inputAreaHeight = 70 + TAB_BAR_HEIGHT;
  const composerGrowExtra = Math.max(
    0,
    composerInputHeight - CHAT_INPUT_MIN_HEIGHT,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messageList,
          { 
            paddingTop: headerHeight + Spacing.md,
            paddingBottom:
              inputAreaHeight + composerGrowExtra + Spacing.lg,
            flexGrow: 1,
          },
        ]}
        style={animatedListStyle}
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
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
      />

      <Animated.View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundSecondary,
            bottom: 0,
            paddingBottom: TAB_BAR_HEIGHT + Spacing.md,
            borderTopColor: theme.border,
          },
          animatedInputStyle,
        ]}
      >
        <View style={styles.inputFieldGrow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                minHeight: composerInputHeight,
                maxHeight: CHAT_INPUT_MAX_HEIGHT,
              },
              Platform.OS === "android" ? { includeFontPadding: false } : null,
            ]}
            value={inputText}
            onChangeText={handleComposerTextChange}
            placeholder="Ask about this visit..."
            placeholderTextColor={theme.textSecondary}
            multiline
            maxLength={500}
            textAlignVertical="top"
            blurOnSubmit={false}
            underlineColorAndroid="transparent"
            {...(Platform.OS === "ios"
              ? ({ submitBehavior: "newline" } as const)
              : {})}
            scrollEnabled={
              composerInputHeight >= CHAT_INPUT_MAX_HEIGHT - 2
            }
            onContentSizeChange={(e) => {
              const h = e.nativeEvent.contentSize.height;
              if (!Number.isFinite(h)) return;
              if (h > CHAT_INPUT_MAX_HEIGHT + 24) return;
              const clamped = Math.min(
                Math.max(Math.ceil(h), CHAT_INPUT_MIN_HEIGHT),
                CHAT_INPUT_MAX_HEIGHT,
              );
              setComposerInputHeight(clamped);
            }}
          />
        </View>
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
      </Animated.View>
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
        {isUser ? (
          <ThemedText style={[styles.messageText, { color: "white" }]}>
            {message.text}
          </ThemedText>
        ) : (
          <MarkdownText style={styles.messageText} color={theme.text}>
            {message.text}
          </MarkdownText>
        )}
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
    alignItems: "flex-end",
    padding: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: 1,
  },
  inputFieldGrow: {
    flex: 1,
    minWidth: 0,
  },
  input: {
    width: "100%",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    lineHeight: CHAT_INPUT_LINE_HEIGHT,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
});
