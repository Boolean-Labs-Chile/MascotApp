import { Pressable, Text } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "dark" | "light";
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = "dark",
  disabled = false,
}: ButtonProps) {
  const bgClass = variant === "dark" ? "bg-button-dark" : "bg-button-light";

  return (
    <Pressable
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={{ opacity: disabled ? 0.5 : 1 }}
      onPress={onPress}
      className={`${bgClass} items-center rounded-xl px-6 py-3`}
    >
      <Text className="font-sans-semibold text-text">{label}</Text>
    </Pressable>
  );
}
