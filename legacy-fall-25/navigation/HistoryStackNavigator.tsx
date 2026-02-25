import React from "react";
import { Pressable, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HistoryScreen from "@/screens/HistoryScreen";
import VisitDetailScreen from "@/screens/VisitDetailScreen";
import ChatScreen from "@/screens/ChatScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/components/Icon";
import { Spacing } from "@/constants/theme";

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
        options={({ navigation }) => ({
          title: "Visit Details",
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ 
                padding: Spacing.sm,
                marginLeft: Platform.OS === "web" ? Spacing.sm : 0,
              }}
            >
              <Icon name="chevron-back" size={24} color={theme.text} />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ navigation }) => ({
          title: "Ask Questions",
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              style={{ 
                padding: Spacing.sm,
                marginLeft: Platform.OS === "web" ? Spacing.sm : 0,
              }}
            >
              <Icon name="chevron-back" size={24} color={theme.text} />
            </Pressable>
          ),
        })}
      />
    </Stack.Navigator>
  );
}
