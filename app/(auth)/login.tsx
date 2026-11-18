import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Link } from "expo-router";
import { PasswordField } from "@/components/password-field";
import { ChatTheme, clayShadow } from "@/constants/chat-theme";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoading, error } = useAuth();

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandMark}>
          <Text style={styles.brandEmoji}>☁</Text>
        </View>
        <Text style={styles.brand}>MI CHAT</Text>
        <Text style={styles.title}>Un lugar para hablar</Text>
        <Text style={styles.subtitle}>
          Conversaciones bonitas, a tu ritmo.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Qué gusto verte</Text>
          <Text style={styles.cardCopy}>Inicia sesión para volver a tus salas.</Text>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{error}</Text>
            </View>
          )}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tu@correo.com"
            placeholderTextColor={ChatTheme.muted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Text style={styles.label}>Contraseña</Text>
          <PasswordField
            placeholder="Tu contraseña"
            value={password}
            onChangeText={setPassword}
            autoComplete="current-password"
            textContentType="password"
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && !isLoading && styles.buttonPressed,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={() => login({ email, password })}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={ChatTheme.white} />
            ) : (
              <Text style={styles.buttonText}>Entrar a mi espacio</Text>
            )}
          </Pressable>
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Primera vez por aquí?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable hitSlop={8}>
                <Text style={styles.link}>Crear cuenta</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: ChatTheme.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  blobTop: {
    position: "absolute",
    top: -90,
    right: -80,
    width: 230,
    height: 230,
    borderRadius: 120,
    backgroundColor: ChatTheme.peach,
    opacity: 0.62,
  },
  blobBottom: {
    position: "absolute",
    left: -100,
    bottom: -100,
    width: 250,
    height: 250,
    borderRadius: 130,
    backgroundColor: ChatTheme.lavender,
    opacity: 0.68,
  },
  brandMark: {
    alignSelf: "center",
    width: 76,
    height: 76,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ChatTheme.sage,
    marginBottom: 13,
    ...clayShadow,
  },
  brandEmoji: { color: ChatTheme.clay, fontSize: 36, fontWeight: "700" },
  brand: {
    color: ChatTheme.clayDark,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    textAlign: "center",
  },
  title: {
    color: ChatTheme.ink,
    fontSize: 30,
    fontWeight: "800",
    marginTop: 8,
    textAlign: "center",
  },
  subtitle: {
    color: ChatTheme.muted,
    fontSize: 15,
    marginTop: 7,
    marginBottom: 27,
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    padding: 22,
    borderRadius: 28,
    backgroundColor: ChatTheme.surface,
    borderWidth: 1,
    borderColor: "#FFFFFF",
    ...clayShadow,
  },
  cardTitle: { color: ChatTheme.ink, fontSize: 21, fontWeight: "700" },
  cardCopy: {
    color: ChatTheme.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
    marginBottom: 20,
  },
  label: {
    color: ChatTheme.ink,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    minHeight: 56,
    backgroundColor: ChatTheme.surface,
    borderWidth: 1,
    borderColor: ChatTheme.line,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: ChatTheme.ink,
    fontSize: 15,
    marginBottom: 17,
  },
  button: {
    minHeight: 56,
    marginTop: 22,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ChatTheme.clay,
    ...clayShadow,
  },
  buttonPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: ChatTheme.white, fontWeight: "700", fontSize: 16 },
  errorBox: {
    backgroundColor: "#F8E3DF",
    borderRadius: 14,
    padding: 12,
    marginBottom: 17,
  },
  error: { color: ChatTheme.error, fontSize: 13, lineHeight: 18 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 22,
  },
  footerText: { color: ChatTheme.muted, fontSize: 13 },
  link: { color: ChatTheme.clayDark, fontSize: 13, fontWeight: "700" },
});
