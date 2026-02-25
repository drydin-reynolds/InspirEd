import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

import { Colors } from "@/constants/theme";

const InspiredSymbol = require("@/assets/images/inspired-symbol.png");

interface HeaderTitleProps {
  title?: string;
  showTagline?: boolean;
}

export function HeaderTitle({ title, showTagline = false }: HeaderTitleProps) {
  return (
    <View style={styles.container}>
      <Image
        source={InspiredSymbol}
        style={styles.symbol}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        <Text style={styles.titleTeal}>Inspir</Text>
        <Text style={styles.titleGreen}>Ed</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  symbol: {
    width: 36,
    height: 36,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  titleTeal: {
    color: Colors.light.primary,
  },
  titleGreen: {
    color: Colors.light.accent,
  },
});
