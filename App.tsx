import React, { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import RootNavigator from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useAppContext } from "@/context/AppContext";

function AppContent() {
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const { isLoading, onboardingCompleted } = useAppContext();
  const prevStateRef = useRef({ isLoading, onboardingCompleted });

  useEffect(() => {
    const prevState = prevStateRef.current;
    const hasChanged = 
      prevState.isLoading !== isLoading || 
      prevState.onboardingCompleted !== onboardingCompleted;

    if (hasChanged && navigationRef.current) {
      let routeName: string;
      if (isLoading) routeName = "Loading";
      else if (!onboardingCompleted) routeName = "Onboarding";
      else routeName = "Main";

      navigationRef.current.reset({
        index: 0,
        routes: [{ name: routeName }],
      });

      prevStateRef.current = { isLoading, onboardingCompleted };
    }
  }, [isLoading, onboardingCompleted]);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <GestureHandlerRootView style={styles.root}>
          <KeyboardProvider>
            <AppProvider>
              <AppContent />
              <StatusBar style="light" />
            </AppProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
