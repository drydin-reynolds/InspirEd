import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useRoute, useNavigation } from "@react-navigation/native";

export default function ModuleDetailScreen() {
  const { theme } = useTheme();
  const { learningModules, updateModuleProgress, completeModule } = useAppContext();
  const route = useRoute<any>();
  const navigation = useNavigation();
  const moduleId = route.params?.moduleId;

  const module = learningModules.find((m) => m.id === moduleId);

  if (!module) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedText>Module not found</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  const handleStartModule = () => {
    if (module.progress === 0) {
      updateModuleProgress(module.id, 10);
    }
  };

  const handleCompleteModule = () => {
    completeModule(module.id);
    navigation.goBack();
  };

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={[styles.headerCard, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.headerTitle}>{module.title}</ThemedText>
          <ThemedText style={styles.headerDescription}>{module.description}</ThemedText>
          <View style={styles.headerMetadata}>
            <View style={styles.metadataItem}>
              <MaterialIcons name="schedule" size={16} color="rgba(255,255,255,0.9)" />
              <ThemedText style={styles.metadataText}>{module.duration}</ThemedText>
            </View>
            <View style={styles.metadataItem}>
              <MaterialIcons name="emoji-events" size={16} color="rgba(255,255,255,0.9)" />
              <ThemedText style={styles.metadataText}>{module.difficulty}</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={styles.sectionTitle}>What You'll Learn</ThemedText>
          {module.topics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <View style={[styles.topicBullet, { backgroundColor: theme.accent }]} />
              <ThemedText style={styles.topicText}>{topic}</ThemedText>
            </View>
          ))}
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="menu-book" size={24} color={theme.primary} />
            <ThemedText style={styles.cardTitle}>Module Content</ThemedText>
          </View>
          <ThemedText style={[styles.contentText, { color: theme.textSecondary }]}>
            This learning module contains carefully curated information from trusted medical sources.
            All content is adjusted to your selected reading level ({module.difficulty}).
          </ThemedText>
          <ThemedText style={[styles.contentText, { color: theme.textSecondary }]}>
            Content includes interactive lessons, visual diagrams, real-world examples, and
            knowledge checks to ensure understanding.
          </ThemedText>
        </ThemedView>

        {module.progress > 0 && !module.completed && (
          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.sectionTitle}>Your Progress</ThemedText>
            <View style={[styles.progressBar, { backgroundColor: theme.backgroundDefault }]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${module.progress}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
              {module.progress}% complete
            </ThemedText>
          </ThemedView>
        )}

        {module.completed ? (
          <ThemedView
            style={[
              styles.completedCard,
              {
                backgroundColor: theme.success + "20",
                borderColor: theme.success,
              },
            ]}
          >
            <MaterialIcons name="check-circle" size={48} color={theme.success} />
            <ThemedText style={[styles.completedTitle, { color: theme.success }]}>
              Module Completed!
            </ThemedText>
            <ThemedText style={[styles.completedText, { color: theme.textSecondary }]}>
              Great work! You've mastered this topic.
            </ThemedText>
          </ThemedView>
        ) : (
          <>
            {module.progress === 0 ? (
              <Button onPress={handleStartModule}>
                <MaterialIcons name="play-arrow" size={20} color="white" style={{ marginRight: Spacing.sm }} />
                Start Learning
              </Button>
            ) : (
              <Button onPress={handleCompleteModule}>
                <MaterialIcons name="check" size={20} color="white" style={{ marginRight: Spacing.sm }} />
                Mark as Complete
              </Button>
            )}
          </>
        )}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  headerDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
  },
  headerMetadata: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  metadataText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  topicBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  topicText: {
    fontSize: 15,
    lineHeight: 22,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
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
  progressText: {
    fontSize: 14,
    textAlign: "center",
  },
  completedCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    gap: Spacing.md,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  completedText: {
    fontSize: 16,
    textAlign: "center",
  },
});
