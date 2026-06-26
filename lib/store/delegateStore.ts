"use client";

import { create } from "zustand";
import type { CountryIntel, NewsDigest, RelationSuggestion, SpeechDraft, StanceAnalysis } from "@/lib/ai/schemas";
import type { Kit } from "@/lib/types";

type DraftKit = {
  name: string;
  committee: string;
  customCommitteeName: string;
  customCommitteeDescription: string;
  country: string;
  topic: string;
  roster: string[];
};

type DelegateState = {
  kits: Kit[];
  activeKit?: Kit;
  draft: DraftKit;
  intel?: CountryIntel;
  relations: RelationSuggestion[];
  news?: NewsDigest;
  stance?: StanceAnalysis;
  speech?: SpeechDraft;
  driveToken?: string;
  setDraft: (draft: Partial<DraftKit>) => void;
  setKits: (kits: Kit[]) => void;
  setActiveKit: (kit?: Kit) => void;
  setIntel: (intel: CountryIntel) => void;
  setRelations: (relations: RelationSuggestion[]) => void;
  updateRelation: (country: string, relation: RelationSuggestion) => void;
  setNews: (news: NewsDigest) => void;
  setStance: (stance: StanceAnalysis) => void;
  setSpeech: (speech: SpeechDraft) => void;
  addSavedSpeech: (speech: SpeechDraft) => void;
  updateSavedSpeech: (speech: SpeechDraft) => void;
  deleteSavedSpeech: (speechId: string) => void;
  setDriveToken: (token?: string) => void;
};

export const useDelegateStore = create<DelegateState>((set) => ({
  kits: [],
  draft: {
    name: "Crisis-ready MUN",
    committee: "unga",
    customCommitteeName: "",
    customCommitteeDescription: "",
    country: "",
    topic: "Responsible AI governance",
    roster: ["Brazil", "France", "Germany", "Japan", "Kenya", "Mexico", "South Africa", "United Kingdom", "United States"],
  },
  relations: [],
  setDraft: (draft) => set((state) => ({ draft: { ...state.draft, ...draft } })),
  setKits: (kits) => set({ kits }),
  setActiveKit: (kit) => set({ activeKit: kit }),
  setIntel: (intel) => set({ intel }),
  setRelations: (relations) => set({ relations }),
  updateRelation: (country, relation) =>
    set((state) => ({
      relations: state.relations.map((item) => (item.country === country ? relation : item)),
    })),
  setNews: (news) => set({ news }),
  setStance: (stance) => set({ stance }),
  setSpeech: (speech) => set({ speech }),
  addSavedSpeech: (speech) =>
    set((state) => ({
      activeKit: state.activeKit
        ? {
            ...state.activeKit,
            speeches: [speech, ...(state.activeKit.speeches ?? []).filter((item) => item.id !== speech.id)],
          }
        : state.activeKit,
    })),
  updateSavedSpeech: (speech) =>
    set((state) => ({
      speech: state.speech?.id === speech.id ? speech : state.speech,
      activeKit: state.activeKit
        ? {
            ...state.activeKit,
            speeches: (state.activeKit.speeches ?? []).map((item) => (item.id === speech.id ? speech : item)),
          }
        : state.activeKit,
    })),
  deleteSavedSpeech: (speechId) =>
    set((state) => ({
      speech: state.speech?.id === speechId ? undefined : state.speech,
      activeKit: state.activeKit
        ? {
            ...state.activeKit,
            speeches: (state.activeKit.speeches ?? []).filter((item) => item.id !== speechId),
          }
        : state.activeKit,
    })),
  setDriveToken: (token) => set({ driveToken: token }),
}));
