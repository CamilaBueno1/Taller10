import { useAuth } from "@features/auth/presentation/hooks/useAuth";
import { Stack } from "expo-router";
import { ChatTheme } from "@/constants/chat-theme";
import { Pressable, Text } from "react-native";

export default function AppLayout() {
  const { logout } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: ChatTheme.background },
        headerTintColor: ChatTheme.ink,
        headerTitleStyle: { fontWeight: "700", color: ChatTheme.ink },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Mi Chat",
          headerRight: () => (
            <Pressable
              onPress={logout}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
              hitSlop={8}
              style={{ marginRight: 4 }}
            >
              <Text
                style={{
                  color: ChatTheme.clayDark,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Salir
              </Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="[roomId]" options={{ title: "Chat" }} />
    </Stack>
  );
}
