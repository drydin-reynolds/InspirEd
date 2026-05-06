import React, { useState } from "react";
import { View, StyleSheet, Pressable, TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenScrollView } from "@/components/ScreenScrollView";
import { Button } from "@/components/Button";
import { Icon } from "@/components/Icon";
import { MarkdownText } from "@/components/MarkdownText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useAppContext, LearningModule, Message, Citation } from "@/context/AppContext";
import { useNavigation } from "@react-navigation/native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { askEducationalQuestion } from "@/utils/gemini";
import { SearchBar } from "@/components/SearchBar";
import { assetToLearningModule } from "@/utils/assetConvertion"
import { openAssetPDF } from "../utils/openAsset";
import { useEffect } from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function EducationScreen() {
  const { theme } = useTheme();
    const { learningModules, setLearningModules, educationChatMessages, addEducationChatMessage, readingLevel, toggleModuleComplete } =
    useAppContext();
  const navigation = useNavigation<any>();

  const [showChat, setShowChat] = useState(false);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
    const [loadingRecommended, setLoadingRecommended] = useState(false);
    const moduleMap = new Map(
        learningModules.map((m) => [m.id, m])
    );

  const completedCount = learningModules.filter((m) => m.completed).length;
  const totalCount = learningModules.length;
  const overallProgress = Math.round((completedCount / totalCount) * 100);

    const categories = Array.from(new Set(learningModules.map((m) => m.category)));

    useEffect(() => {
        fetchRecommended();
    }, []);

  const handleAskQuestion = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    addEducationChatMessage(userMessage);
    const questionText = inputText.trim();
    setInputText("");
    setIsLoading(true);

    const conversationHistory = educationChatMessages.map(msg => ({
      text: msg.text,
      isUser: msg.isUser,
    }));

    const response = await askEducationalQuestion(
      questionText,
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

    addEducationChatMessage(aiMessage);
    setIsLoading(false);
    };

    const searchAssets = async (text: string) => {
        if (!text.trim()) {
            setResults([]);
            return;
        }
        
        const res = await fetch(
            process.env.EXPO_PUBLIC_API_URL +`/assets/search/query?q=${encodeURIComponent(text)}`
        );

        const data = await res.json();
        setResults(data);
    };


    const fetchRecommended = async () => {
        try {
            setLoadingRecommended(true);

            const res = await fetch(
                process.env.EXPO_PUBLIC_API_URL+"/assets/recommended"
            );

            const data = await res.json();

            const modules = data.map(assetToLearningModule);
            
            setLearningModules((prev) => {
                const existing = new Map(prev.map((m) => [m.id, m]));

                modules.forEach((m: LearningModule) => {
                    if (!existing.has(m.id)) {
                        existing.set(m.id, m);
                    }
                });

                return Array.from(existing.values());
            });
            
            setRecommended(data);

        } catch (err) {
            console.error("Error fetching recommended:", err);
        } finally {
            setLoadingRecommended(false);
        }
    };

  if (showChat) {
    return (
      <ScreenScrollView>
        <View style={styles.container}>
          <Pressable onPress={() => setShowChat(false)} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color={theme.primary} />
            <ThemedText style={{ color: theme.primary, fontSize: 16, fontWeight: "600" }}>
              Back to Learning
            </ThemedText>
          </Pressable>

          <ThemedView style={[styles.card, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={styles.cardHeader}>
              <Icon name="chat" size={24} color={theme.accent} />
              <ThemedText style={styles.cardTitle}>AI Learning Assistant</ThemedText>
            </View>
            <ThemedText style={[styles.helperText, { color: theme.textSecondary }]}>
              Ask questions about pulmonary health, treatments, or any medical term you'd like
              explained.
            </ThemedText>
          </ThemedView>

          <View style={styles.chatMessages}>
            {educationChatMessages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.messageBubble, msg.isUser && styles.userMessage]}
              >
                <View
                  style={[
                    styles.messageContent,
                    {
                      backgroundColor: msg.isUser ? theme.primary : theme.backgroundSecondary,
                    },
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
                {!msg.isUser && msg.citations && msg.citations.length > 0 ? (
                  <CitationSection citations={msg.citations} />
                ) : null}
              </View>
            ))}
            {isLoading && (
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
            <Button onPress={handleAskQuestion} disabled={!inputText.trim() || isLoading}>
              <Icon name="send" size={20} color="white" />
            </Button>
          </ThemedView>
        </View>
      </ScreenScrollView>
    );
  }

  return (
    <ScreenScrollView>
      <View style={styles.container}>
        <SearchBar
            value={searchText}
            onChangeText={(t) => {
                setSearchText(t);
                searchAssets(t);
            }}
            placeholder="Search modules..."
            onClear={() => {
                setSearchText("");
                setResults([]);
            }}
        />

        {results.map((item) => {
            const base = assetToLearningModule(item);
            const stored = moduleMap.get(base.id);

            return (
                <ModuleCard
                    key={base.id}
                    module={{
                        ...base,
                        completed: stored?.completed ?? false,
                        progress: stored?.progress ?? 0,
                    }}
                    onPress={() =>
                        openAssetPDF(item.title, "http://10.205.227.129:3000" + item.file_path)
                    }
                    onToggleComplete={toggleModuleComplete}
                />
            );
        })}
        
        <View style={styles.actionButtons}>
          <Button
            onPress={() => setShowChat(true)}
            style={{ flex: 1 }}
          >
            <Icon name="chat" size={20} color="white" />
            Ask AI
          </Button>

          <Pressable
            onPress={() => navigation.navigate("VideoLibrary")}
            style={[styles.exploreButton, { borderColor: theme.primary }]}
          >
            <Icon name="videocam" size={18} color={theme.primary} />
            <ThemedText style={{ color: theme.primary, fontWeight: "600" }}>
              Explore Videos
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.categorySection}>
            <ThemedText style={styles.categoryTitle}>
                Recommended for You
            </ThemedText>

            {loadingRecommended ? (
                <ThemedText style={{ color: theme.textSecondary }}>
                    Loading...
                </ThemedText>
            ) : recommended.length === 0 ? (
                <ThemedText style={{ color: theme.textSecondary }}>
                    No recommendations yet
                </ThemedText>
            ) : (
                recommended.map((item) => {
                    const base = assetToLearningModule(item);
                    const stored = moduleMap.get(base.id);

                    return (
                        <ModuleCard
                            key={base.id}
                            module={{
                                ...base,
                                completed: stored?.completed ?? false,
                                progress: stored?.progress ?? 0,
                            }}
                            onPress={() =>
                                openAssetPDF(
                                    item.title,
                                    "http://10.205.227.129:3000" + item.file_path
                                )
                            }
                            onToggleComplete={toggleModuleComplete}
                        />
                    );
                })
            )}
        </View>

      </View>
    </ScreenScrollView>
  );
}

function CitationSection({ citations }: { citations: Citation[] }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  if (citations.length === 0) return null;

  return (
    <View style={styles.citationContainer}>
      <Pressable 
        onPress={() => setExpanded(!expanded)} 
        style={[styles.citationHeader, { backgroundColor: theme.primary + '15' }]}
      >
        <Icon name="document-text" size={14} color={theme.primary} />
        <ThemedText style={[styles.citationHeaderText, { color: theme.primary }]}>
          {citations.length} source{citations.length > 1 ? 's' : ''} referenced
        </ThemedText>
        <Icon 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={14} 
          color={theme.primary} 
        />
      </Pressable>
      
      {expanded ? (
        <View style={[styles.citationList, { borderColor: theme.primary + '30' }]}>
          {citations.map((citation, index) => (
            <View 
              key={citation.id} 
              style={[
                styles.citationItem, 
                index < citations.length - 1 && { borderBottomColor: theme.border, borderBottomWidth: 1 }
              ]}
            >
              <View style={styles.citationBadge}>
                <ThemedText style={[styles.citationNumber, { color: theme.primary }]}>
                  [{index + 1}]
                </ThemedText>
              </View>
              <View style={styles.citationContent}>
                <ThemedText style={[styles.citationTitle, { color: theme.text }]}>
                  {citation.sourceTitle}
                </ThemedText>
                <ThemedText style={[styles.citationExcerpt, { color: theme.textSecondary }]}>
                  {citation.excerpt}
                </ThemedText>
                <ThemedText style={[styles.citationRelevance, { color: theme.primary }]}>
                  {citation.similarity}% relevance match
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ModuleCard({ module, onPress, onToggleComplete }: { module: LearningModule; onPress: () => void; onToggleComplete: (id: string) => void; }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Beginner") return theme.success;
    if (difficulty === "Intermediate") return theme.warning;
    return theme.error;
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
        styles.moduleCard,
        {
          backgroundColor: theme.backgroundSecondary,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.moduleHeader}>
        <View style={styles.moduleHeaderLeft}>
          <ThemedText style={styles.moduleTitle}>{module.title}</ThemedText>
          <ThemedText style={[styles.moduleDescription, { color: theme.textSecondary }]}>
            {module.description}
          </ThemedText>
        </View>
        {module.completed && (
          <View style={[styles.completedBadge, { backgroundColor: theme.success }]}>
            <Icon name="check" size={16} color="white" />
          </View>
        )}
      </View>

      <View style={styles.moduleFooter}>
        <View style={styles.moduleMetadata}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(module.difficulty) + "20" }]}>
            <ThemedText
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(module.difficulty) },
              ]}
            >
              {module.difficulty}
            </ThemedText>
          </View>
        </View>
        {module.progress > 0 && !module.completed && (
          <View style={styles.progressContainer}>
            <View style={[styles.miniProgressBar, { backgroundColor: theme.backgroundDefault }]}>
              <View
                style={[
                  styles.miniProgressFill,
                  {
                    backgroundColor: theme.primary,
                    width: `${module.progress}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={[styles.progressText, { color: theme.textSecondary }]}>
              {module.progress}%
            </ThemedText>
          </View>
        )}
          </View>

          <View style={styles.completeContainer}>
              <Pressable
                  onPress={() => onToggleComplete(module.id)}
                  style={[
                      styles.completeButton,
                      {
                          borderColor: module.completed ? theme.success : theme.border,
                          backgroundColor: module.completed ? theme.success + "20" : "transparent",
                      },
                  ]}
              >
                  <Icon
                      name={module.completed ? "checkmark-circle" : "circle"}
                      size={18}
                      color={module.completed ? theme.success : theme.textSecondary}
                  />
                  <ThemedText
                      style={{
                          color: module.completed ? theme.success : theme.textSecondary,
                          fontWeight: "600",
                      }}
                  >
                      {module.completed ? "Completed" : "Mark Complete"}
                  </ThemedText>
              </Pressable>
          </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "center",
  },
  exploreButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  progressCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  progressStats: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: Spacing.sm,
  },
  progressNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "white",
    lineHeight: 56,
  },
  progressLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
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
  categorySection: {
    gap: Spacing.md,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  moduleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  moduleHeaderLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  moduleTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  moduleDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  completedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  moduleFooter: {
    gap: Spacing.sm,
  },
  moduleMetadata: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
    completeContainer: {
        marginTop: Spacing.sm,
    },

    completeButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.sm,
        borderWidth: 1,
    },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: "600",
  },
  durationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  durationText: {
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  miniProgressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  miniProgressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    width: 35,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
  helperText: {
    fontSize: 14,
    lineHeight: 20,
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
  citationContainer: {
    marginTop: Spacing.sm,
  },
  citationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  citationHeaderText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  citationList: {
    marginTop: Spacing.xs,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  citationItem: {
    flexDirection: "row",
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  citationBadge: {
    width: 24,
  },
  citationNumber: {
    fontSize: 12,
    fontWeight: "700",
  },
  citationContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  citationTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  citationExcerpt: {
    fontSize: 11,
    lineHeight: 16,
  },
  citationRelevance: {
    fontSize: 10,
    fontWeight: "500",
  },
  searchResults: {
      marginTop: 8,
      gap: 12, 
  },
  searchItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#eee",
  }
});
