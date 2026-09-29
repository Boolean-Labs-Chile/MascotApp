import type { ReactNode } from "react";
import { View } from "react-native";

type CardProps = {
  children: ReactNode;
};

export default function Card({ children }: CardProps) {
  return (
    <View className="rounded-2xl bg-button-light p-4 shadow-sm">
      {children}
    </View>
  );
}
