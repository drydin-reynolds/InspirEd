import React, { useEffect, useRef, useState, useCallback } from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import RootNavigator from "@/navigation/RootNavigator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider, useAppContext } from "@/context/AppContext";

SplashScreen.preventAutoHideAsync();

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
      
      if (isLoading) {
        routeName = "Loading";
      } else if (!onboardingCompleted) {
        routeName = "Onboarding";
      } else {
        routeName = "Main";
      }

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
  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      console.log("Fonts loaded:", fontsLoaded, "Error:", fontError, "Platform:", Platform.OS);
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4DB6AC" />
      </View>
    );
  }

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
