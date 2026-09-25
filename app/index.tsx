import { LinearGradient } from "expo-linear-gradient";
import { Text } from "react-native";
import Button from "../components/Button";
import Card from "../components/Card";
import { GRADIENT_BACKGROUND } from "../constants/theme";
import "../global.css";

export default function Index() {
  return (
    <LinearGradient
      {...GRADIENT_BACKGROUND}
      style={{ flex: 1 }}
      className="items-center justify-center"
    >
      <Card>
        <Text className="text-text font-sans-bold text-2xl mb-4">
          MascotApp!!!1!1
        </Text>
        <Button label="MascotApp" onPress={() => { }} />
      </Card>
    </LinearGradient>
  );
}