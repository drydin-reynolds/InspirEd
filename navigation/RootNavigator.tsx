import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "./MainTabNavigator";
import RecordVisitScreen from "@/screens/RecordVisitScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import LoadingScreen from "@/screens/LoadingScreen";
import { useAppContext } from "@/context/AppContext";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isLoading, onboardingCompleted } = useAppContext();

  const getInitialRouteName = () => {
    if (isLoading) return "Loading";
    if (!onboardingCompleted) return "Onboarding";
    return "Main";
  };

  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRouteName()}
    >
      <Stack.Screen 
        name="Loading" 
        component={LoadingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="RecordVisit"
        component={RecordVisitScreen}
        options={{ presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
