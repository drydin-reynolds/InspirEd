import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/components/Icon";
import { Spacing } from "@/constants/theme";

type PdfViewerModalProps = {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
  title?: string;
};

export function PdfViewerModal({
  visible,
  uri,
  onClose,
  title,
}: PdfViewerModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && uri) {
      setLoading(true);
      setError(null);
    }
  }, [visible, uri]);

  const showWebView = Boolean(uri) && !error;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <View
          style={[
            styles.header,
            {
              borderBottomColor: theme.border,
              backgroundColor: theme.backgroundSecondary,
            },
          ]}
        >
          <Pressable
            onPress={onClose}
            style={styles.headerBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Close PDF viewer"
          >
            <Icon name="close" size={24} color={theme.text} />
          </Pressable>
          <ThemedText
            numberOfLines={1}
            style={[styles.title, { color: theme.text }]}
          >
            {title || "Source document"}
          </ThemedText>
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <ThemedText style={{ color: theme.error, textAlign: "center" }}>
              {error}
            </ThemedText>
            <Pressable onPress={onClose} style={styles.retryMargin}>
              <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>
                Close
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {showWebView && uri ? (
          <View style={styles.webOuter}>
            <WebView
              source={{ uri }}
              style={styles.webview}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(
                  "Could not load this document. Check your connection and RAG server URL.",
                );
              }}
              onHttpError={() => {
                setLoading(false);
                setError("Could not open this document (server error).");
              }}
              originWhitelist={["*"]}
              allowsInlineMediaPlayback
            />
            {loading ? (
              <View
                style={[
                  StyleSheet.absoluteFillObject,
                  styles.loadingOverlay,
                  { backgroundColor: theme.backgroundRoot + "EE" },
                ]}
              >
                <ActivityIndicator size="large" color={theme.primary} />
                <ThemedText
                  style={{ marginTop: Spacing.md, color: theme.textSecondary }}
                >
                  Loading document…
                </ThemedText>
              </View>
            ) : null}
          </View>
        ) : null}

        {visible && !uri ? (
          <View style={styles.errorBox}>
            <ThemedText style={{ color: theme.textSecondary }}>
              No document URL
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    padding: Spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
  },
  webOuter: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  retryMargin: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
  },
});
