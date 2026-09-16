import { Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";

import { DATABASE_NAME, migrateDbIfNeeded } from "@/db/schema";
import '../global.css';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
      <Stack />
    </SQLiteProvider>

  );
 
}

