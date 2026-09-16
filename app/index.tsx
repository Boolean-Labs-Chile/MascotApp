import { Text, View } from "react-native";
import Button from "../components/Button";
import Card from "../components/Card";
import "../global.css";


export default function Index() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Card>
        <Text className="text-text font-sans-bold text-2xl mb-4">
          MascotApp!!!1!1
        </Text>
        <Button label="MascotApp" onPress={() => {}} />
      </Card>
    </View>
  );
}