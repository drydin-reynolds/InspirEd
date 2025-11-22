import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { generateVisitSummary } from "@/utils/openai";

export default function RecordVisitScreen() {
  const { theme } = useTheme();
  const { addVisit, updateVisit, readingLevel } = useAppContext();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [doctorName, setDoctorName] = useState("");
  
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [isRecording, isPaused]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCancel = () => {
    if (isRecording || seconds > 0) {
      Alert.alert(
        "Cancel Recording?",
        "Are you sure you want to cancel? Your recording will be lost.",
        [
          { text: "Keep Recording", style: "cancel" },
          {
            text: "Cancel",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleRecord = () => {
    setIsRecording(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    const visitId = Date.now().toString();
    const visit = {
      id: visitId,
      date: new Date(),
      doctorName: doctorName || "Not specified",
      duration: seconds,
      audioUri: `mock://recording-${visitId}.m4a`,
      summary: null,
      keyPoints: [],
      diagnoses: [],
      actions: [],
      medicalTerms: [],
      isProcessing: true,
    };
    
    addVisit(visit);
    navigation.goBack();
    
    setTimeout(async () => {
      const summary = await generateVisitSummary("Mock transcript", readingLevel);
      updateVisit(visitId, {
        ...summary,
        isProcessing: false,
      });
    }, 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <ThemedText style={styles.headerButtonText}>Cancel</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Recording Visit</ThemedText>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.waveformContainer, pulseStyle]}>
          <View
            style={[
              styles.waveform,
              {
                backgroundColor: isRecording && !isPaused ? "#FF6B6B" : theme.accent,
              },
            ]}
          >
            <Feather
              name="mic"
              size={48}
              color="white"
            />
          </View>
        </Animated.View>

        <ThemedText style={styles.timer}>{formatTime(seconds)}</ThemedText>

        {!isRecording && (
          <ThemedView style={[styles.inputCard, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <TextInput
              style={[styles.input, { color: "white" }]}
              placeholder="Doctor's name (optional)"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={doctorName}
              onChangeText={setDoctorName}
            />
          </ThemedView>
        )}

        <View style={styles.controls}>
          {!isRecording ? (
            <Pressable
              onPress={handleRecord}
              style={[styles.recordButton, { backgroundColor: "#FF6B6B" }]}
            >
              <Feather name="circle" size={32} color="white" />
            </Pressable>
          ) : (
            <>
              <Pressable
                onPress={handlePause}
                style={[styles.controlButton, { backgroundColor: "rgba(255,255,255,0.3)" }]}
              >
                <Feather name={isPaused ? "play" : "pause"} size={24} color="white" />
              </Pressable>
              <Pressable
                onPress={handleStop}
                style={[styles.controlButton, { backgroundColor: theme.accent }]}
              >
                <Feather name="check" size={24} color="white" />
              </Pressable>
            </>
          )}
        </View>

        {!isRecording && (
          <ThemedText style={styles.instruction}>
            Find a quiet spot and tap to start recording
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerButton: {
    width: 80,
  },
  headerButtonText: {
    color: "white",
    fontSize: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  waveformContainer: {
    marginBottom: Spacing["3xl"],
  },
  waveform: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  timer: {
    fontSize: 48,
    fontWeight: "700",
    color: "white",
    marginBottom: Spacing["2xl"],
  },
  inputCard: {
    width: "100%",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  input: {
    fontSize: 16,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    gap: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  instruction: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
});
