import { Pressable, Text } from "react-native";

type ButtonProps = {
    label: string;
    onPress: () => void;
    variant?: "dark" | "light";
};

export default function Button({ label, onPress, variant = "dark" }: ButtonProps) {
    const bgClass = variant === "dark" ? "bg-button-dark" : "bg-button-light";

    return (
        <Pressable
            onPress={onPress}
            className={`${bgClass} px-6 py-3 rounded-xl items-center`}
        >
            <Text className="text-text font-sans-semibold">{label}</Text>
        </Pressable>
    );
}