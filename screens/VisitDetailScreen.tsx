import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function VisitDetailScreen() {
  const { theme } = useTheme();
  const { visits } = useAppContext();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const visitId = route.params?.visitId;
  
  const visit = visits.find((v) => v.id === visitId);
  
  if (!visit) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedText>Visit not found</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.cardHeader}>
            <Icon name="headset" size={24} color={theme.primary} />
            <ThemedText style={styles.cardTitle}>Recording</ThemedText>
          </View>
          <Button onPress={() => {}}>
            <Icon name="play" size={20} color="white" style={{ marginRight: Spacing.sm }} />
            Play Recording
          </Button>
        </ThemedView>

        {visit.summary && (
          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.cardHeader}>
              <Icon name="document" size={24} color={theme.primary} />
              <ThemedText style={styles.cardTitle}>Visit Summary</ThemedText>
            </View>
            <ThemedText style={styles.summaryText}>{visit.summary}</ThemedText>
          </ThemedView>
        )}

        {visit.keyPoints.length > 0 && (
          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.sectionTitle}>Key Points</ThemedText>
            {visit.keyPoints.map((point, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bullet, { backgroundColor: theme.primary }]} />
                <ThemedText style={styles.listText}>{point}</ThemedText>
              </View>
            ))}
          </ThemedView>
        )}

        {visit.actions.length > 0 && (
          <ThemedView
            style={[
              styles.card,
              {
                backgroundColor: theme.success + "20",
                borderColor: theme.success,
                borderWidth: 1,
              },
            ]}
          >
            <ThemedText style={[styles.sectionTitle, { color: theme.success }]}>
              Action Items
            </ThemedText>
            {visit.actions.map((action, index) => (
              <View key={index} style={styles.listItem}>
                <Icon name="checkmark-circle" size={16} color={theme.success} />
                <ThemedText style={styles.listText}>{action}</ThemedText>
              </View>
            ))}
          </ThemedView>
        )}

        {visit.medicalTerms.length > 0 && (
          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.sectionTitle}>Medical Terms Explained</ThemedText>
            {visit.medicalTerms.map((item, index) => (
              <View key={index} style={styles.termCard}>
                <ThemedText style={styles.termTitle}>{item.term}</ThemedText>
                <ThemedText style={[styles.termExplanation, { color: theme.textSecondary }]}>
                  {item.explanation}
                </ThemedText>
              </View>
            ))}
          </ThemedView>
        )}

        <Button onPress={() => navigation.navigate("Chat", { visitId: visit.id })}>
          <Icon name="chat" size={20} color="white" style={{ marginRight: Spacing.sm }} />
          Ask Questions About This Visit
        </Button>
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
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
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  listItem: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  termCard: {
    marginBottom: Spacing.md,
  },
  termTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  termExplanation: {
    fontSize: 14,
    lineHeight: 20,
  },
});
