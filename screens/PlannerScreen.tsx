import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Image, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, Question } from "@/context/AppContext";
import { suggestPlannerQuestions } from "@/utils/openai";

export default function PlannerScreen() {
  const { theme } = useTheme();
  const { plannerQuestions, addPlannerQuestion, updatePlannerQuestion, deletePlannerQuestion, visits } =
    useAppContext();
  const [newQuestion, setNewQuestion] = useState("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;

    const question: Question = {
      id: Date.now().toString(),
      text: newQuestion.trim(),
      checked: false,
    };

    addPlannerQuestion(question);
    setNewQuestion("");
  };

  const handleToggle = (id: string, checked: boolean) => {
    updatePlannerQuestion(id, { checked });
  };

  const handleDelete = (id: string) => {
    deletePlannerQuestion(id);
  };

  const handleSuggestQuestions = async () => {
    setIsLoadingSuggestions(true);
    const suggestions = await suggestPlannerQuestions(visits);
    setIsLoadingSuggestions(false);

    suggestions.forEach((text) => {
      const question: Question = {
        id: Date.now().toString() + Math.random(),
        text,
        checked: false,
      };
      addPlannerQuestion(question);
    });
  };

  const commonQuestions = [
    "What does this diagnosis mean for my child's future?",
    "Are there any side effects I should watch for?",
    "What are the treatment options available?",
    "How can I help my child at home?",
    "When should I call if symptoms worsen?",
  ];

  const handleAddCommonQuestion = (text: string) => {
    const question: Question = {
      id: Date.now().toString(),
      text,
      checked: false,
    };
    addPlannerQuestion(question);
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={[styles.inputCard, { backgroundColor: theme.backgroundSecondary }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={newQuestion}
            onChangeText={setNewQuestion}
            placeholder="What do you want to ask?"
            placeholderTextColor={theme.textSecondary}
            multiline
            onSubmitEditing={handleAddQuestion}
          />
          <Button onPress={handleAddQuestion} disabled={!newQuestion.trim()}>
            <Feather name="plus" size={20} color="white" />
          </Button>
        </ThemedView>

        {visits.length > 0 && (
          <Button onPress={handleSuggestQuestions} disabled={isLoadingSuggestions}>
            <Feather name="zap" size={20} color="white" style={{ marginRight: Spacing.sm }} />
            {isLoadingSuggestions ? "Loading..." : "AI Suggest Questions"}
          </Button>
        )}

        {plannerQuestions.length === 0 && (
          <View style={styles.starterSection}>
            <ThemedText style={styles.starterTitle}>Common Questions to Get Started</ThemedText>
            <ThemedText style={[styles.starterDescription, { color: theme.textSecondary }]}>
              Tap any question below to add it to your list:
            </ThemedText>
            {commonQuestions.map((text, index) => (
              <Pressable
                key={index}
                style={[styles.starterCard, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => handleAddCommonQuestion(text)}
              >
                <ThemedText style={styles.starterText}>{text}</ThemedText>
                <Feather name="plus-circle" size={20} color={theme.primary} />
              </Pressable>
            ))}
          </View>
        )}

        {plannerQuestions.length > 0 && (
          <View style={styles.questionsSection}>
            <ThemedText style={styles.sectionTitle}>Questions to Ask</ThemedText>
            {plannerQuestions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </View>
        )}
      </View>
    </ScreenScrollView>
  );
}

function QuestionItem({
  question,
  onToggle,
  onDelete,
}: {
  question: Question;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <ThemedView
      style={[
        styles.questionCard,
        {
          backgroundColor: theme.backgroundSecondary,
          opacity: question.checked ? 0.6 : 1,
        },
      ]}
    >
      <Pressable
        onPress={() => onToggle(question.id, !question.checked)}
        style={styles.questionContent}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: question.checked ? theme.primary : "transparent",
              borderColor: question.checked ? theme.primary : theme.border,
            },
          ]}
        >
          {question.checked && <Feather name="check" size={16} color="white" />}
        </View>
        <ThemedText
          style={[
            styles.questionText,
            question.checked && styles.questionTextChecked,
          ]}
        >
          {question.text}
        </ThemedText>
      </Pressable>
      <Pressable onPress={() => onDelete(question.id)} style={styles.deleteButton}>
        <Feather name="x" size={20} color={theme.textSecondary} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
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
  questionsSection: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  questionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  questionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  questionTextChecked: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  emptyImage: {
    width: 200,
    height: 150,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  starterSection: {
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  starterTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  starterDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  starterCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  starterText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
});
