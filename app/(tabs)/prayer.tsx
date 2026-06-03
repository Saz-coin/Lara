import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { usePrayers } from "@/context/PrayerContext";
import { useColors } from "@/hooks/useColors";

function AddPrayerModal({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const { addPrayer } = usePrayers();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const insets = useSafeAreaInsets();

  const handleAdd = () => {
    if (!title.trim()) return;
    addPrayer(title.trim(), desc.trim());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTitle("");
    setDesc("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            طلب صلاة جديد
          </Text>
          <TextInput
            style={[
              styles.modalInput,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="عنوان الطلب..."
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            textAlign="right"
          />
          <TextInput
            style={[
              styles.modalInput,
              styles.modalTextarea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="تفاصيل إضافية (اختياري)..."
            placeholderTextColor={colors.mutedForeground}
            value={desc}
            onChangeText={setDesc}
            multiline
            textAlignVertical="top"
            textAlign="right"
          />
          <View style={styles.modalActions}>
            <Pressable
              onPress={onClose}
              style={[styles.modalBtn, { backgroundColor: colors.secondary }]}
            >
              <Text style={[styles.modalBtnText, { color: colors.foreground }]}>إلغاء</Text>
            </Pressable>
            <Pressable
              onPress={handleAdd}
              style={[
                styles.modalBtn,
                { backgroundColor: title.trim() ? colors.purple : colors.muted, flex: 1 },
              ]}
            >
              <Text style={[styles.modalBtnText, { color: "#fff" }]}>إضافة</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function PrayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { prayers, toggleAnswered, deletePrayer } = usePrayers();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "answered">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84;

  const filtered = prayers.filter((p) => {
    if (filter === "active") return !p.answered;
    if (filter === "answered") return p.answered;
    return true;
  });

  const answeredCount = prayers.filter((p) => p.answered).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: bottomPad,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={[styles.screenTitle, { color: colors.foreground }]}>
              طلبات الصلاة
            </Text>

            <LinearGradient
              colors={[colors.purple, colors.lightPurple]}
              style={styles.statsCard}
            >
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{prayers.length}</Text>
                <Text style={styles.statLabel}>الكل</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{prayers.length - answeredCount}</Text>
                <Text style={styles.statLabel}>نشط</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: "rgba(255,255,255,0.3)" }]} />
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{answeredCount}</Text>
                <Text style={styles.statLabel}>أُجيب</Text>
              </View>
            </LinearGradient>

            <View style={styles.filterRow}>
              {(["all", "active", "answered"] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: filter === f ? colors.purple : colors.card,
                      borderColor: filter === f ? colors.purple : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterLabel,
                      { color: filter === f ? "#fff" : colors.foreground },
                    ]}
                  >
                    {f === "all" ? "الكل" : f === "active" ? "النشطة" : "المجابة"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="book-open" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              لا توجد طلبات بعد
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              أضف طلبات صلاتك الشخصية
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onLongPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert("حذف الطلب", "هل تريد حذف هذا الطلب؟", [
                { text: "إلغاء", style: "cancel" },
                {
                  text: "حذف",
                  style: "destructive",
                  onPress: () => deletePrayer(item.id),
                },
              ]);
            }}
            style={[
              styles.prayerCard,
              {
                backgroundColor: item.answered ? colors.muted : colors.card,
                borderColor: item.answered ? colors.border : colors.purple + "33",
                opacity: item.answered ? 0.85 : 1,
              },
            ]}
          >
            <Pressable
              onPress={() => {
                toggleAnswered(item.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.checkBtn,
                {
                  backgroundColor: item.answered ? colors.accent : "transparent",
                  borderColor: item.answered ? colors.accent : colors.border,
                },
              ]}
            >
              {item.answered && <Feather name="check" size={14} color="#fff" />}
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.prayerTitle,
                  {
                    color: colors.foreground,
                    textDecorationLine: item.answered ? "line-through" : "none",
                  },
                ]}
              >
                {item.title}
              </Text>
              {item.description.length > 0 && (
                <Text style={[styles.prayerDesc, { color: colors.mutedForeground }]}>
                  {item.description}
                </Text>
              )}
              <Text style={[styles.prayerDate, { color: colors.mutedForeground }]}>
                {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "long",
                })}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => setShowModal(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: colors.purple,
            bottom: bottomPad - 30,
            opacity: pressed ? 0.85 : 1,
          },
        ]}
      >
        <Feather name="plus" size={24} color="#fff" />
      </Pressable>

      <AddPrayerModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 26, fontFamily: "Inter_700Bold", marginBottom: 16, textAlign: "right" },
  statsCard: { borderRadius: 20, padding: 20, flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  statItem: { alignItems: "center", gap: 4 },
  statNum: { fontSize: 24, fontFamily: "Inter_700Bold", color: "#fff" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  statDivider: { width: 1, height: 40, alignSelf: "center" },
  filterRow: { flexDirection: "row", gap: 8, marginBottom: 16, justifyContent: "flex-end" },
  filterChip: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1 },
  filterLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  prayerCard: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  checkBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  prayerTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold", textAlign: "right", marginBottom: 4 },
  prayerDesc: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "right", marginBottom: 4, lineHeight: 20 },
  prayerDate: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontFamily: "Inter_700Bold", textAlign: "right", marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 12 },
  modalTextarea: { height: 90, textAlignVertical: "top" },
  modalActions: { flexDirection: "row", gap: 10 },
  modalBtn: { borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 },
  modalBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
