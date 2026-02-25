import React from "react";
import { Pressable, Platform } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import EducationScreen from "@/screens/EducationScreen";
import ModuleDetailScreen from "@/screens/ModuleDetailScreen";
import VideoLibraryScreen from "@/screens/VideoLibraryScreen";
import VideoPlayerScreen from "@/screens/VideoPlayerScreen";
import { getCommonScreenOptions } from "./screenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Icon } from "@/components/Icon";
import { Spacing } from "@/constants/theme";
import { EducationalVideo } from "@/utils/googleDrive";

export type EmbeddedVideoParams = {
  videoId: string;
  title: string;
  sourceUri: string;
  sourceType: "local" | "drive" | "url";
  description?: string;
  duration?: string;
};

export type EducationStackParamList = {
  Education: undefined;
  ModuleDetail: { moduleId: string };
  VideoLibrary: undefined;
  VideoPlayer: { videoId: string; video: EducationalVideo } | EmbeddedVideoParams;
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
      <Stack.Screen
        name="VideoLibrary"
        component={VideoLibraryScreen}
        options={({ navigation }) => ({
          title: "Explore Videos",
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
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{
          headerShown: false,
          animation: "fade",
        }}
      />
    </Stack.Navigator>
  );
}
