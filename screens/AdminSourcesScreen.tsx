import React, { useState } from "react";
import { View, StyleSheet, Pressable, Image, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, PDFSource } from "@/context/AppContext";

export default function AdminSourcesScreen() {
  const { theme } = useTheme();
  const { pdfSources, addPDFSource, deletePDFSource } = useAppContext();

  const handleAddPDF = () => {
    const newPDF: PDFSource = {
      id: Date.now().toString(),
      title: "Pulmonary Care Guidelines 2025",
      uploadDate: new Date(),
      fileSize: "2.4 MB",
      status: "processing",
    };

    addPDFSource(newPDF);

    setTimeout(() => {
      const sources = [...pdfSources, newPDF];
      const processingSource = sources.find((s) => s.id === newPDF.id);
      if (processingSource) {
        processingSource.status = "ready";
      }
    }, 3000);
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Source", "Are you sure you want to delete this PDF source?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deletePDFSource(id),
      },
    ]);
  };

  if (pdfSources.length === 0) {
    return (
      <ScreenScrollView>
        <View style={styles.emptyContainer}>
          <MaterialIcons name="insert-drive-file" size={64} color={theme.textSecondary} />
          <ThemedText style={styles.emptyTitle}>No Sources Yet</ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Upload trusted medical PDFs to help the AI provide accurate, grounded answers.
          </ThemedText>
          <Button onPress={handleAddPDF}>
            <MaterialIcons name="upload" size={20} color="white" style={{ marginRight: Spacing.sm }} />
            Add Trusted Source
          </Button>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <Button onPress={handleAddPDF}>
          <MaterialIcons name="upload" size={20} color="white" style={{ marginRight: Spacing.sm }} />
          Add Trusted Source
        </Button>

        <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}>
          PDFs will be used to answer questions accurately
        </ThemedText>

        <View style={styles.sourcesList}>
          {pdfSources.map((source) => (
            <PDFSourceCard key={source.id} source={source} onDelete={handleDelete} />
          ))}
        </View>
      </View>
    </ScreenScrollView>
  );
}

function PDFSourceCard({
  source,
  onDelete,
}: {
  source: PDFSource;
  onDelete: (id: string) => void;
}) {
  const { theme } = useTheme();

  return (
    <ThemedView
      style={[
        styles.sourceCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.sourceIcon}>
        <MaterialIcons name="description" size={32} color={theme.primary} />
      </View>
      <View style={styles.sourceInfo}>
        <ThemedText style={styles.sourceTitle}>{source.title}</ThemedText>
        <View style={styles.sourceMetadata}>
          <ThemedText style={[styles.sourceMetaText, { color: theme.textSecondary }]}>
            {new Date(source.uploadDate).toLocaleDateString()}
          </ThemedText>
          <ThemedText style={[styles.sourceMetaText, { color: theme.textSecondary }]}>•</ThemedText>
          <ThemedText style={[styles.sourceMetaText, { color: theme.textSecondary }]}>
            {source.fileSize}
          </ThemedText>
        </View>
        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: source.status === "ready" ? theme.success : theme.warning,
              },
            ]}
          />
          <ThemedText
            style={[
              styles.statusText,
              {
                color: source.status === "ready" ? theme.success : theme.warning,
              },
            ]}
          >
            {source.status === "ready" ? "Ready" : "Processing"}
          </ThemedText>
        </View>
      </View>
      <Pressable onPress={() => onDelete(source.id)} style={styles.deleteButton}>
        <MaterialIcons name="delete" size={20} color={theme.error} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  helperText: {
    fontSize: 14,
    textAlign: "center",
  },
  sourcesList: {
    gap: Spacing.md,
  },
  sourceCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
    alignItems: "center",
  },
  sourceIcon: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  sourceInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  sourceTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  sourceMetadata: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  sourceMetaText: {
    fontSize: 12,
  },
  statusContainer: {
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
  deleteButton: {
    padding: Spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
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
