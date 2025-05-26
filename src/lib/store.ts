import { create } from "zustand";

type ChecklistItem = {
  id: string;
  description: string;
  completed: boolean;
};

export type ChecklistCategory = {
  name: string;
  items: ChecklistItem[];
};

interface AppState {
  appLanguage: "en" | "jp";
  setAppLanguage: (language: "en" | "jp") => void;

  translateState: {
    sourceText: string;
    translatedText: string;
    targetLanguage: string;
    isLoading: boolean;
  };
  setSourceText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setTargetLanguage: (language: string) => void;
  setTranslateLoading: (isLoading: boolean) => void;
  resetTranslateState: () => void;

  // Summarize tab state
  summarizeState: {
    sourceText: string;
    summarizedText: string;
    editedText: string;
    editAction: string | null;
    isLoading: boolean;
  };
  setSummarizeSourceText: (text: string) => void;
  setSummarizedText: (text: string) => void;
  setEditedText: (text: string) => void;
  setEditAction: (action: string | null) => void;
  setSummarizeLoading: (isLoading: boolean) => void;
  resetSummarizeState: () => void;

  // Extract tab state
  extractState: {
    uploadedFile: File | null;
    extractedText: string;
    translatedContent: string;
    targetLanguage: string;
    currentAction: "extract" | "translate" | null;
    isLoading: boolean;
    error: string | null;
  };
  setUploadedFile: (file: File | null) => void;
  setExtractedText: (text: string) => void;
  setTranslatedContent: (text: string) => void;
  setExtractTargetLanguage: (language: string) => void;
  setCurrentAction: (action: "extract" | "translate" | null) => void;
  setExtractLoading: (isLoading: boolean) => void;
  setExtractError: (error: string | null) => void;
  resetExtractState: () => void;

  // Checklist tab state
  checklistState: {
    checkList: string;
    context: string;
    isLoading: boolean;
  };
  setChecklistChecked: (checkList: string) => void;
  setChecklistLoading: (isLoading: boolean) => void;
  setChecklistContext: (context: string) => void;
  resetChecklistState: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  appLanguage: "en",
  setAppLanguage: (language) => set({ appLanguage: language }),

  translateState: {
    sourceText: "",
    translatedText: "",
    targetLanguage: "Vietnamese",
    isLoading: false,
  },
  setSourceText: (text) =>
    set((state) => ({
      translateState: { ...state.translateState, sourceText: text },
    })),
  setTranslatedText: (text) =>
    set((state) => ({
      translateState: { ...state.translateState, translatedText: text },
    })),
  setTargetLanguage: (language) =>
    set((state) => ({
      translateState: { ...state.translateState, targetLanguage: language },
    })),
  setTranslateLoading: (isLoading) =>
    set((state) => ({
      translateState: { ...state.translateState, isLoading },
    })),
  resetTranslateState: () =>
    set(() => ({
      translateState: {
        sourceText: "",
        translatedText: "",
        targetLanguage: "Vietnamese",
        isLoading: false,
      },
    })),

  // Summarize tab state
  summarizeState: {
    sourceText: "",
    summarizedText: "",
    editedText: "",
    editAction: null,
    isLoading: false,
  },
  setSummarizeSourceText: (text) =>
    set((state) => ({
      summarizeState: { ...state.summarizeState, sourceText: text },
    })),
  setSummarizedText: (text) =>
    set((state) => ({
      summarizeState: { ...state.summarizeState, summarizedText: text },
    })),
  setEditedText: (text) =>
    set((state) => ({
      summarizeState: { ...state.summarizeState, editedText: text },
    })),
  setEditAction: (action) =>
    set((state) => ({
      summarizeState: { ...state.summarizeState, editAction: action },
    })),
  setSummarizeLoading: (isLoading) =>
    set((state) => ({
      summarizeState: { ...state.summarizeState, isLoading },
    })),
  resetSummarizeState: () =>
    set(() => ({
      summarizeState: {
        sourceText: "",
        summarizedText: "",
        editedText: "",
        editAction: null,
        isLoading: false,
      },
    })),

  // Extract tab state
  extractState: {
    uploadedFile: null,
    extractedText: "",
    translatedContent: "",
    targetLanguage: "Vietnamese",
    currentAction: null,
    isLoading: false,
    error: null,
  },
  setUploadedFile: (file) =>
    set((state) => ({
      extractState: { ...state.extractState, uploadedFile: file },
    })),
  setExtractedText: (text) =>
    set((state) => ({
      extractState: { ...state.extractState, extractedText: text },
    })),
  setTranslatedContent: (text) =>
    set((state) => ({
      extractState: { ...state.extractState, translatedContent: text },
    })),
  setExtractTargetLanguage: (language) =>
    set((state) => ({
      extractState: { ...state.extractState, targetLanguage: language },
    })),

  setCurrentAction: (action) =>
    set((state) => ({
      extractState: { ...state.extractState, currentAction: action },
    })),
  setExtractLoading: (isLoading) =>
    set((state) => ({
      extractState: { ...state.extractState, isLoading },
    })),
  setExtractError: (error) =>
    set((state) => ({
      extractState: { ...state.extractState, error },
    })),
  resetExtractState: () =>
    set(() => ({
      extractState: {
        uploadedFile: null,
        extractedText: "",
        translatedContent: "",
        targetLanguage: "Vietnamese",
        currentAction: null,
        isLoading: false,
        error: null,
      },
    })),

  checklistState: {
    checkList: "",
    isLoading: false,
    context: "",
  },
  setChecklistChecked: (checkList) =>
    set((state) => ({
      checklistState: {
        ...state.checklistState,
        checkList,
      },
    })),
  setChecklistLoading: (isLoading) =>
    set((state) => ({
      checklistState: { ...state.checklistState, isLoading },
    })),
  setChecklistContext: (context) =>
    set((state) => ({
      checklistState: { ...state.checklistState, context },
    })),
  resetChecklistState: () =>
    set(() => ({
      checklistState: {
        checkList: "",
        isLoading: false,
        context: "",
      },
    })),
}));
