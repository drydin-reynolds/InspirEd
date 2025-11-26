import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform, ActivityIndicator, Dimensions } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Icon } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, VideoWatchRecord } from "@/context/AppContext";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EducationalVideo, getVideoStreamUrl } from "@/utils/googleDrive";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";

type VideoPlayerParams = {
  VideoPlayer: {
    videoId: string;
    video: EducationalVideo;
  };
};

export default function VideoPlayerScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<VideoPlayerParams, "VideoPlayer">>();
  const insets = useSafeAreaInsets();
  const { addVideoWatchRecord, getVideoWatchProgress } = useAppContext();

  const { video } = route.params;
  const videoRef = useRef<Video>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<number>(0);

  useEffect(() => {
    const loadVideoUrl = async () => {
      try {
        const url = await getVideoStreamUrl(video.id);
        setVideoUrl(url || video.videoUrl);
      } catch (err) {
        console.error("Error getting video URL:", err);
        setVideoUrl(video.videoUrl);
      }
    };
    loadVideoUrl();
  }, [video.id, video.videoUrl]);

  const saveProgress = useCallback(
    (currentPosition: number, totalDuration: number) => {
      if (totalDuration <= 0) return;

      const now = Date.now();
      if (now - lastSaveRef.current < 5000) return;
      lastSaveRef.current = now;

      const completedPercent = Math.round((currentPosition / totalDuration) * 100);
      const record: VideoWatchRecord = {
        videoId: video.id,
        watchedAt: new Date(),
        completedPercent,
      };
      addVideoWatchRecord(record);
    },
    [video.id, addVideoWatchRecord]
  );

  const handlePlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          setError("Unable to play this video. Please try again later.");
          console.error("Video error:", status.error);
        }
        return;
      }

      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);

      if (status.positionMillis && status.durationMillis) {
        saveProgress(status.positionMillis, status.durationMillis);
      }

      if (status.didJustFinish) {
        const record: VideoWatchRecord = {
          videoId: video.id,
          watchedAt: new Date(),
          completedPercent: 100,
        };
        addVideoWatchRecord(record);
        setShowControls(true);
      }
    },
    [video.id, addVideoWatchRecord, saveProgress]
  );

  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
        hideControlsAfterDelay();
      }
    } catch (err) {
      console.error("Play/pause error:", err);
    }
  };

  const seekTo = async (positionMs: number) => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.setPositionAsync(positionMs);
    } catch (err) {
      console.error("Seek error:", err);
    }
  };

  const skipForward = () => {
    const newPosition = Math.min(position + 10000, duration);
    seekTo(newPosition);
  };

  const skipBackward = () => {
    const newPosition = Math.max(position - 10000, 0);
    seekTo(newPosition);
  };

  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleVideoPress = () => {
    setShowControls(!showControls);
    if (!showControls && isPlaying) {
      hideControlsAfterDelay();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? position / duration : 0;
  const previousProgress = getVideoWatchProgress(video.id);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (position > 0 && duration > 0) {
        const completedPercent = Math.round((position / duration) * 100);
        const record: VideoWatchRecord = {
          videoId: video.id,
          watchedAt: new Date(),
          completedPercent: Math.max(completedPercent, previousProgress),
        };
        addVideoWatchRecord(record);
      }
    };
  }, [position, duration, video.id, previousProgress, addVideoWatchRecord]);

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: "#000", paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="chevron-back" size={28} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.errorContainer}>
          <Icon name="videocam-off" size={64} color="#fff" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
          >
            <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      <Pressable onPress={handleVideoPress} style={styles.videoContainer}>
        {videoUrl ? (
          <Video
            ref={videoRef}
            source={{ uri: videoUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay={false}
            isLooping={false}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
            onLoad={() => setIsLoading(false)}
            onError={(e) => {
              console.error("Video load error:", e);
              setError("Unable to load video. Please try again later.");
            }}
          />
        ) : null}

        {isLoading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : null}

        {showControls ? (
          <View style={[styles.controlsOverlay, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Icon name="chevron-back" size={28} color="#fff" />
              </Pressable>
              <ThemedText style={styles.headerTitle} numberOfLines={1}>
                {video.title}
              </ThemedText>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.centerControls}>
              <Pressable onPress={skipBackward} style={styles.skipButton}>
                <ThemedText style={styles.skipText}>-10s</ThemedText>
              </Pressable>

              <Pressable onPress={togglePlayPause} style={styles.playButton}>
                <Icon name={isPlaying ? "pause" : "play"} size={40} color="#fff" />
              </Pressable>

              <Pressable onPress={skipForward} style={styles.skipButton}>
                <ThemedText style={styles.skipText}>+10s</ThemedText>
              </Pressable>
            </View>

            <View style={styles.bottomControls}>
              <ThemedText style={styles.timeText}>{formatTime(position)}</ThemedText>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
              </View>
              <ThemedText style={styles.timeText}>{formatTime(duration)}</ThemedText>
            </View>
          </View>
        ) : null}
      </Pressable>

      {!isPlaying && showControls ? (
        <View style={[styles.videoInfo, { paddingBottom: insets.bottom + Spacing.lg }]}>
          <ThemedText style={styles.videoTitle}>{video.title}</ThemedText>
          <ThemedText style={styles.videoDescription}>{video.description}</ThemedText>
          <View style={styles.metadataRow}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary + "30" }]}>
              <ThemedText style={[styles.categoryText, { color: theme.primary }]}>
                {video.category}
              </ThemedText>
            </View>
            <View style={styles.durationContainer}>
              <Icon name="time" size={14} color="rgba(255,255,255,0.7)" />
              <ThemedText style={styles.durationText}>{video.duration}</ThemedText>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: Spacing.md,
  },
  centerControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xl * 2,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  skipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    minWidth: 45,
  },
  progressBarContainer: {
    flex: 1,
    height: 20,
    justifyContent: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
    padding: Spacing.xl,
  },
  errorText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  videoInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  videoTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  videoDescription: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    lineHeight: 20,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  durationText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
});
