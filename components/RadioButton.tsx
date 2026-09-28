import { Text, TouchableOpacity, View } from "react-native";

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
    <TouchableOpacity className="mb-3 flex-row items-center" onPress={onPress}>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? "border-button-dark" : "border-gray-300"
        }`}
      >
        {selected && <View className="h-3 w-3 rounded-full bg-button-dark" />}
      </View>
      <Text className="ml-3 text-base font-normal text-text">{label}</Text>
    </TouchableOpacity>
  );
}
