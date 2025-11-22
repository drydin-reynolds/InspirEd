import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Visit = {
  id: string;
  date: Date;
  doctorName: string;
  duration: number;
  audioUri: string;
  summary: string | null;
  keyPoints: string[];
  diagnoses: string[];
  actions: string[];
  medicalTerms: { term: string; explanation: string }[];
  isProcessing: boolean;
};

export type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

export type Question = {
  id: string;
  text: string;
  checked: boolean;
};

export type PDFSource = {
  id: string;
  title: string;
  uploadDate: Date;
  fileSize: string;
  status: "processing" | "ready";
};

export type LearningModule = {
  id: string;
  title: string;
  category: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  completed: boolean;
  topics: string[];
};

type AppContextType = {
  userName: string;
  setUserName: (name: string) => void;
  selectedAvatar: number;
  setSelectedAvatar: (index: number) => void;
  readingLevel: number;
  setReadingLevel: (level: number) => Promise<void>;
  recordingQuality: "high" | "medium";
  setRecordingQuality: (quality: "high" | "medium") => void;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  isLoading: boolean;
  onboardingCompleted: boolean;
  completeOnboarding: () => Promise<void>;
  visits: Visit[];
  addVisit: (visit: Visit) => void;
  updateVisit: (id: string, updates: Partial<Visit>) => void;
  chatMessages: { [visitId: string]: Message[] };
  addChatMessage: (visitId: string, message: Message) => void;
  plannerQuestions: Question[];
  addPlannerQuestion: (question: Question) => void;
  updatePlannerQuestion: (id: string, updates: Partial<Question>) => void;
  deletePlannerQuestion: (id: string) => void;
  pdfSources: PDFSource[];
  addPDFSource: (source: PDFSource) => void;
  deletePDFSource: (id: string) => void;
  learningModules: LearningModule[];
  updateModuleProgress: (id: string, progress: number) => void;
  completeModule: (id: string) => void;
  educationChatMessages: Message[];
  addEducationChatMessage: (message: Message) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: "@InspirEd:onboardingCompleted",
  READING_LEVEL: "@InspirEd:readingLevel",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Parent");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [readingLevel, setReadingLevel] = useState(8);
  const [recordingQuality, setRecordingQuality] = useState<"high" | "medium">("high");
  const [autoSave, setAutoSave] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [chatMessages, setChatMessages] = useState<{ [visitId: string]: Message[] }>({});
  const [plannerQuestions, setPlannerQuestions] = useState<Question[]>([]);
  const [pdfSources, setPDFSources] = useState<PDFSource[]>([]);
  const [educationChatMessages, setEducationChatMessages] = useState<Message[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([
    {
      id: "1",
      title: "Understanding Pulmonary Function Tests",
      category: "Diagnostics",
      description: "Learn how to read and understand your child's lung function test results.",
      duration: "15 min",
      difficulty: "Beginner",
      progress: 0,
      completed: false,
      topics: ["PFT", "Spirometry", "Test Results", "Normal Ranges"],
    },
    {
      id: "2",
      title: "Managing Daily Medications",
      category: "Treatment",
      description: "Best practices for administering respiratory medications to children.",
      duration: "20 min",
      difficulty: "Beginner",
      progress: 0,
      completed: false,
      topics: ["Inhalers", "Nebulizers", "Medication Schedule", "Side Effects"],
    },
    {
      id: "3",
      title: "Recognizing Warning Signs",
      category: "Emergency",
      description: "Know when to call the doctor and when to seek emergency care.",
      duration: "12 min",
      difficulty: "Beginner",
      progress: 0,
      completed: false,
      topics: ["Symptoms", "Emergency Signs", "When to Call", "Action Plan"],
    },
    {
      id: "4",
      title: "Nutrition for Lung Health",
      category: "Lifestyle",
      description: "Foods and nutrients that support respiratory health in children.",
      duration: "18 min",
      difficulty: "Intermediate",
      progress: 0,
      completed: false,
      topics: ["Nutrition", "Inflammation", "Immune System", "Meal Planning"],
    },
    {
      id: "5",
      title: "Physical Activity Guidelines",
      category: "Lifestyle",
      description: "Safe exercise and activity recommendations for children with pulmonary conditions.",
      duration: "15 min",
      difficulty: "Intermediate",
      progress: 0,
      completed: false,
      topics: ["Exercise", "Sports", "Safety", "Benefits"],
    },
    {
      id: "6",
      title: "Advanced Treatment Options",
      category: "Treatment",
      description: "Explore newer therapies and clinical trial opportunities.",
      duration: "25 min",
      difficulty: "Advanced",
      progress: 0,
      completed: false,
      topics: ["Clinical Trials", "New Therapies", "Research", "Specialists"],
    },
  ]);

  const addVisit = (visit: Visit) => {
    setVisits((prev) => [visit, ...prev]);
  };

  const updateVisit = (id: string, updates: Partial<Visit>) => {
    setVisits((prev) =>
      prev.map((visit) => (visit.id === id ? { ...visit, ...updates } : visit))
    );
  };

  const addChatMessage = (visitId: string, message: Message) => {
    setChatMessages((prev) => ({
      ...prev,
      [visitId]: [...(prev[visitId] || []), message],
    }));
  };

  const addPlannerQuestion = (question: Question) => {
    setPlannerQuestions((prev) => [...prev, question]);
  };

  const updatePlannerQuestion = (id: string, updates: Partial<Question>) => {
    setPlannerQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deletePlannerQuestion = (id: string) => {
    setPlannerQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const addPDFSource = (source: PDFSource) => {
    setPDFSources((prev) => [source, ...prev]);
  };

  const deletePDFSource = (id: string) => {
    setPDFSources((prev) => prev.filter((s) => s.id !== id));
  };

  const updateModuleProgress = (id: string, progress: number) => {
    setLearningModules((prev) =>
      prev.map((module) =>
        module.id === id ? { ...module, progress, completed: progress >= 100 } : module
      )
    );
  };

  const completeModule = (id: string) => {
    setLearningModules((prev) =>
      prev.map((module) => (module.id === id ? { ...module, progress: 100, completed: true } : module))
    );
  };

  const addEducationChatMessage = (message: Message) => {
    setEducationChatMessages((prev) => [...prev, message]);
  };

  const completeOnboarding = async () => {
    setOnboardingCompleted(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, "true");
    } catch (error) {
      console.error("Error saving onboarding completion:", error);
      throw error;
    }
  };

  const updateReadingLevel = async (level: number) => {
    setReadingLevel(level);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.READING_LEVEL, level.toString());
    } catch (error) {
      console.error("Error saving reading level:", error);
      throw error;
    }
  };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const [storedOnboarding, storedLevel] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
          AsyncStorage.getItem(STORAGE_KEYS.READING_LEVEL),
        ]);

        if (storedOnboarding === "true") {
          setOnboardingCompleted(true);
        }

        if (storedLevel) {
          setReadingLevel(parseInt(storedLevel, 10));
        }
      } catch (error) {
        console.error("Error loading stored data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        selectedAvatar,
        setSelectedAvatar,
        readingLevel,
        setReadingLevel: updateReadingLevel,
        recordingQuality,
        setRecordingQuality,
        autoSave,
        setAutoSave,
        isAdmin,
        setIsAdmin,
        isLoading,
        onboardingCompleted,
        completeOnboarding,
        visits,
        addVisit,
        updateVisit,
        chatMessages,
        addChatMessage,
        plannerQuestions,
        addPlannerQuestion,
        updatePlannerQuestion,
        deletePlannerQuestion,
        pdfSources,
        addPDFSource,
        deletePDFSource,
        learningModules,
        updateModuleProgress,
        completeModule,
        educationChatMessages,
        addEducationChatMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
