import React from "react";
import { Text, View } from "react-native";

export interface StatCardProps {
  label: string;
  value: string | number;
}
export function StatCard({ label, value }: StatCardProps) {
  return (
    <View className="flex-1 rounded-2xl border border-text/10 bg-white py-3 shadow-sm">
      <Text className="mb-1 text-center font-sans-bold text-xs text-text opacity-70">
        {label}
      </Text>
      <Text className={"text-center font-sans-semibold text-sm text-text"}>
        {value}
      </Text>
    </View>
  );
}
