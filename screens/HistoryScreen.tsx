import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, Alert, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Icon } from "@/components/Icon";
import { MarkdownText } from "@/components/MarkdownText";
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
  const { visits, deleteVisit, loadSampleVisits } = useAppContext();
  const navigation = useNavigation<any>();

  const handleDeleteVisit = (visitId: string, doctorName: string) => {
    const message = `Are you sure you want to delete this visit${doctorName !== "Not specified" ? ` with Dr. ${doctorName}` : ""}? This cannot be undone.`;
    
    if (Platform.OS === "web") {
      if (window.confirm(message)) {
        deleteVisit(visitId);
      }
    } else {
      Alert.alert(
        "Delete Visit",
        message,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteVisit(visitId),
          },
        ]
      );
    }
  };

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
          <Pressable
            onPress={loadSampleVisits}
            style={[styles.loadSampleButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
          >
            <Icon name="document" size={18} color={theme.primary} />
            <ThemedText style={[styles.loadSampleText, { color: theme.primary }]}>
              Load Sample Visits
            </ThemedText>
          </Pressable>
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
            onDelete={() => handleDeleteVisit(visit.id, visit.doctorName)}
          />
        ))}
      </View>
    </ScreenScrollView>
  );
}

function VisitCard({
  visit,
  onPress,
  onDelete,
}: {
  visit: Visit;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    return `${mins} min`;
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleCardPress = async () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
  };

  return (
    <AnimatedPressable
      onPress={handleCardPress}
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
          <Icon name="sync" size={16} color={theme.warning} />
          <ThemedText style={[styles.processingText, { color: theme.warning }]}>
            Processing...
          </ThemedText>
        </View>
      ) : (
        <>
          {visit.summary && !isExpanded && (
            <View style={{ maxHeight: 44, overflow: "hidden" }}>
              <MarkdownText style={styles.summary} color={theme.textSecondary}>
                {visit.summary}
              </MarkdownText>
            </View>
          )}
          {!isExpanded && (
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
              <ThemedText style={[styles.statusText, { color: theme.success }]}>
                Summarized
              </ThemedText>
            </View>
          )}
        </>
      )}

      {isExpanded && (
        <View style={styles.expandedContent}>
          {visit.summary && (
            <View style={styles.fullSummaryContainer}>
              <MarkdownText style={styles.fullSummary} color={theme.textSecondary}>
                {visit.summary}
              </MarkdownText>
            </View>
          )}

          <View style={styles.actionButtons}>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onPress();
              }}
              style={[styles.viewDetailsButton, { backgroundColor: theme.primary }]}
            >
              <ThemedText style={styles.viewDetailsText}>View Full Details</ThemedText>
              <Icon name="chevron-right" size={16} color="white" />
            </Pressable>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={[styles.deleteButton, { backgroundColor: theme.error }]}
            >
              <Icon name="trash" size={18} color="white" />
            </Pressable>
          </View>
        </View>
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
  loadSampleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  loadSampleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  expandedContent: {
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  fullSummaryContainer: {
    paddingTop: Spacing.sm,
  },
  fullSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
