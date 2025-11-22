import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistoryScreen from "@/screens/HistoryScreen";
import VisitDetailScreen from "@/screens/VisitDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { useTheme } from "@/hooks/useTheme";

const Stack = createNativeStackNavigator();

export default function HistoryStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: "Visit History" }}
      />
      <Stack.Screen
        name="VisitDetail"
        component={VisitDetailScreen}
        options={{ title: "Visit Details" }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: "Ask Questions" }}
      />
    </Stack.Navigator>
  );
}
