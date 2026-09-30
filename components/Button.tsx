import { Pressable, Text } from "react-native";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "dark" | "light";
};

export default function Button({
  label,
  onPress,
  variant = "dark",
}: ButtonProps) {
  const bgClass = variant === "dark" ? "bg-button-dark" : "bg-button-light";

  return (
    <Pressable
      onPress={onPress}
      className={`${bgClass} mt-3 items-center rounded-xl px-6 py-3`}
    >
      <Text className="font-sans-semibold text-text">{label}</Text>
    </Pressable>
  );
}
