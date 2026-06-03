import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface PrayerItem {
  id: string;
  title: string;
  description: string;
  answered: boolean;
  createdAt: string;
}

interface PrayerContextType {
  prayers: PrayerItem[];
  addPrayer: (title: string, description: string) => void;
  toggleAnswered: (id: string) => void;
  deletePrayer: (id: string) => void;
}

const PrayerContext = createContext<PrayerContextType | null>(null);
const STORAGE_KEY = "@faith_ai_prayers";

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setPrayers(JSON.parse(raw));
    });
  }, []);

  const save = (updated: PrayerItem[]) => {
    setPrayers(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addPrayer = (title: string, description: string) => {
    const item: PrayerItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title,
      description,
      answered: false,
      createdAt: new Date().toISOString(),
    };
    save([item, ...prayers]);
  };

  const toggleAnswered = (id: string) => {
    save(prayers.map((p) => (p.id === id ? { ...p, answered: !p.answered } : p)));
  };

  const deletePrayer = (id: string) => {
    save(prayers.filter((p) => p.id !== id));
  };

  return (
    <PrayerContext.Provider value={{ prayers, addPrayer, toggleAnswered, deletePrayer }}>
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayers() {
  const ctx = useContext(PrayerContext);
  if (!ctx) throw new Error("usePrayers must be inside PrayerProvider");
  return ctx;
}
