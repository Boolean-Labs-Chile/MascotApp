import { Pressable, Text, View } from "react-native";

interface ChipSelectorProps<T extends string> {
    label: string;
    options: T[];
    value: T | null;
    onChange: (value: T) => void;
}

export function ChipSelector<T extends string>({
    label,
    options,
    value,
    onChange,
}: ChipSelectorProps<T>) {
    return (
        <View className="mb-4">
            <Text className="text-sm font-medium text-text mb-2">{label}</Text>
            <View className="flex-row flex-wrap gap-2">
                {options.map((opt) => {
                const selected = value === opt;
                return (
                <Pressable
                    key={opt}
                    onPress={() => onChange(opt)}
                    className={`px-4 py-2 rounded-full border ${
                        selected
                            ? "bg-button-dark border-button-dark"
                            : "bg-white border-gray-300"

                        }`}
                >
                    <Text
                        className={selected ? "text-white font-medium" : "text-text"}
                    >
                        {opt}
                    </Text>
                </Pressable>
                );
            })}
            </View>
        </View>
    );
}