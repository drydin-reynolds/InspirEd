import { Platform } from "react-native";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const openAssetPDF = async (name: string, filePath: string): Promise<void> => {
    try {
        if (Platform.OS === "web") {
            window.open(filePath, "_blank");
            return;
        }

        const localUri = FileSystem.documentDirectory + name + ".pdf";

        const { uri } = await FileSystem.downloadAsync(filePath, localUri);

        const available = await Sharing.isAvailableAsync();
        if (!available) return;

        await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Open PDF',
        });

    } catch (err) {
        console.error("Error opening PDF:", err);
    }
};