import { Room } from "@features/chat/domain/entities/Message";
import { useRooms } from "@features/chat/presentation/hooks/useRooms";
import { useRouter } from "expo-router";
import { ChatTheme, clayShadow } from "@/constants/chat-theme";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function RoomsScreen() {
  const {
    rooms,
    isLoading,
    error,
    createRoom,
    isCreating,
    createError,
  } = useRooms();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [roomName, setRoomName] = useState("");

  const handleCreate = () => {
    if (!roomName.trim() || isCreating) return;
    createRoom(roomName.trim(), {
      onSuccess: () => {
        setRoomName("");
        setModalVisible(false);
      },
    });
  };

  const renderRoom = ({ item }: { item: Room }) => (
    <Pressable
      style={({ pressed }) => [styles.roomCard, pressed && styles.pressed]}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.roomIcon}>
        <Text style={styles.roomIconText}>✳</Text>
      </View>
      <View style={styles.roomDetails}>
        <Text numberOfLines={1} style={styles.roomName}>
          {item.name}
        </Text>
        <Text style={styles.roomDate}>
          Un espacio para conversar · {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={ChatTheme.clay} />
        <Text style={styles.loadingText}>Buscando tus salas…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        renderItem={renderRoom}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.intro}>
            <View style={styles.introPill}>
              <View style={styles.onlineDot} />
              <Text style={styles.introPillText}>TU PEQUEÑA COMUNIDAD</Text>
            </View>
            <Text style={styles.heading}>Tus espacios</Text>
            <Text style={styles.description}>
              Las buenas conversaciones empiezan en un lugar cómodo.
            </Text>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            <Text style={styles.sectionTitle}>SALAS</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>☁</Text>
            </View>
            <Text style={styles.emptyTitle}>Aún no hay salas</Text>
            <Text style={styles.empty}>
              Crea la primera y abre un espacio para conversar.
            </Text>
          </View>
        }
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Crear sala nueva"
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabText}>＋</Text>
        <Text style={styles.fabLabel}>Nueva sala</Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Cerrar diálogo"
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.dialog}>
            <View style={styles.dialogHandle} />
            <Text style={styles.dialogEyebrow}>NUEVO RINCÓN</Text>
            <Text style={styles.dialogTitle}>Dale un nombre</Text>
            <Text style={styles.dialogCopy}>
              Invita a tu gente a compartir este espacio.
            </Text>
            {createError && (
              <Text style={styles.dialogError}>{createError}</Text>
            )}
            <TextInput
              style={styles.dialogInput}
              placeholder="Ej. Cafecito de tarde"
              placeholderTextColor={ChatTheme.muted}
              value={roomName}
              onChangeText={setRoomName}
              autoFocus
              maxLength={50}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
            <View style={styles.dialogActions}>
              <Pressable
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.createBtn,
                  isCreating && styles.buttonDisabled,
                ]}
                onPress={handleCreate}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={ChatTheme.white} size="small" />
                ) : (
                  <Text style={styles.createText}>Crear sala</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChatTheme.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: ChatTheme.background,
  },
  loadingText: { marginTop: 12, color: ChatTheme.muted, fontSize: 14 },
  listContent: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingBottom: 112,
  },
  intro: { paddingTop: 24, paddingBottom: 12 },
  introPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: ChatTheme.sage,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#7A9B7F",
  },
  introPillText: {
    color: "#59745F",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  heading: {
    color: ChatTheme.ink,
    fontSize: 32,
    fontWeight: "800",
    marginTop: 15,
  },
  description: {
    maxWidth: 290,
    color: ChatTheme.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
  },
  errorBox: {
    backgroundColor: "#F8E3DF",
    borderRadius: 14,
    padding: 12,
    marginTop: 15,
  },
  errorText: { color: ChatTheme.error, fontSize: 13 },
  sectionTitle: {
    color: ChatTheme.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginTop: 28,
    marginBottom: 12,
  },
  roomCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ChatTheme.surface,
    borderRadius: 23,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    ...clayShadow,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ChatTheme.lavender,
    marginRight: 13,
  },
  roomIconText: { color: "#8C7CA2", fontSize: 24 },
  roomDetails: { flex: 1, minWidth: 0 },
  roomName: { color: ChatTheme.ink, fontSize: 16, fontWeight: "700" },
  roomDate: { color: ChatTheme.muted, fontSize: 11, marginTop: 5 },
  chevron: { color: ChatTheme.clay, fontSize: 27, marginLeft: 8 },
  pressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 25,
    backgroundColor: ChatTheme.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    ...clayShadow,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ChatTheme.butter,
  },
  emptyIconText: { color: ChatTheme.clay, fontSize: 32 },
  emptyTitle: {
    color: ChatTheme.ink,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },
  empty: {
    color: ChatTheme.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 21,
    borderRadius: 22,
    backgroundColor: ChatTheme.clay,
    ...clayShadow,
  },
  fabText: { color: ChatTheme.white, fontSize: 22, fontWeight: "400" },
  fabLabel: { color: ChatTheme.white, fontSize: 14, fontWeight: "700" },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(54, 45, 40, 0.32)",
    padding: 14,
  },
  dialog: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    backgroundColor: ChatTheme.surface,
    borderRadius: 29,
    padding: 23,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    ...clayShadow,
  },
  dialogHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 4,
    backgroundColor: ChatTheme.line,
    marginBottom: 22,
  },
  dialogEyebrow: {
    color: ChatTheme.clayDark,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  dialogTitle: {
    color: ChatTheme.ink,
    fontSize: 25,
    fontWeight: "800",
    marginTop: 7,
  },
  dialogCopy: {
    color: ChatTheme.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    marginBottom: 18,
  },
  dialogError: { color: ChatTheme.error, fontSize: 13, marginBottom: 10 },
  dialogInput: {
    minHeight: 56,
    backgroundColor: ChatTheme.surfaceWarm,
    borderWidth: 1,
    borderColor: ChatTheme.line,
    borderRadius: 17,
    paddingHorizontal: 15,
    color: ChatTheme.ink,
    fontSize: 15,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 11,
    marginTop: 18,
  },
  cancelBtn: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  cancelText: { color: ChatTheme.muted, fontSize: 14, fontWeight: "600" },
  createBtn: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ChatTheme.clay,
    borderRadius: 16,
    paddingHorizontal: 19,
  },
  createText: { color: ChatTheme.white, fontSize: 14, fontWeight: "700" },
  buttonDisabled: { opacity: 0.6 },
});

