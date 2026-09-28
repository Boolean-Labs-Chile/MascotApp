import type { ReactNode } from "react";
import { View } from "react-native";

type CardProps = {
  children: ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <View className="bg-button-light rounded-2xl p-4 shadow-sm">
      {children}
    </View>
  );
}
