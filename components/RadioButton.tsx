import { TouchableOpacity, Text, View } from "react-native";

type RadioButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export default function RadioButton({
  label,
  selected,
  onPress,
}: RadioButtonProps) {
  return (
    <TouchableOpacity className="flex-row items-center mb-3" onPress={onPress}>
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          selected ? "border-button-dark" : "border-gray-300"
        }`}
      >
        {selected && <View className="w-3 h-3 rounded-full bg-button-dark" />}
      </View>
      <Text className="ml-3 text-text font-normal text-base">{label}</Text>
    </TouchableOpacity>
  );
}
