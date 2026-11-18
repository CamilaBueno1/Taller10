import { decode } from "base64-arraybuffer";
import { ChatImageAttachment, Message } from "@features/chat/domain/entities/Message";
import { useChat } from "@features/chat/presentation/hooks/useChat";
import { useLocalSearchParams } from "expo-router";
import { ChatTheme, clayShadow } from "@/constants/chat-theme";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuthStore } from "@features/auth/presentation/store/authStore";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const IMAGE_FORMATS: Record<
  string,
  Pick<ChatImageAttachment, "contentType" | "extension">
> = {
  "image/jpeg": { contentType: "image/jpeg", extension: "jpg" },
  "image/jpg": { contentType: "image/jpeg", extension: "jpg" },
  "image/png": { contentType: "image/png", extension: "png" },
  "image/webp": { contentType: "image/webp", extension: "webp" },
};

interface PendingImage {
  uri: string;
  base64: string;
  contentType: string;
  extension: ChatImageAttachment["extension"];
}

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messages, sendMessage, isLoading, isSending, sendError } =
    useChat(roomId);
  const user = useAuthStore((s) => s.user);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        base64: true,
        exif: false,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      if (!asset.base64) {
        Alert.alert("No se pudo leer la imagen", "Elige otra foto e inténtalo de nuevo.");
        return;
      }

      const mimeType = asset.mimeType?.toLowerCase();
      const extension = asset.fileName?.split(".").pop()?.toLowerCase();
      const extensionFormat =
        extension === "jpeg"
          ? IMAGE_FORMATS["image/jpeg"]
          : Object.values(IMAGE_FORMATS).find(
              (item) => item.extension === extension,
            );
      const format = mimeType
        ? IMAGE_FORMATS[mimeType]
        : extensionFormat;

      if (!format) {
        Alert.alert(
          "Formato no compatible",
          "Elige una imagen JPG, PNG o WebP.",
        );
        return;
      }

      const approximateSize = Math.floor((asset.base64.length * 3) / 4);
      if (Math.max(asset.fileSize ?? 0, approximateSize) > MAX_IMAGE_SIZE_BYTES) {
        Alert.alert(
          "La imagen es muy grande",
          "El tamaño máximo permitido es 5 MB.",
        );
        return;
      }

      setPendingImage({
        uri: asset.uri,
        base64: asset.base64,
        contentType: format.contentType,
        extension: format.extension,
      });
    } catch (error) {
      Alert.alert(
        "No se pudo abrir la galería",
        error instanceof Error
          ? error.message
          : "Inténtalo de nuevo en unos momentos.",
      );
    }
  }, []);

  const handleSend = useCallback(() => {
    const content = input.trim();
    if ((!content && !pendingImage) || isSending) return;

    try {
      const image = pendingImage
        ? {
            data: decode(pendingImage.base64),
            contentType: pendingImage.contentType,
            extension: pendingImage.extension,
          }
        : undefined;

      sendMessage(
        { content, image, previewUri: pendingImage?.uri },
        {
          onSuccess: () => {
            setInput("");
            setPendingImage(null);
          },
        },
      );
    } catch (error) {
      Alert.alert(
        "No se pudo preparar la imagen",
        error instanceof Error ? error.message : "Inténtalo de nuevo.",
      );
    }
  }, [input, isSending, pendingImage, sendMessage]);

  const renderMsg = ({ item }: { item: Message }) => {
    const isOwn = item.userId === user?.id;
    return (
      <View style={[styles.row, isOwn && styles.rowOwn]}>
        <View style={[styles.bubble, isOwn ? styles.own : styles.other]}>
          {!isOwn && (
            <Text style={styles.author}>{item.authorUsername ?? "Alguien"}</Text>
          )}
          {item.imageUrl && (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
              accessibilityLabel="Imagen compartida en el chat"
            />
          )}
          {!!item.content && (
            <Text style={[styles.text, isOwn && styles.textOwn]}>
              {item.content}
            </Text>
          )}
          <Text style={[styles.time, isOwn && styles.timeOwn]}>
            {item.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={styles.chatIntro}>
        <View style={styles.chatIntroIcon}>
          <Text style={styles.chatIntroEmoji}>☁</Text>
        </View>
        <View style={styles.chatIntroCopy}>
          <Text style={styles.chatIntroTitle}>Un espacio tranquilo</Text>
          <Text style={styles.chatIntroSubtitle}>
            Comparte una idea, una foto o un saludo.
          </Text>
        </View>
        <View style={styles.onlineDot} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(message) => message.id}
        renderItem={renderMsg}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color={ChatTheme.clay} />
              <Text style={styles.emptyText}>Cargando la conversación…</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>✿</Text>
              <Text style={styles.emptyTitle}>La charla empieza aquí</Text>
              <Text style={styles.emptyText}>
                Envía el primer mensaje o comparte una imagen.
              </Text>
            </View>
          )
        }
      />

      {pendingImage && (
        <View style={styles.previewCard}>
          <Image
            source={{ uri: pendingImage.uri }}
            style={styles.previewImage}
            resizeMode="cover"
            accessibilityLabel="Vista previa de la imagen seleccionada"
          />
          <View style={styles.previewCopy}>
            <Text style={styles.previewTitle}>Lista para compartir</Text>
            <Text style={styles.previewHint}>Se enviará con tu mensaje</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quitar imagen"
            onPress={() => setPendingImage(null)}
            style={styles.removeImage}
          >
            <Text style={styles.removeImageText}>×</Text>
          </Pressable>
        </View>
      )}

      {sendError && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{sendError}</Text>
        </View>
      )}

      <View style={styles.composerShell}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adjuntar una imagen"
          style={({ pressed }) => [
            styles.attachButton,
            pressed && styles.pressed,
          ]}
          onPress={pickImage}
          disabled={isSending}
        >
          <Text style={styles.attachIcon}>＋</Text>
        </Pressable>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe algo bonito…"
          placeholderTextColor={ChatTheme.muted}
          multiline
          maxLength={500}
          editable={!isSending}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar mensaje"
          style={({ pressed }) => [
            styles.sendButton,
            (!input.trim() && !pendingImage || isSending) &&
              styles.sendButtonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={handleSend}
          disabled={(!input.trim() && !pendingImage) || isSending}
        >
          {isSending ? (
            <ActivityIndicator color={ChatTheme.white} size="small" />
          ) : (
            <Text style={styles.sendIcon}>➤</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: ChatTheme.background },
  chatIntro: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    marginBottom: 8,
    padding: 13,
    borderRadius: 21,
    backgroundColor: ChatTheme.surface,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    ...clayShadow,
  },
  chatIntroIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: ChatTheme.sage,
    marginRight: 11,
  },
  chatIntroEmoji: { color: ChatTheme.clay, fontSize: 24 },
  chatIntroCopy: { flex: 1 },
  chatIntroTitle: { color: ChatTheme.ink, fontSize: 14, fontWeight: "700" },
  chatIntroSubtitle: { color: ChatTheme.muted, fontSize: 11, marginTop: 3 },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: "#8BAF8F",
    marginLeft: 6,
  },
  messageList: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  emptyState: {
    flex: 1,
    minHeight: 180,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  emptyEmoji: { color: ChatTheme.clay, fontSize: 34, marginBottom: 8 },
  emptyTitle: {
    color: ChatTheme.ink,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    color: ChatTheme.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 6,
  },
  row: { flexDirection: "row", marginVertical: 5 },
  rowOwn: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "82%",
    borderRadius: 21,
    padding: 10,
    ...clayShadow,
  },
  own: {
    backgroundColor: ChatTheme.peach,
    borderBottomRightRadius: 7,
  },
  other: {
    backgroundColor: ChatTheme.surface,
    borderBottomLeftRadius: 7,
  },
  author: {
    fontSize: 11,
    fontWeight: "700",
    color: ChatTheme.clayDark,
    marginHorizontal: 3,
    marginBottom: 5,
  },
  messageImage: {
    width: 224,
    height: 190,
    maxWidth: "100%",
    borderRadius: 14,
    marginBottom: 5,
    backgroundColor: ChatTheme.lavender,
  },
  text: { fontSize: 15, lineHeight: 21, color: ChatTheme.ink, padding: 3 },
  textOwn: { color: ChatTheme.ink },
  time: {
    fontSize: 10,
    color: ChatTheme.muted,
    marginTop: 2,
    alignSelf: "flex-end",
  },
  timeOwn: { color: "#86655C" },
  previewCard: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 9,
    backgroundColor: ChatTheme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: ChatTheme.line,
  },
  previewImage: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: ChatTheme.lavender,
  },
  previewCopy: { flex: 1, marginLeft: 11 },
  previewTitle: { color: ChatTheme.ink, fontSize: 13, fontWeight: "700" },
  previewHint: { color: ChatTheme.muted, fontSize: 11, marginTop: 3 },
  removeImage: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: ChatTheme.peach,
  },
  removeImageText: { color: ChatTheme.clayDark, fontSize: 23, lineHeight: 25 },
  errorBanner: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    marginBottom: 7,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#F8E3DF",
    borderRadius: 13,
  },
  errorText: { color: ChatTheme.error, fontSize: 12, lineHeight: 17 },
  composerShell: {
    width: "100%",
    maxWidth: 700,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: Platform.OS === "ios" ? 9 : 12,
    padding: 8,
    borderRadius: 24,
    backgroundColor: ChatTheme.surface,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    ...clayShadow,
  },
  attachButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: ChatTheme.sage,
  },
  attachIcon: { color: "#64816A", fontSize: 25, lineHeight: 27 },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    paddingHorizontal: 7,
    paddingVertical: 10,
    color: ChatTheme.ink,
    fontSize: 15,
  },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: ChatTheme.clay,
  },
  sendButtonDisabled: { opacity: 0.45 },
  sendIcon: { color: ChatTheme.white, fontSize: 18, marginLeft: 2 },
  pressed: { opacity: 0.75 },
});
