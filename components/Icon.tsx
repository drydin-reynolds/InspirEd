import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import Svg, { Path, Circle, Rect, Line, Polyline } from "react-native-svg";

type IconName =
  | "home"
  | "time"
  | "calendar"
  | "book"
  | "person"
  | "mic"
  | "pause"
  | "play"
  | "stop"
  | "chevron-right"
  | "chevron-back"
  | "chevron-up"
  | "chevron-down"
  | "check"
  | "close"
  | "add"
  | "trash"
  | "document"
  | "document-text"
  | "chat"
  | "send"
  | "help"
  | "headset"
  | "refresh"
  | "record"
  | "sync"
  | "add-circle"
  | "sparkles"
  | "trophy"
  | "upload"
  | "checkmark-circle"
  | "shield";

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Icon({ name, size = 24, color = "#000", style }: IconProps) {
  const strokeWidth = 2;
  
  const renderIcon = () => {
    switch (name) {
      case "home":
        return (
          <>
            <Path
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "time":
        return (
          <>
            <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M12 7v5l3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          </>
        );
      case "calendar":
        return (
          <>
            <Rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth={strokeWidth} />
          </>
        );
      case "book":
        return (
          <>
            <Path
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </>
        );
      case "person":
        return (
          <>
            <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          </>
        );
      case "mic":
        return (
          <>
            <Rect x="9" y="2" width="6" height="11" rx="3" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M5 10a7 7 0 0014 0" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
            <Line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case "pause":
        return (
          <>
            <Rect x="6" y="4" width="4" height="16" rx="1" stroke={color} strokeWidth={strokeWidth} fill={color} />
            <Rect x="14" y="4" width="4" height="16" rx="1" stroke={color} strokeWidth={strokeWidth} fill={color} />
          </>
        );
      case "play":
        return (
          <Path d="M5 3l14 9-14 9V3z" stroke={color} strokeWidth={strokeWidth} fill={color} strokeLinejoin="round" />
        );
      case "stop":
        return (
          <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth={strokeWidth} fill={color} />
        );
      case "chevron-right":
        return (
          <Polyline points="9,18 15,12 9,6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        );
      case "chevron-back":
        return (
          <Polyline points="15,18 9,12 15,6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        );
      case "chevron-up":
        return (
          <Polyline points="6,15 12,9 18,15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        );
      case "chevron-down":
        return (
          <Polyline points="6,9 12,15 18,9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        );
      case "check":
        return (
          <Polyline points="5,12 10,17 19,8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        );
      case "close":
        return (
          <>
            <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case "add":
        return (
          <>
            <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case "trash":
        return (
          <>
            <Polyline points="3,6 5,6 21,6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          </>
        );
      case "document":
        return (
          <>
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Polyline points="14,2 14,8 20,8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="8" y1="17" x2="16" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case "document-text":
        return (
          <>
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Polyline points="14,2 14,8 20,8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="8" y1="13" x2="16" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="8" y1="17" x2="12" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case "chat":
        return (
          <Path
            d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        );
      case "send":
        return (
          <>
            <Line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M22 2L15 22l-4-9-9-4 20-7z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );
      case "help":
        return (
          <>
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
            <Circle cx="12" cy="17" r="0.5" fill={color} />
          </>
        );
      case "headset":
        return (
          <>
            <Path d="M3 18v-6a9 9 0 0118 0v6" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" stroke={color} strokeWidth={strokeWidth} fill="none" />
          </>
        );
      case "refresh":
        return (
          <>
            <Polyline points="23,4 23,10 17,10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Polyline points="1,20 1,14 7,14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          </>
        );
      case "record":
        return (
          <Circle cx="12" cy="12" r="8" fill={color} />
        );
      case "sync":
        return (
          <>
            <Polyline points="23,4 23,10 17,10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
          </>
        );
      case "add-circle":
        return (
          <>
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Line x1="12" y1="8" x2="12" y2="16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case "sparkles":
        return (
          <>
            <Path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" />
            <Path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
            <Path d="M19 11l.5 1.5L21 13l-1.5.5L19 15l-.5-1.5L17 13l1.5-.5L19 11z" stroke={color} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
          </>
        );
      case "trophy":
        return (
          <>
            <Path d="M6 9H4a2 2 0 01-2-2V5a2 2 0 012-2h2" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M18 9h2a2 2 0 002-2V5a2 2 0 00-2-2h-2" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M4 22h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
            <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M18 2H6v7a6 6 0 0012 0V2z" stroke={color} strokeWidth={strokeWidth} fill="none" />
          </>
        );
      case "upload":
        return (
          <>
            <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
            <Polyline points="17,8 12,3 7,8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Line x1="12" y1="3" x2="12" y2="15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
          </>
        );
      case "checkmark-circle":
        return (
          <>
            <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Polyline points="8,12 11,15 16,9" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );
      case "shield":
        return (
          <>
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Polyline points="9,12 11,14 15,10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        );
      default:
        return (
          <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={strokeWidth} fill="none" />
        );
    }
  };

  return (
    <View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {renderIcon()}
      </Svg>
    </View>
  );
}
