import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, TextInput, Alert, ScrollView, ActivityIndicator, Platform } from "react-native";
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
import { transcribeAndSummarizeAudio } from "@/utils/gemini";
import { Audio } from "expo-av";

/*
 * NOTE: Using expo-av for audio recording despite its deprecation in SDK 54.
 * 
 * Rationale:
 * - expo-audio (the replacement) does not support pause/resume functionality as of SDK 54
 * - The recording pause/resume feature is critical for parents during doctor visits
 *   (they may need to pause during private conversations)
 * - expo-av provides pauseAsync()/startAsync() methods that meet requirements
 * 
 * Future migration:
 * - Monitor expo-audio for pause/resume support in future SDK releases
 * - Consider alternative solutions (e.g., segment stitching, different audio library)
 * - Migrate away from expo-av before it's fully removed from Expo
 */

export default function RecordVisitScreen() {
  const { theme } = useTheme();
  const { addVisit, updateVisit, readingLevel } = useAppContext();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [doctorName, setDoctorName] = useState("");
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const [reviewMode, setReviewMode] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  
  const [processingMode, setProcessingMode] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"transcribing" | "summarizing" | "complete">("transcribing");
  const [transcriptionResult, setTranscriptionResult] = useState<string | null>(null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const pulse = useSharedValue(1);

  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    requestPermissions();
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(console.error);
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error);
      }
    };
  }, []);

  const requestPermissions = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      setPermissionGranted(granted);
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "InspirEd needs microphone access to record doctor visits. Please enable it in your device settings.",
          [{ text: "OK" }]
        );
      } else {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error("Permission error:", error);
    }
  };

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

  const handleCancel = async () => {
    if (isRecording || seconds > 0) {
      Alert.alert(
        "Cancel Recording?",
        "Are you sure you want to cancel? Your recording will be lost.",
        [
          { text: "Keep Recording", style: "cancel" },
          {
            text: "Cancel",
            style: "destructive",
            onPress: async () => {
              if (recording) {
                await recording.stopAndUnloadAsync();
                setRecording(null);
              }
              setIsRecording(false);
              setIsPaused(false);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleRecord = async () => {
    if (!permissionGranted) {
      await requestPermissions();
      return;
    }
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Recording Error", "Could not start recording. Please try again.");
    }
  };

  const handlePause = async () => {
    if (!recording) return;
    
    try {
      if (isPaused) {
        await recording.startAsync();
        setIsPaused(false);
      } else {
        await recording.pauseAsync();
        setIsPaused(true);
      }
    } catch (error) {
      console.error("Failed to pause/resume recording:", error);
      Alert.alert("Recording Error", "Could not pause/resume recording.");
    }
  };

  const handleStop = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const audioUri = recording.getURI();
      
      if (!audioUri) {
        Alert.alert("Recording Error", "No audio was recorded.");
        setRecording(null);
        setIsRecording(false);
        setIsPaused(false);
        return;
      }

      setRecordedUri(audioUri);
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
      setReviewMode(true);
      
      await loadAudioForPlayback(audioUri);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Recording Error", "Could not save the recording. Please try again.");
      setRecording(null);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const loadAudioForPlayback = async (uri: string) => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
    } catch (error) {
      console.error("Failed to load audio for playback:", error);
      Alert.alert("Playback Error", "Could not load the recording for playback.");
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlaybackPosition(status.positionMillis);
      setPlaybackDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error("Failed to play/pause audio:", error);
      Alert.alert("Playback Error", "Could not play the recording.");
    }
  };

  const handleReRecord = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    
    setReviewMode(false);
    setRecordedUri(null);
    setPlaybackPosition(0);
    setPlaybackDuration(0);
    setIsPlaying(false);
    setSeconds(0);
    setDoctorName("");
  };

  const handleSaveVisit = async () => {
    if (!recordedUri) return;
    
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      setProcessingMode(true);
      setProcessingStatus("transcribing");

      const visitId = Date.now().toString();
      const visit = {
        id: visitId,
        date: new Date(),
        doctorName: doctorName || "Not specified",
        duration: seconds,
        audioUri: recordedUri,
        transcription: null,
        summary: null,
        keyPoints: [],
        diagnoses: [],
        actions: [],
        medicalTerms: [],
        isProcessing: true,
      };
      
      addVisit(visit);
      
      try {
        const result = await transcribeAndSummarizeAudio(
          recordedUri,
          "audio/m4a",
          readingLevel
        );
        
        setTranscriptionResult(result.transcription);
        setProcessingStatus("summarizing");
        
        const aiExtraction = await generateVisitSummary(
          result.transcription,
          readingLevel
        );
        
        setSummaryResult(result.summary);
        setProcessingStatus("complete");
        
        updateVisit(visitId, {
          transcription: result.transcription,
          summary: result.summary,
          keyPoints: aiExtraction.keyPoints,
          diagnoses: aiExtraction.diagnoses,
          actions: aiExtraction.actions,
          medicalTerms: aiExtraction.medicalTerms,
          isProcessing: false,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Failed to process audio:", errorMessage);
        updateVisit(visitId, {
          isProcessing: false,
        });
        setProcessingMode(false);
        
        const isWebLimitation = Platform.OS === "web" || errorMessage.includes("not available on web");
        
        const title = isWebLimitation ? "Web Limitation" : "Processing Failed";
        const message = isWebLimitation 
          ? "Audio transcription requires the Expo Go app on your phone. The visit has been saved without transcription. Please use the QR code to open InspirEd on your mobile device for full functionality."
          : `Could not transcribe the recording: ${errorMessage}. The visit has been saved, but you may need to review the audio manually.`;
        
        if (Platform.OS === "web") {
          window.alert(`${title}\n\n${message}`);
          navigation.goBack();
        } else {
          Alert.alert(title, message, [{ text: "OK", onPress: () => navigation.goBack() }]);
        }
      }
    } catch (error) {
      console.error("Failed to save visit:", error);
      Alert.alert("Error", "Could not save the visit. Please try again.");
    }
  };
  
  const handleViewInHistory = () => {
    navigation.goBack();
  };

  const formatPlaybackTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playbackProgress = playbackDuration > 0 ? playbackPosition / playbackDuration : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable 
          onPress={handleCancel} 
          style={styles.headerButton}
          pointerEvents={processingMode ? "none" : "auto"}
        >
          <ThemedText style={styles.headerButtonText}>
            {processingMode ? "" : "Cancel"}
          </ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>
          {processingMode ? "Processing Visit" : reviewMode ? "Review Recording" : "Recording Visit"}
        </ThemedText>
        <View style={styles.headerButton} />
      </View>

      {processingMode ? (
        <ScrollView style={styles.processingContainer} contentContainerStyle={styles.processingContent}>
          {processingStatus === "transcribing" ? (
            <View style={styles.processingStatusContainer}>
              <ActivityIndicator size="large" color="white" />
              <ThemedText style={styles.processingTitle}>Transcribing your visit...</ThemedText>
              <ThemedText style={styles.processingSubtitle}>
                Converting your recording to text
              </ThemedText>
            </View>
          ) : processingStatus === "summarizing" ? (
            <View style={styles.processingStatusContainer}>
              <ActivityIndicator size="large" color="white" />
              <ThemedText style={styles.processingTitle}>Creating your summary...</ThemedText>
              <ThemedText style={styles.processingSubtitle}>
                Analyzing the visit and adapting to your reading level
              </ThemedText>
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              <View style={styles.resultHeader}>
                <Feather name="check-circle" size={48} color="white" />
                <ThemedText style={styles.resultsTitle}>Visit Processed Successfully</ThemedText>
              </View>

              {summaryResult ? (
                <View style={styles.resultSection}>
                  <ThemedText style={styles.resultLabel}>Summary</ThemedText>
                  <ThemedView style={styles.resultCard}>
                    <ThemedText style={styles.resultText}>{summaryResult}</ThemedText>
                  </ThemedView>
                </View>
              ) : null}

              {transcriptionResult ? (
                <View style={styles.resultSection}>
                  <ThemedText style={styles.resultLabel}>Transcription Preview</ThemedText>
                  <ThemedView style={styles.resultCard}>
                    <ThemedText style={styles.resultText} numberOfLines={6}>
                      {transcriptionResult}
                    </ThemedText>
                  </ThemedView>
                </View>
              ) : null}

              <Pressable
                onPress={handleViewInHistory}
                style={[styles.viewHistoryButton, { backgroundColor: "white" }]}
              >
                <ThemedText style={[styles.viewHistoryButtonText, { color: theme.primary }]}>
                  View in History
                </ThemedText>
              </Pressable>
            </View>
          )}
        </ScrollView>
      ) : reviewMode ? (
        <View style={styles.content}>
          <View style={styles.waveformContainer}>
            <View
              style={[
                styles.waveform,
                { backgroundColor: theme.accent },
              ]}
            >
              <Feather
                name="headphones"
                size={48}
                color="white"
              />
            </View>
          </View>

          <ThemedText style={styles.timer}>{formatTime(seconds)}</ThemedText>

          <ThemedView style={[styles.inputCard, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <TextInput
              style={[styles.input, { color: "white" }]}
              placeholder="Doctor's name (optional)"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={doctorName}
              onChangeText={setDoctorName}
            />
          </ThemedView>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${playbackProgress * 100}%`,
                    backgroundColor: "white",
                  },
                ]}
              />
            </View>
            <View style={styles.progressTime}>
              <ThemedText style={styles.progressTimeText}>
                {formatPlaybackTime(playbackPosition)}
              </ThemedText>
              <ThemedText style={styles.progressTimeText}>
                {formatPlaybackTime(playbackDuration)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable
              onPress={handlePlayPause}
              style={[styles.recordButton, { backgroundColor: theme.accent }]}
            >
              <Feather name={isPlaying ? "pause" : "play"} size={32} color="white" />
            </Pressable>
          </View>

          <View style={styles.reviewButtons}>
            <Pressable
              onPress={handleReRecord}
              style={[styles.reviewButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            >
              <Feather name="rotate-ccw" size={20} color="white" />
              <ThemedText style={styles.reviewButtonText}>Re-record</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleSaveVisit}
              style={[styles.reviewButton, { backgroundColor: "white" }]}
            >
              <Feather name="check" size={20} color={theme.primary} />
              <ThemedText style={[styles.reviewButtonText, { color: theme.primary }]}>
                Save Visit
              </ThemedText>
            </Pressable>
          </View>
        </View>
      ) : (
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
      )}
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
  progressContainer: {
    width: "100%",
    marginBottom: Spacing["2xl"],
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: "100%",
  },
  progressTime: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressTimeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  reviewButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  reviewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  processingContainer: {
    flex: 1,
  },
  processingContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["2xl"],
  },
  processingStatusContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xl,
  },
  processingTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  processingSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  resultsContainer: {
    gap: Spacing["2xl"],
  },
  resultHeader: {
    alignItems: "center",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    textAlign: "center",
  },
  resultSection: {
    gap: Spacing.md,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 24,
    color: "white",
  },
  viewHistoryButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  viewHistoryButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
});
