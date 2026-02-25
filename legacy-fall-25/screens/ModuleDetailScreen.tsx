import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable, TextInput, ActivityIndicator, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { MarkdownText } from "@/components/MarkdownText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, Message, ModuleVideo } from "@/context/AppContext";
import { useRoute, useNavigation } from "@react-navigation/native";
import { generateModuleLesson, askEducationalQuestion, GeneratedLesson } from "@/utils/gemini";

export default function ModuleDetailScreen() {
  const { theme } = useTheme();
  const { learningModules, updateModuleProgress, completeModule, readingLevel, addVideoWatchRecord, getVideoWatchProgress } = useAppContext();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const moduleId = route.params?.moduleId;

  const module = learningModules.find((m) => m.id === moduleId);

  const [lesson, setLesson] = useState<GeneratedLesson | null>(null);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showLesson, setShowLesson] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [videoWatched, setVideoWatched] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    if (module?.video) {
      const progress = getVideoWatchProgress(module.video.id);
      setVideoWatched(progress > 50);
    }
  }, [module?.video]);
  
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (module?.video) {
        const progress = getVideoWatchProgress(module.video.id);
        setVideoWatched(progress > 50);
      }
    });
    return unsubscribe;
  }, [navigation, module?.video, getVideoWatchProgress]);

  const loadLesson = async () => {
    if (!module) return;
    
    setIsLoadingLesson(true);
    setShowLesson(true);
    
    try {
      const generatedLesson = await generateModuleLesson(
        module.title,
        module.description,
        module.topics,
        module.difficulty,
        readingLevel
      );
      
      setLesson(generatedLesson);
      
      if (module.progress === 0) {
        updateModuleProgress(module.id, 10);
      }
    } catch (error) {
      console.error("Failed to generate lesson:", error);
      setLesson({
        introduction: "We're having trouble loading this lesson right now. Please try again in a moment.",
        sections: [
          {
            title: "Content Unavailable",
            content: "The lesson content couldn't be generated at this time. You can still ask the AI Learning Assistant questions about this topic by going back and using the chat feature.",
            keyTakeaway: "Try again later or ask the AI Assistant for help.",
          },
        ],
        summary: "Please try again later.",
        practicalTips: ["Check your internet connection and try again"],
      });
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNextSection = () => {
    if (!lesson || !module) return;
    
    const hasVideoAfterIntro = module.video?.placement === "after_intro";
    const videoSectionOffset = hasVideoAfterIntro ? 1 : 0;
    const totalSections = lesson.sections.length + 2 + videoSectionOffset;
    const newSection = currentSection + 1;
    setCurrentSection(newSection);
    scrollToTop();
    
    const progressPercent = Math.round(((newSection + 1) / totalSections) * 100);
    updateModuleProgress(module.id, Math.min(progressPercent, 95));
  };

  const handlePrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      scrollToTop();
    }
  };

  const handleCompleteModule = () => {
    if (module) {
      completeModule(module.id);
      navigation.goBack();
    }
  };

  const handleAskQuestion = async () => {
    if (!inputText.trim() || isLoadingChat || !module) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const questionText = inputText.trim();
    setInputText("");
    setIsLoadingChat(true);

    const moduleContext = `The user is learning about "${module.title}". ${module.description}. Topics include: ${module.topics.join(", ")}.`;
    
    const conversationHistory = chatMessages.map((msg) => ({
      text: msg.text,
      isUser: msg.isUser,
    }));

    const response = await askEducationalQuestion(
      `Context: ${moduleContext}\n\nQuestion: ${questionText}`,
      conversationHistory,
      readingLevel
    );

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response.answer,
      isUser: false,
      timestamp: new Date(),
      citations: response.citations,
    };

    setChatMessages((prev) => [...prev, aiMessage]);
    setIsLoadingChat(false);
  };

  if (!module) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedText>Module not found</ThemedText>
        </View>
      </ScreenScrollView>
    );
  }

  if (showChat) {
    return (
      <ScreenKeyboardAwareScrollView>
        <View style={styles.container}>
          <Pressable onPress={() => setShowChat(false)} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color={theme.primary} />
            <ThemedText style={{ color: theme.primary, fontSize: 16, fontWeight: "600" }}>
              Back to Lesson
            </ThemedText>
          </Pressable>

          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.cardHeader}>
              <Icon name="chat" size={24} color={theme.accent} />
              <ThemedText style={styles.cardTitle}>Ask About This Topic</ThemedText>
            </View>
            <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}>
              Have questions about {module.title.toLowerCase()}? Ask and I'll help explain.
            </ThemedText>
          </ThemedView>

          <View style={styles.chatMessages}>
            {chatMessages.map((msg) => (
              <View key={msg.id} style={[styles.messageBubble, msg.isUser && styles.userMessage]}>
                <View
                  style={[
                    styles.messageContent,
                    { backgroundColor: msg.isUser ? theme.primary : theme.backgroundSecondary },
                  ]}
                >
                  {msg.isUser ? (
                    <ThemedText style={{ color: "white" }}>
                      {msg.text}
                    </ThemedText>
                  ) : (
                    <MarkdownText color={theme.text}>
                      {msg.text}
                    </MarkdownText>
                  )}
                </View>
              </View>
            ))}
            {isLoadingChat && (
              <View style={styles.messageBubble}>
                <View style={[styles.messageContent, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText style={{ color: theme.textSecondary }}>Thinking...</ThemedText>
                </View>
              </View>
            )}
          </View>

          <ThemedView style={[styles.inputCard, { backgroundColor: theme.backgroundSecondary }]}>
            <TextInput
              style={[styles.input, { color: theme.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question..."
              placeholderTextColor={theme.textSecondary}
              multiline
              maxLength={500}
            />
            <Pressable
              onPress={handleAskQuestion}
              disabled={!inputText.trim() || isLoadingChat}
              style={[
                styles.sendButton,
                { backgroundColor: inputText.trim() && !isLoadingChat ? theme.primary : theme.backgroundDefault },
              ]}
            >
              <Icon name="send" size={20} color={inputText.trim() && !isLoadingChat ? "white" : theme.textSecondary} />
            </Pressable>
          </ThemedView>
        </View>
      </ScreenKeyboardAwareScrollView>
    );
  }

  if (showLesson && isLoadingLesson) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <ThemedView style={[styles.loadingCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={styles.loadingTitle}>Creating Your Lesson</ThemedText>
            <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
              Generating personalized content about {module.title.toLowerCase()}...
            </ThemedText>
          </ThemedView>
        </View>
      </ScreenScrollView>
    );
  }

  if (showLesson && lesson) {
    const hasVideoAfterIntro = module.video?.placement === "after_intro";
    const videoSectionOffset = hasVideoAfterIntro ? 1 : 0;
    const totalSections = lesson.sections.length + 2 + videoSectionOffset;
    const isIntro = currentSection === 0;
    const isVideoSection = hasVideoAfterIntro && currentSection === 1;
    const isSummary = currentSection === totalSections - 1;
    const sectionIndex = currentSection - 1 - videoSectionOffset;
    
    const hasValidVideoSource = module.video?.sourceUri && module.video.sourceUri.trim() !== "";
    
    const handleWatchVideo = () => {
      if (module.video && hasValidVideoSource) {
        navigation.navigate("VideoPlayer", {
          videoId: module.video.id,
          title: module.video.title,
          sourceUri: module.video.sourceUri,
          sourceType: module.video.sourceType,
          description: module.video.description,
          duration: module.video.duration,
        });
      }
    };

    return (
      <ScreenScrollView ref={scrollViewRef}>
        <View style={styles.container}>
          <View style={styles.progressHeader}>
            <View style={[styles.lessonProgressBar, { backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.lessonProgressFill,
                  { backgroundColor: theme.primary, width: `${((currentSection + 1) / totalSections) * 100}%` },
                ]}
              />
            </View>
            <ThemedText style={[styles.progressLabel, { color: theme.textSecondary }]}>
              {currentSection + 1} of {totalSections}
            </ThemedText>
          </View>

          {isIntro ? (
            <ThemedView style={[styles.lessonCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.lessonBadge, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.lessonBadgeText}>Introduction</ThemedText>
              </View>
              <ThemedText style={styles.lessonTitle}>{module.title}</ThemedText>
              <MarkdownText style={styles.lessonContent} color={theme.text}>{lesson.introduction}</MarkdownText>
              <View style={styles.topicsPreview}>
                <ThemedText style={[styles.topicsLabel, { color: theme.textSecondary }]}>
                  In this lesson, you'll learn about:
                </ThemedText>
                {module.topics.map((topic, idx) => (
                  <View key={idx} style={styles.topicRow}>
                    <Icon name="checkmark-circle" size={16} color={theme.accent} />
                    <ThemedText style={styles.topicItem}>{topic}</ThemedText>
                  </View>
                ))}
              </View>
            </ThemedView>
          ) : isVideoSection && module.video ? (
            <ThemedView style={[styles.lessonCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.lessonBadge, { backgroundColor: theme.accent }]}>
                <ThemedText style={styles.lessonBadgeText}>Watch</ThemedText>
              </View>
              <ThemedText style={styles.lessonTitle}>{module.video.title}</ThemedText>
              <ThemedText style={[styles.lessonContent, { color: theme.textSecondary }]}>
                {module.video.description}
              </ThemedText>
              
              {hasValidVideoSource ? (
                <Pressable
                  onPress={handleWatchVideo}
                  style={[styles.videoCard, { backgroundColor: theme.primary + "10", borderColor: theme.primary }]}
                >
                  <View style={[styles.videoPlayButton, { backgroundColor: theme.primary }]}>
                    <Icon name="play" size={32} color="white" />
                  </View>
                  <View style={styles.videoInfo}>
                    <ThemedText style={styles.videoTitle}>{module.video.title}</ThemedText>
                    <View style={styles.videoDuration}>
                      <Icon name="time" size={14} color={theme.textSecondary} />
                      <ThemedText style={[styles.videoDurationText, { color: theme.textSecondary }]}>
                        {module.video.duration}
                      </ThemedText>
                    </View>
                  </View>
                  {videoWatched ? (
                    <View style={[styles.watchedBadge, { backgroundColor: theme.success }]}>
                      <Icon name="check" size={16} color="white" />
                    </View>
                  ) : null}
                </Pressable>
              ) : (
                <View style={[styles.videoCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <View style={[styles.videoPlayButton, { backgroundColor: theme.border }]}>
                    <Icon name="videocam-off" size={28} color={theme.textSecondary} />
                  </View>
                  <View style={styles.videoInfo}>
                    <ThemedText style={[styles.videoTitle, { color: theme.textSecondary }]}>
                      Video Not Available
                    </ThemedText>
                    <ThemedText style={[styles.videoDurationText, { color: theme.textSecondary }]}>
                      This video is currently unavailable
                    </ThemedText>
                  </View>
                </View>
              )}
              
              <ThemedText style={[styles.videoHint, { color: theme.textSecondary }]}>
                {hasValidVideoSource 
                  ? "Tap to watch the video, then continue to the next section."
                  : "You can continue to the next section without watching the video."}
              </ThemedText>
            </ThemedView>
          ) : isSummary ? (
            <ThemedView style={[styles.lessonCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.lessonBadge, { backgroundColor: theme.success }]}>
                <ThemedText style={styles.lessonBadgeText}>Summary</ThemedText>
              </View>
              <ThemedText style={styles.lessonTitle}>What You Learned</ThemedText>
              <MarkdownText style={styles.lessonContent} color={theme.text}>{lesson.summary}</MarkdownText>
              
              <View style={[styles.tipsCard, { backgroundColor: theme.accent + "20" }]}>
                <ThemedText style={[styles.tipsTitle, { color: theme.accent }]}>Practical Tips</ThemedText>
                {lesson.practicalTips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <ThemedText style={[styles.tipNumber, { color: theme.accent }]}>{idx + 1}.</ThemedText>
                    <ThemedText style={styles.tipText}>{tip}</ThemedText>
                  </View>
                ))}
              </View>
            </ThemedView>
          ) : (
            <ThemedView style={[styles.lessonCard, { backgroundColor: theme.backgroundSecondary }]}>
              <View style={[styles.lessonBadge, { backgroundColor: theme.primary }]}>
                <ThemedText style={styles.lessonBadgeText}>Section {sectionIndex + 1}</ThemedText>
              </View>
              <ThemedText style={styles.lessonTitle}>{lesson.sections[sectionIndex].title}</ThemedText>
              <MarkdownText style={styles.lessonContent} color={theme.text}>{lesson.sections[sectionIndex].content}</MarkdownText>
              {lesson.sections[sectionIndex].keyTakeaway ? (
                <View style={[styles.takeawayCard, { backgroundColor: theme.primary + "15", borderColor: theme.primary }]}>
                  <Icon name="sparkles" size={20} color={theme.primary} />
                  <View style={styles.takeawayContent}>
                    <ThemedText style={[styles.takeawayLabel, { color: theme.primary }]}>Key Takeaway</ThemedText>
                    <MarkdownText style={styles.takeawayText} color={theme.text}>{lesson.sections[sectionIndex].keyTakeaway}</MarkdownText>
                  </View>
                </View>
              ) : null}
            </ThemedView>
          )}

          <View style={styles.navigationRow}>
            {currentSection > 0 ? (
              <Pressable onPress={handlePrevSection} style={[styles.navButton, { borderColor: theme.border }]}>
                <Icon name="chevron-back" size={20} color={theme.text} />
                <ThemedText>Previous</ThemedText>
              </Pressable>
            ) : (
              <View style={styles.navButtonPlaceholder} />
            )}

            {isSummary ? (
              <Button onPress={handleCompleteModule} style={{ flex: 1 }}>
                <Icon name="check" size={20} color="white" />
                Complete Lesson
              </Button>
            ) : (
              <Pressable
                onPress={handleNextSection}
                style={[styles.navButton, styles.navButtonPrimary, { backgroundColor: theme.primary }]}
              >
                <ThemedText style={{ color: "white" }}>Next</ThemedText>
                <Icon name="chevron-right" size={20} color="white" />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => setShowChat(true)}
            style={[styles.helpButton, { backgroundColor: theme.accent + "20", borderColor: theme.accent }]}
          >
            <Icon name="help" size={20} color={theme.accent} />
            <ThemedText style={{ color: theme.accent, fontWeight: "600" }}>
              Have questions? Ask AI for help
            </ThemedText>
          </Pressable>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <ThemedView style={[styles.headerCard, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.headerTitle}>{module.title}</ThemedText>
          <ThemedText style={styles.headerDescription}>{module.description}</ThemedText>
          <View style={styles.headerMetadata}>
            <View style={styles.metadataItem}>
              <Icon name="time" size={16} color="rgba(255,255,255,0.9)" />
              <ThemedText style={styles.metadataText}>{module.duration}</ThemedText>
            </View>
            <View style={styles.metadataItem}>
              <Icon name="trophy" size={16} color="rgba(255,255,255,0.9)" />
              <ThemedText style={styles.metadataText}>{module.difficulty}</ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={styles.sectionTitle}>What You'll Learn</ThemedText>
          {module.topics.map((topic, index) => (
            <View key={index} style={styles.topicItem}>
              <View style={[styles.topicBullet, { backgroundColor: theme.accent }]} />
              <ThemedText style={styles.topicText}>{topic}</ThemedText>
            </View>
          ))}
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.cardHeader}>
            <Icon name="sparkles" size={24} color={theme.primary} />
            <ThemedText style={styles.cardTitle}>AI-Powered Learning</ThemedText>
          </View>
          <ThemedText style={[styles.contentText, { color: theme.textSecondary }]}>
            This lesson is generated just for you, adapted to your communication style preference. 
            Content is created by AI to help you understand important concepts about your child's care.
          </ThemedText>
          <View style={[styles.disclaimerBox, { backgroundColor: theme.warning + "15", borderColor: theme.warning }]}>
            <ThemedText style={[styles.disclaimerText, { color: theme.textSecondary }]}>
              This educational content is for informational purposes only and is not a substitute for professional medical advice. Always consult your child's healthcare team about specific medical decisions.
            </ThemedText>
          </View>
        </ThemedView>

        {module.progress > 0 && !module.completed && (
          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.sectionTitle}>Your Progress</ThemedText>
            <View style={[styles.progressBar, { backgroundColor: theme.backgroundDefault }]}>
              <View
                style={[styles.progressFill, { backgroundColor: theme.primary, width: `${module.progress}%` }]}
              />
            </View>
            <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
              {module.progress}% complete
            </ThemedText>
          </ThemedView>
        )}

        {module.completed ? (
          <ThemedView
            style={[styles.completedCard, { backgroundColor: theme.success + "20", borderColor: theme.success }]}
          >
            <Icon name="checkmark-circle" size={48} color={theme.success} />
            <ThemedText style={[styles.completedTitle, { color: theme.success }]}>
              Lesson Completed!
            </ThemedText>
            <ThemedText style={[styles.completedText, { color: theme.textSecondary }]}>
              Great work! You've mastered this topic. Tap below to review the lesson again.
            </ThemedText>
            <Button onPress={loadLesson} style={{ marginTop: Spacing.md }}>
              <Icon name="refresh" size={20} color="white" />
              Review Lesson
            </Button>
          </ThemedView>
        ) : (
          <Button onPress={loadLesson}>
            <Icon name="play" size={20} color="white" />
            {module.progress > 0 ? "Continue Learning" : "Start Learning"}
          </Button>
        )}
      </View>
    </ScreenScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "white",
  },
  headerDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "rgba(255,255,255,0.9)",
  },
  headerMetadata: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  metadataText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
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
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  topicItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  topicBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  topicText: {
    fontSize: 15,
    lineHeight: 22,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    textAlign: "center",
  },
  completedCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    gap: Spacing.md,
  },
  completedTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  completedText: {
    fontSize: 16,
    textAlign: "center",
  },
  loadingCard: {
    padding: Spacing["3xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.lg,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  loadingText: {
    fontSize: 15,
    textAlign: "center",
  },
  progressHeader: {
    gap: Spacing.sm,
  },
  lessonProgressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  lessonProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  lessonCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    gap: Spacing.lg,
  },
  lessonBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  lessonBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "white",
  },
  lessonTitle: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
  },
  lessonContent: {
    fontSize: 16,
    lineHeight: 26,
  },
  topicsPreview: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  topicsLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  takeawayCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  takeawayContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  takeawayLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  takeawayText: {
    fontSize: 15,
    lineHeight: 22,
  },
  tipsCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  tipRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tipNumber: {
    fontSize: 15,
    fontWeight: "600",
    width: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  navigationRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  navButtonPrimary: {
    flex: 1,
    justifyContent: "center",
    borderWidth: 0,
  },
  navButtonPlaceholder: {
    width: 100,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  videoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    gap: Spacing.md,
  },
  videoPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  videoInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  videoDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  videoDurationText: {
    fontSize: 13,
  },
  watchedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  videoHint: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  chatMessages: {
    gap: Spacing.md,
  },
  messageBubble: {
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  messageContent: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  inputCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    fontSize: 15,
    minHeight: 40,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimerBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
});
