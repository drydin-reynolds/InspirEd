import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Icon } from "@/components/Icon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from "react-native-reanimated";

type FloatingActionButtonProps = {
  onPress: () => void;
  showBounce?: boolean;
};

const tabBarHeight = 50;

export function FloatingActionButton({ onPress, showBounce = false }: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (showBounce) {
      translateY.value = withSequence(
        withSpring(-8, { damping: 10 }),
        withSpring(0, { damping: 10 })
      );
    }
  }, [showBounce]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: tabBarHeight + insets.bottom + Spacing.xl,
          right: Spacing.xl,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[
          styles.button,
          {
            backgroundColor: theme.primary,
            shadowColor: theme.primary,
          },
        ]}
      >
        <Icon name="mic" size={28} color="white" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
