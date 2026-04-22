import { LearningModule } from "../context/AppContext";

export const assetToLearningModule = (asset: any): LearningModule => {
    return {
        id: asset._id,

        title: asset.title,

        description: asset.learning_objective || "No description available",

        category: asset.concept_domain || "General",

        difficulty:
            asset.content_type === "animation"
                ? "Beginner"
                : asset.content_type === "video_segment"
                    ? "Intermediate"
                    : "Advanced",

        duration: "5 min",

        progress: 0,
        completed: false,
        
        topics: [...asset.secondary_concepts,asset.primary_concept],
    };
};