import React, { createContext, useContext, useState, ReactNode } from "react";

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

type AppContextType = {
  userName: string;
  setUserName: (name: string) => void;
  selectedAvatar: number;
  setSelectedAvatar: (index: number) => void;
  readingLevel: number;
  setReadingLevel: (level: number) => void;
  recordingQuality: "high" | "medium";
  setRecordingQuality: (quality: "high" | "medium") => void;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userName, setUserName] = useState("Parent");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [readingLevel, setReadingLevel] = useState(8);
  const [recordingQuality, setRecordingQuality] = useState<"high" | "medium">("high");
  const [autoSave, setAutoSave] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [chatMessages, setChatMessages] = useState<{ [visitId: string]: Message[] }>({});
  const [plannerQuestions, setPlannerQuestions] = useState<Question[]>([]);
  const [pdfSources, setPDFSources] = useState<PDFSource[]>([]);

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

  return (
    <AppContext.Provider
      value={{
        userName,
        setUserName,
        selectedAvatar,
        setSelectedAvatar,
        readingLevel,
        setReadingLevel,
        recordingQuality,
        setRecordingQuality,
        autoSave,
        setAutoSave,
        isAdmin,
        setIsAdmin,
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
