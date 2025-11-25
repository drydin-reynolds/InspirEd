import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, LearningModule, Message } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EducationScreen() {
  const { theme } = useTheme();
  const { learningModules, educationChatMessages, addEducationChatMessage, readingLevel } =
    useAppContext();
  const navigation = useNavigation<any>();

  const [showChat, setShowChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const completedCount = learningModules.filter((m) => m.completed).length;
  const totalCount = learningModules.length;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

  const categories = Array.from(new Set(learningModules.map((m) => m.category)));

  const handleAskQuestion = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    addEducationChatMessage(userMessage);
    setInputText("");
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Based on trusted medical sources, this is a great question. Remember to always consult with your doctor about specific medical concerns. I can help explain concepts at your selected reading level.",
      isUser: false,
      timestamp: new Date(),
    };

    addEducationChatMessage(aiMessage);
    setIsLoading(false);
  };

  if (showChat) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <Pressable onPress={() => setShowChat(false)} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.primary} />
            <ThemedText style={{ color: theme.primary, fontSize: 16, fontWeight: "600" }}>
              Back to Learning
            </ThemedText>
          </Pressable>

          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="chat" size={24} color={theme.accent} />
              <ThemedText style={styles.cardTitle}>AI Learning Assistant</ThemedText>
            </View>
            <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}>
              Ask questions about pulmonary health, treatments, or any medical term you'd like
              explained.
            </ThemedText>
          </ThemedView>

          <View style={styles.chatMessages}>
            {educationChatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.messageBubble, msg.isUser && styles.userMessage]}
              >
                <View
                  style={[
                    styles.messageContent,
                    {
                      backgroundColor: msg.isUser ? theme.primary : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <ThemedText style={{ color: msg.isUser ? "white" : theme.text }}>
                    {msg.text}
                  </ThemedText>
                </View>
              </View>
            ))}
            {isLoading && (
              <View style={styles.messageBubble}>
                <View style={[styles.messageContent, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText style={{ color: theme.textSecondary }}>Thinking...</ThemedText>
                </View>
              </View>
            )}
          </View>

          <ThemedView style={[styles.inputCard, { backgroundColor: theme.backgroundSecondary }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question..."
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={500}
            />
            <Button onPress={handleAskQuestion} disabled={!inputText.trim() || isLoading}>
              <MaterialIcons name="send" size={20} color="white" />
            </Button>
          </ThemedView>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView
          style={[
            styles.progressCard,
            {
              backgroundColor: theme.primary,
            },
          ]}
        >
          <ThemedText style={styles.progressTitle}>Your Learning Progress</ThemedText>
          <View style={styles.progressStats}>
            <ThemedText style={styles.progressNumber}>{completedCount}</ThemedText>
            <ThemedText style={styles.progressLabel}>/ {totalCount} modules completed</ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: "rgba(255,255,255,0.3)" }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.accent,
                  width: `${overallProgress}%`,
                },
              ]}
            />
          </View>
        </ThemedView>

        <Button
          onPress={() => setShowChat(true)}
          style={{ backgroundColor: theme.accent }}
        >
          <MaterialIcons name="chat" size={20} color="white" style={{ marginRight: Spacing.sm }} />
          Ask AI Learning Assistant
        </Button>

        {categories.map((category) => {
          const categoryModules = learningModules.filter((m) => m.category === category);
          return (
            <View key={category} style={styles.categorySection}>
              <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
              {categoryModules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onPress={() => navigation.navigate("ModuleDetail", { moduleId: module.id })}
                />
              ))}
            </View>
          );
        })}
      </View>
    </ScreenScrollView>
  );
}

function ModuleCard({ module, onPress }: { module: LearningModule; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Beginner") return theme.success;
    if (difficulty === "Intermediate") return theme.warning;
    return theme.error;
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={[
        animatedStyle,
        styles.moduleCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.moduleHeader}>
        <View style={styles.moduleHeaderLeft}>
          <ThemedText style={styles.moduleTitle}>{module.title}</ThemedText>
          <ThemedText style={[styles.moduleDescription, { color: theme.textSecondary }]}>
            {module.description}
          </ThemedText>
        </View>
        {module.completed && (
          <View style={[styles.completedBadge, { backgroundColor: theme.success }]}>
            <MaterialIcons name="check" size={16} color="white" />
          </View>
        )}
      </View>

      <View style={styles.moduleFooter}>
        <View style={styles.moduleMetadata}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(module.difficulty) + "20" }]}>
            <ThemedText
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(module.difficulty) },
              ]}
            >
              {module.difficulty}
            </ThemedText>
          </View>
          <View style={styles.durationContainer}>
            <MaterialIcons name="schedule" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.durationText, { color: theme.textSecondary }]}>
              {module.duration}
            </ThemedText>
          </View>
        </View>
        {module.progress > 0 && !module.completed && (
          <View style={styles.progressContainer}>
            <View style={[styles.miniProgressBar, { backgroundColor: theme.backgroundDefault }]}>
              <View
                style={[
                  styles.miniProgressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${module.progress}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
              {module.progress}%
            </ThemedText>
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  progressCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "white",
  },
  progressLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  categorySection: {
    gap: Spacing.md,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  moduleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  moduleHeaderLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleFooter: {
    gap: Spacing.sm,
  },
  moduleMetadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  durationText: {
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  miniProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    width: 35,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  chatMessages: {
    gap: Spacing.md,
  },
  messageBubble: {
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  messageContent: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  inputCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 40,
    maxHeight: 100,
  },
});
