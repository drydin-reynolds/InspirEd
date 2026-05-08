import React from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Icon } from "@/components/Icon";

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onClear?: () => void;
};

export function SearchBar({
    value,
    onChangeText,
    placeholder = "Search...",
    onClear,
}: SearchBarProps) {
    const { theme } = useTheme();

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.backgroundSecondary,
                    borderColor: theme.border,
                },
            ]}
        >
            <Icon name="search" size={18} color={theme.textSecondary} />

            <TextInput
                value={value}
                onChangeText={(t) => { onChangeText(t) } }
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text }]}
                returnKeyType="search"
            />

            {value.length > 0 && (
                <Pressable onPress={onClear} hitSlop={10}>
                    <Icon name="close" size={18} color={theme.textSecondary} />
                </Pressable>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
    },
    input: {
        flex: 1,
        fontSize: 14,
    },
});