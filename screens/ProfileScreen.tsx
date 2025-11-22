import React from "react";
import { StyleSheet, View, TextInput, Pressable } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { useAppContext } from "@/context/AppContext";
import { Feather } from "@expo/vector-icons";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, "Profile">;
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme } = useTheme();
  const {
    userName,
    setUserName,
    recordingQuality,
    setRecordingQuality,
    autoSave,
    setAutoSave,
    isAdmin,
    setIsAdmin,
  } = useAppContext();

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.container}>
        <ThemedView style={[styles.inputCard, { backgroundColor: theme.backgroundSecondary }]}>
          <TextInput
            style={[styles.nameInput, { color: theme.text }]}
            value={userName}
            onChangeText={setUserName}
            placeholder="Your name"
            placeholderTextColor={theme.textSecondary}
          />
        </ThemedView>

        <SettingSection title="Recording">
          <SettingToggle
            label="High Quality"
            value={recordingQuality === "high"}
            onValueChange={(value) => setRecordingQuality(value ? "high" : "medium")}
          />
        </SettingSection>

        <SettingSection title="Privacy">
          <SettingToggle label="Auto-save summaries" value={autoSave} onValueChange={setAutoSave} />
        </SettingSection>

        {isAdmin && (
          <Button onPress={() => navigation.navigate("AdminSources")}>
            <Feather name="file" size={20} color="white" style={{ marginRight: Spacing.sm }} />
            Manage Trusted Sources
          </Button>
        )}

        <View style={styles.adminToggle}>
          <Pressable
            onPress={() => setIsAdmin(!isAdmin)}
            style={[
              styles.adminButton,
              {
                backgroundColor: isAdmin ? theme.primary : theme.backgroundSecondary,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather name="shield" size={16} color={isAdmin ? "white" : theme.textSecondary} />
            <ThemedText style={{ color: isAdmin ? "white" : theme.textSecondary, fontSize: 12 }}>
              {isAdmin ? "Admin Mode" : "Enable Admin"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.aboutSection}>
          <ThemedText style={[styles.tagline, { color: theme.primary }]}>
            Learn to Empower. Empower to Hope.
          </ThemedText>
          <ThemedText style={[styles.version, { color: theme.textSecondary }]}>
            Version 1.0.0
          </ThemedText>
        </View>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingSection}>
      <ThemedText style={styles.settingTitle}>{title}</ThemedText>
      {children}
    </View>
  );
}

function SettingToggle({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { theme } = useTheme();

  return (
    <Pressable onPress={() => onValueChange(!value)} style={styles.toggleRow}>
      <ThemedText>{label}</ThemedText>
      <View
        style={[
          styles.toggle,
          {
            backgroundColor: value ? theme.primary : theme.backgroundSecondary,
            borderColor: theme.border,
          },
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            {
              backgroundColor: "white",
              transform: [{ translateX: value ? 18 : 0 }],
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.xl,
  },
  inputCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  settingSection: {
    gap: Spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    padding: 2,
    justifyContent: "center",
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  adminToggle: {
    alignItems: "center",
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  aboutSection: {
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
  },
  tagline: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
  version: {
    fontSize: 12,
  },
});
