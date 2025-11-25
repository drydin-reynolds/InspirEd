import React from "react";
import { Pressable, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EducationScreen from "@/screens/EducationScreen";
import ModuleDetailScreen from "@/screens/ModuleDetailScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/components/Icon";
import { Spacing } from "@/constants/theme";

export type EducationStackParamList = {
  Education: undefined;
  ModuleDetail: { moduleId: string };
};

const Stack = createNativeStackNavigator<EducationStackParamList>();

export default function EducationStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator screenOptions={getCommonScreenOptions({ theme, isDark })}>
      <Stack.Screen
        name="Education"
        component={EducationScreen}
        options={{ title: "Learning Hub" }}
      />
      <Stack.Screen
        name="ModuleDetail"
        component={ModuleDetailScreen}
        options={({ navigation }) => ({
          title: "Module",
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
