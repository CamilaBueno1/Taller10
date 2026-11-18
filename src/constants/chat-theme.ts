export const ChatTheme = {
  background: "#F6F1E9",
  surface: "#FFFCF7",
  surfaceWarm: "#FFF7EF",
  ink: "#403936",
  muted: "#8B8078",
  line: "#E9DED4",
  clay: "#B97561",
  clayDark: "#9E604F",
  peach: "#F4D6CA",
  sage: "#DFECE2",
  lavender: "#E7E0F0",
  butter: "#F5E9C9",
  white: "#FFFFFF",
  error: "#A64F49",
  shadow: "#A58C7C",
} as const;

export const clayShadow = {
  shadowColor: ChatTheme.shadow,
  shadowOffset: { width: 0, height: 7 },
  shadowOpacity: 0.13,
  shadowRadius: 12,
  elevation: 4,
} as const;
