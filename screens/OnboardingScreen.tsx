import React, { useState } from "react";
import { StyleSheet, View, TextInput, Platform } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { analyzeReadingLevel } from "@/utils/textAnalysis";

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { setReadingLevel, completeOnboarding } = useAppContext();
  const [userInput, setUserInput] = useState("");
  const [step, setStep] = useState(0);
  const [allResponses, setAllResponses] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const questions = [
    {
      title: "Welcome to InspirEd!",
      prompt:
        "We'd love to get to know you better. Tell us a bit about yourself and your child. What brings you to InspirEd?",
      placeholder: "Share your story here...",
      minWords: 15,
    },
    {
      title: "Your Questions",
      prompt:
        "What are your main questions or concerns about your child's health? What would you like to understand better?",
      placeholder: "Your questions and concerns...",
      minWords: 10,
    },
  ];

  const currentQuestion = questions[step];

  const handleContinue = async () => {
    if (isCompleting) return;
    
    const updatedResponses = [...allResponses, userInput];
    setAllResponses(updatedResponses);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
      setUserInput("");
    } else {
      setIsCompleting(true);
      try {
        const combinedText = updatedResponses.join(" ");
        const analysis = analyzeReadingLevel(combinedText);

        await setReadingLevel(analysis.grade);
        await completeOnboarding();
      } catch (error) {
        console.error("Error completing onboarding:", error);
        setIsCompleting(false);
      }
    }
  };

  const wordCount = userInput.trim().split(/\s+/).filter((w) => w.length > 0).length;
  const canContinue = wordCount >= currentQuestion.minWords;

  const scrollViewProps = {
    style: { flex: 1, backgroundColor: theme.backgroundRoot },
    contentContainerStyle: [
      styles.container,
      {
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
      },
    ],
    keyboardShouldPersistTaps: "handled" as const,
  };

  const ScrollComponent = Platform.OS === "web" ? require("react-native").ScrollView : KeyboardAwareScrollView;

  return (
    <ScrollComponent {...scrollViewProps}>
      <View style={styles.header}>
          <ThemedText style={styles.title}>{currentQuestion.title}</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.primary }]}>
            Learn to Empower. Empower to Hope.
          </ThemedText>
        </View>

        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={styles.prompt}>{currentQuestion.prompt}</ThemedText>

          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: "#FFFFFF",
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={userInput}
            onChangeText={setUserInput}
            placeholder={currentQuestion.placeholder}
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <View style={styles.footer}>
            <ThemedText style={[styles.wordCount, { color: canContinue ? theme.primary : theme.textSecondary }]}>
              {wordCount} words (minimum {currentQuestion.minWords})
            </ThemedText>
          </View>
        </ThemedView>

        <View style={styles.buttonContainer}>
          <Button onPress={handleContinue} disabled={!canContinue}>
            {step < questions.length - 1 ? "Continue" : "Get Started"}
          </Button>
        </View>

        <View style={styles.progressContainer}>
          {questions.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index <= step ? theme.primary : theme.border,
                },
              ]}
            />
          ))}
        </View>
    </ScrollComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  prompt: {
    fontSize: 16,
    lineHeight: 24,
  },
  textInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 150,
  },
  footer: {
    alignItems: "flex-end",
  },
  wordCount: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
