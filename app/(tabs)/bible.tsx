import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { DAILY_VERSES, getDailyVerse } from "@/lib/gemini";

const CATEGORIES = [
  { id: "faith", label: "الإيمان", icon: "heart" as const },
  { id: "love", label: "المحبة", icon: "heart" as const },
  { id: "peace", label: "السلام", icon: "sun" as const },
  { id: "hope", label: "الرجاء", icon: "star" as const },
  { id: "strength", label: "القوة", icon: "zap" as const },
];

const VERSES_BY_CATEGORY: Record<string, { verse: string; ref: string }[]> = {
  faith: [
    { verse: "اَلإِيمَانُ هُوَ الثِّقَةُ بِمَا يُرْجَى وَالإِيقَانُ بِأُمُور لاَ تُرَى", ref: "عبرانيين 11: 1" },
    { verse: "ثِقْ بِالرَّبِّ بِكُلِّ قَلْبِكَ وَلاَ تَعْتَمِدْ عَلَى فَهْمِكَ", ref: "أمثال 3: 5" },
    { verse: "لأَنَّهُ بِالنِّعْمَةِ أَنْتُمْ مُخَلَّصُونَ بِالإِيمَانِ", ref: "أفسس 2: 8" },
  ],
  love: [
    { verse: "اَللهُ مَحَبَّةٌ وَمَنْ يَثْبُتُ فِي الْمَحَبَّةِ يَثْبُتُ فِي اللهِ", ref: "1 يوحنا 4: 16" },
    { verse: "لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ", ref: "يوحنا 3: 16" },
    { verse: "أَحِبُّوا بَعْضُكُمْ بَعْضًا كَمَا أَحْبَبْتُكُمْ", ref: "يوحنا 15: 12" },
  ],
  peace: [
    { verse: "سَلاَمًا أَتْرُكُ لَكُمْ. سَلاَمِي أُعْطِيكُمْ", ref: "يوحنا 14: 27" },
    { verse: "وَسَلاَمُ اللهِ الَّذِي يَفُوقُ كُلَّ عَقْل", ref: "فيلبي 4: 7" },
    { verse: "تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَأَنَا أُرِيحُكُمْ", ref: "متى 11: 28" },
  ],
  hope: [
    { verse: "لأَنَّ لِي أَفْكَارًا أَنَا أَعْرِفُهَا يَقُولُ الرَّبُّ أَفْكَارُ سَلاَمَة", ref: "إرميا 29: 11" },
    { verse: "وَالرَّجَاءُ لاَ يُخْزِي لأَنَّ مَحَبَّةَ اللهِ قَدِ انْسَكَبَتْ فِي قُلُوبِنَا", ref: "رومية 5: 5" },
  ],
  strength: [
    { verse: "أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي", ref: "فيلبي 4: 13" },
    { verse: "لَيْسَ بِالْقُوَّةِ وَلاَ بِالْقُدْرَةِ بَلْ بِرُوحِي يَقُولُ رَبُّ الْجُنُودِ", ref: "زكريا 4: 6" },
  ],
};

function VerseCard({ verse, ref: refText, colors, big }: { verse: string; ref: string; colors: ReturnType<typeof useColors>; big?: boolean }) {
  return (
    <View style={[styles.verseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.crossIcon, { color: colors.accent }]}>✝</Text>
      <Text style={[styles.verseCardText, { color: colors.foreground, fontSize: big ? 17 : 15 }]}>
        "{verse}"
      </Text>
      <Text style={[styles.verseCardRef, { color: colors.accent }]}>{refText}</Text>
    </View>
  );
}

export default function BibleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const daily = getDailyVerse();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const searchResults = search.length > 1
    ? DAILY_VERSES.filter(
        (v) => v.verse.includes(search) || v.ref.includes(search)
      )
    : null;

  const categoryVerses = activeCategory ? VERSES_BY_CATEGORY[activeCategory] : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: topPad + 16, paddingBottom: bottomPad, paddingHorizontal: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>الكتاب المقدس</Text>

      <LinearGradient
        colors={[colors.purple, colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dailyCard}
      >
        <Text style={styles.dailyLabel}>آية اليوم</Text>
        <Text style={styles.dailyVerse}>"{daily.verse}"</Text>
        <Text style={styles.dailyRef}>{daily.ref}</Text>
      </LinearGradient>

      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="ابحث في الآيات..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch("")}>
            <Feather name="x" size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {searchResults ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            {searchResults.length} نتيجة
          </Text>
          {searchResults.map((v, i) => (
            <VerseCard key={i} verse={v.verse} ref={v.ref} colors={colors} />
          ))}
          {searchResults.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="book-open" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                لا توجد نتائج
              </Text>
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            المواضيع
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: activeCategory === cat.id ? colors.purple : colors.card,
                    borderColor: activeCategory === cat.id ? colors.purple : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catLabel,
                    { color: activeCategory === cat.id ? "#fff" : colors.foreground },
                  ]}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {categoryVerses ? (
            categoryVerses.map((v, i) => (
              <VerseCard key={i} verse={v.verse} ref={v.ref} colors={colors} />
            ))
          ) : (
            <>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground, marginTop: 16 }]}>
                آيات مختارة
              </Text>
              {DAILY_VERSES.slice(0, 6).map((v, i) => (
                <VerseCard key={i} verse={v.verse} ref={v.ref} colors={colors} />
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 16, textAlign: "right" },
  dailyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  dailyLabel: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  dailyVerse: { color: "#fff", fontSize: 16, fontFamily: "Inter_500Medium", lineHeight: 26, fontStyle: "italic", marginBottom: 10, textAlign: "right" },
  dailyRef: { color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "right" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "right" },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 10, textAlign: "right" },
  catScroll: { marginBottom: 16 },
  catChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
  },
  catLabel: { fontSize: 14, fontFamily: "Inter_500Medium" },
  verseCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  crossIcon: { fontSize: 16, marginBottom: 8, textAlign: "right" },
  verseCardText: { fontFamily: "Inter_400Regular", lineHeight: 24, fontStyle: "italic", textAlign: "right", marginBottom: 8 },
  verseCardRef: { fontSize: 13, fontFamily: "Inter_700Bold", textAlign: "right" },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
