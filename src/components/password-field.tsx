import { ChatTheme } from "@/constants/chat-theme";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

export function PasswordField(props: TextInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.field}>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor={ChatTheme.muted}
        secureTextEntry={!visible}
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={
          visible ? "Ocultar contraseña" : "Mostrar contraseña"
        }
        hitSlop={10}
        onPress={() => setVisible((current) => !current)}
        style={styles.toggle}
      >
        <View style={styles.eye}>
          <View style={styles.pupil} />
          {!visible && <View style={styles.slash} />}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: ChatTheme.surface,
    borderWidth: 1,
    borderColor: ChatTheme.line,
    borderRadius: 18,
    paddingLeft: 16,
    paddingRight: 18,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: ChatTheme.ink,
    fontSize: 15,
  },
  toggle: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  eye: {
    width: 19,
    height: 13,
    borderWidth: 1.7,
    borderColor: ChatTheme.muted,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-12deg" }],
  },
  pupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: ChatTheme.muted,
  },
  slash: {
    position: "absolute",
    height: 23,
    width: 1.7,
    backgroundColor: ChatTheme.muted,
    transform: [{ rotate: "45deg" }],
  },
});
