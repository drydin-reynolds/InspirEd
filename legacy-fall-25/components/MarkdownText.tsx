import React from "react";
import { Text, TextStyle, StyleSheet, View } from "react-native";

interface MarkdownTextProps {
  children: string;
  style?: TextStyle;
  color?: string;
}

interface TextSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

function parseInlineFormatting(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*([^*]+?)\*(?!\*)/);

    let firstMatchIndex = remaining.length;
    let matchType: "bold" | "italic" | null = null;
    let matchContent = "";
    let matchLength = 0;

    if (boldMatch && boldMatch.index !== undefined && boldMatch.index < firstMatchIndex) {
      firstMatchIndex = boldMatch.index;
      matchType = "bold";
      matchContent = boldMatch[1];
      matchLength = boldMatch[0].length;
    }

    if (italicMatch && italicMatch.index !== undefined && italicMatch.index < firstMatchIndex) {
      firstMatchIndex = italicMatch.index;
      matchType = "italic";
      matchContent = italicMatch[1];
      matchLength = italicMatch[0].length;
    }

    if (matchType === null) {
      if (remaining.length > 0) {
        segments.push({ text: remaining });
      }
      break;
    }

    if (firstMatchIndex > 0) {
      segments.push({ text: remaining.substring(0, firstMatchIndex) });
    }

    segments.push({
      text: matchContent,
      bold: matchType === "bold",
      italic: matchType === "italic",
    });

    remaining = remaining.substring(firstMatchIndex + matchLength);
  }

  return segments;
}

function renderLine(line: string, color: string, baseStyle: TextStyle, index: number) {
  const bulletMatch = line.match(/^(\s*)[-*]\s+(.*)$/);
  const numberMatch = line.match(/^(\s*)(\d+)[.)]\s+(.*)$/);

  if (bulletMatch) {
    const content = bulletMatch[2];
    const segments = parseInlineFormatting(content);
    return (
      <View key={index} style={styles.listItem}>
        <Text style={[baseStyle, { color }]}>{"\u2022  "}</Text>
        <Text style={[baseStyle, { color, flex: 1 }]}>
          {segments.map((seg, i) => (
            <Text
              key={i}
              style={[
                baseStyle,
                { color },
                seg.bold && styles.bold,
                seg.italic && styles.italic,
              ]}
            >
              {seg.text}
            </Text>
          ))}
        </Text>
      </View>
    );
  }

  if (numberMatch) {
    const num = numberMatch[2];
    const content = numberMatch[3];
    const segments = parseInlineFormatting(content);
    return (
      <View key={index} style={styles.listItem}>
        <Text style={[baseStyle, { color }]}>{num}.  </Text>
        <Text style={[baseStyle, { color, flex: 1 }]}>
          {segments.map((seg, i) => (
            <Text
              key={i}
              style={[
                baseStyle,
                { color },
                seg.bold && styles.bold,
                seg.italic && styles.italic,
              ]}
            >
              {seg.text}
            </Text>
          ))}
        </Text>
      </View>
    );
  }

  const segments = parseInlineFormatting(line);
  return (
    <Text key={index} style={[baseStyle, { color }]}>
      {segments.map((seg, i) => (
        <Text
          key={i}
          style={[
            baseStyle,
            { color },
            seg.bold && styles.bold,
            seg.italic && styles.italic,
          ]}
        >
          {seg.text}
        </Text>
      ))}
      {"\n"}
    </Text>
  );
}

export function MarkdownText({ children, style, color = "#000" }: MarkdownTextProps) {
  if (!children || typeof children !== "string") {
    return null;
  }

  const lines = children.split("\n");
  const baseStyle: TextStyle = {
    fontSize: 15,
    lineHeight: 22,
    ...style,
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => renderLine(line, color, baseStyle, index))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 4,
    marginVertical: 2,
  },
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
});
