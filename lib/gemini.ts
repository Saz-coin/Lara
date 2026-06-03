const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export async function sendMessage(
  userMessage: string,
  history: Message[]
): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/lara/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: userMessage,
      history: history.map((m) => ({ role: m.role, content: m.content })),
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => "");
    throw new Error(`Server error ${response.status}: ${err}`);
  }

  const data = (await response.json()) as { reply?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.reply ?? "عذراً، لم أتمكن من الإجابة.";
}

export const DAILY_VERSES = [
  { verse: "لأَنَّهُ هكَذَا أَحَبَّ اللهُ الْعَالَمَ حَتَّى بَذَلَ ابْنَهُ الْوَحِيدَ", ref: "يوحنا 3: 16" },
  { verse: "اَلرَّبُّ رَاعِيَّ فَلاَ يُعْوِزُنِي شَيْءٌ", ref: "مزمور 23: 1" },
  { verse: "أَسْتَطِيعُ كُلَّ شَيْءٍ فِي الْمَسِيحِ الَّذِي يُقَوِّينِي", ref: "فيلبي 4: 13" },
  { verse: "اَللهُ مَحَبَّةٌ", ref: "1 يوحنا 4: 8" },
  { verse: "ثِقْ بِالرَّبِّ بِكُلِّ قَلْبِكَ وَلاَ تَعْتَمِدْ عَلَى فَهْمِكَ", ref: "أمثال 3: 5" },
  { verse: "إِنِّي أَنَا مَعَكَ وَأَحْفَظُكَ فِي كُلِّ مَكَان", ref: "تكوين 28: 15" },
  { verse: "تَعَالَوْا إِلَيَّ يَا جَمِيعَ الْمُتْعَبِينَ وَالثَّقِيلِي الأَحْمَالِ وَأَنَا أُرِيحُكُمْ", ref: "متى 11: 28" },
  { verse: "لأَنَّ لِي أَفْكَارًا أَنَا أَعْرِفُهَا يَقُولُ الرَّبُّ أَفْكَارُ سَلاَمَة لاَ أَفْكَارُ شَرّ", ref: "إرميا 29: 11" },
  { verse: "الرَّبُّ نُورِي وَخَلاَصِي مَمَّنْ أَخَاف", ref: "مزمور 27: 1" },
  { verse: "وَكُلُّ شَيْءٍ مَا طَلَبْتُمُوهُ فِي الصَّلاَةِ مُؤْمِنِينَ تَنَالُونَهُ", ref: "متى 21: 22" },
  { verse: "أَنَا هُوَ الطَّرِيقُ وَالْحَقُّ وَالْحَيَاةُ", ref: "يوحنا 14: 6" },
  { verse: "وَنَحْنُ نَعْلَمُ أَنَّ كُلَّ الأَشْيَاءِ تَعْمَلُ مَعًا لِلْخَيْرِ لِلَّذِينَ يُحِبُّونَ اللهَ", ref: "رومية 8: 28" },
  { verse: "لَيْسَ بِالْقُوَّةِ وَلاَ بِالْقُدْرَةِ بَلْ بِرُوحِي يَقُولُ رَبُّ الْجُنُودِ", ref: "زكريا 4: 6" },
  { verse: "فَرَحُوا بِهِ وَسَجَدُوا لَهُ", ref: "متى 28: 9" },
];

export function getDailyVerse(): { verse: string; ref: string } {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86400000
  );
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
