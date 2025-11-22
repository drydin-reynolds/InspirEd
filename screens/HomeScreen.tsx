import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const { theme } = useTheme();
  const { userName, visits } = useAppContext();
  const navigation = useNavigation<any>();
  const [showFABBounce, setShowFABBounce] = useState(visits.length === 0);

  const lastVisit = visits[0];
  const totalVisits = visits.length;
  const totalQuestions = Object.values(useAppContext().chatMessages).reduce(
    (sum, messages) => sum + messages.filter((m) => m.isUser).length,
    0
  );

  const motivationalQuotes = [
    "Knowledge is power, and you're gaining strength every day.",
    "Every visit is a step forward on your journey.",
    "Your dedication makes a difference.",
    "Learning together, growing stronger together.",
  ];

  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const handleRecordPress = () => {
    setShowFABBounce(false);
    navigation.navigate("RecordVisit");
  };

  return (
    <>
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedView
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText style={styles.greeting}>Hello, {userName}</ThemedText>
            <ThemedText style={[styles.quote, { color: theme.textSecondary }]}>
              {quote}
            </ThemedText>
          </ThemedView>

          {lastVisit ? (
            <>
              <ActionButton
                icon="file-text"
                title="Recent Visit"
                subtitle={new Date(lastVisit.date).toLocaleDateString()}
                onPress={() => navigation.navigate("HistoryTab")}
              />

              <View style={styles.statsContainer}>
                <StatCard
                  icon="clock"
                  value={totalVisits.toString()}
                  label="Total Visits"
                  theme={theme}
                />
                <StatCard
                  icon="help-circle"
                  value={totalQuestions.toString()}
                  label="Questions Asked"
                  theme={theme}
                />
              </View>

              <ActionButton
                icon="message-circle"
                title="Ask a Question"
                subtitle="Get answers about your visits"
                onPress={() => {
                  if (lastVisit) {
                    navigation.navigate("HistoryTab", {
                      screen: "VisitDetail",
                      params: { visitId: lastVisit.id },
                    });
                  }
                }}
              />

              <ActionButton
                icon="calendar"
                title="Prepare Next Visit"
                subtitle="Plan questions and checklist"
                onPress={() => navigation.navigate("PlannerTab")}
              />
            </>
          ) : (
            <EmptyState onPress={handleRecordPress} />
          )}
        </View>
      </ScreenScrollView>
      <FloatingActionButton onPress={handleRecordPress} showBounce={showFABBounce} />
    </>
  );
}

function StatCard({
  icon,
  value,
  label,
  theme,
}: {
  icon: string;
  value: string;
  label: string;
  theme: any;
}) {
  return (
    <ThemedView
      style={[
        styles.statCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <Feather name={icon as any} size={24} color={theme.primary} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}

function ActionButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
        styles.actionButton,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <Feather name={icon as any} size={24} color={theme.primary} />
      <View style={styles.actionTextContainer}>
        <ThemedText style={styles.actionTitle}>{title}</ThemedText>
        <ThemedText style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
          {subtitle}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

function EmptyState({ onPress }: { onPress: () => void }) {
  const { theme } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <Image
        source={require("@/assets/illustrations/empty-first-visit.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText style={styles.emptyTitle}>Welcome to InspirEd</ThemedText>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start by recording your first doctor visit. Tap the microphone button below to begin.
      </ThemedText>
      <ThemedText style={[styles.tagline, { color: theme.primary }]}>
        Learn to Empower. Empower to Hope.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  quote: {
    fontSize: 16,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  actionSubtitle: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
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
    paddingHorizontal: Spacing.xl,
    lineHeight: 24,
  },
  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
});
