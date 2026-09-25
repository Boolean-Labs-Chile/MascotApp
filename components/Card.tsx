import type { ReactNode } from "react";
import { View } from "react-native";

type CardProps = {
    children: ReactNode;
};

export default function Card({ children }: CardProps) {
    return (
        <View className="bg-white rounded-xl p-6 shadow-sm">
            {children}
        </View>
    );
}
