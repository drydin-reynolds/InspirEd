import React from "react";
import { View, StyleSheet, Pressable, Image, FlatList } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, Visit } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { visits } = useAppContext();
  const navigation = useNavigation<any>();

  if (visits.length === 0) {
    return (
      <ScreenScrollView>
        <View style={styles.emptyContainer}>
          <Image
            source={require("@/assets/illustrations/empty-first-visit.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <ThemedText style={styles.emptyTitle}>No Visits Yet</ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Tap the microphone button to record your first doctor visit.
          </ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        {visits.map((visit) => (
          <VisitCard
            key={visit.id}
            visit={visit}
            onPress={() => navigation.navigate("VisitDetail", { visitId: visit.id })}
          />
        ))}
      </View>
    </ScreenScrollView>
  );
}

function VisitCard({ visit, onPress }: { visit: Visit; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
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
        styles.card,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <ThemedText style={styles.cardDate}>
            {new Date(visit.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </ThemedText>
          {visit.doctorName !== "Not specified" && (
            <ThemedText style={[styles.cardDoctor, { color: theme.textSecondary }]}>
              Dr. {visit.doctorName}
            </ThemedText>
          )}
        </View>
        <View style={styles.cardHeaderRight}>
          <View style={[styles.badge, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.badgeText, { color: theme.textSecondary }]}>
              {formatDuration(visit.duration)}
            </ThemedText>
          </View>
        </View>
      </View>

      {visit.isProcessing ? (
        <View style={styles.processingContainer}>
          <Feather name="loader" size={16} color={theme.warning} />
          <ThemedText style={[styles.processingText, { color: theme.warning }]}>
            Processing...
          </ThemedText>
        </View>
      ) : (
        <>
          {visit.summary && (
            <ThemedText style={[styles.summary, { color: theme.textSecondary }]} numberOfLines={2}>
              {visit.summary}
            </ThemedText>
          )}
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
            <ThemedText style={[styles.statusText, { color: theme.success }]}>
              Summarized
            </ThemedText>
          </View>
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  cardHeaderRight: {
    marginLeft: Spacing.md,
  },
  cardDate: {
    fontSize: 18,
    fontWeight: "700",
  },
  cardDoctor: {
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  processingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  processingText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
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
});
