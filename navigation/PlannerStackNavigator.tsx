import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PlannerScreen from "@/screens/PlannerScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { useTheme } from "@/hooks/useTheme";

const Stack = createNativeStackNavigator();

export default function PlannerStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="PlannerMain"
        component={PlannerScreen}
        options={{ title: "Next Visit Planner" }}
      />
    </Stack.Navigator>
  );
}
