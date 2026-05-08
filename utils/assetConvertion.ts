import { LearningModule } from "../context/AppContext";

export const assetToLearningModule = (asset: any): LearningModule => {
    return {
        id: asset._id,

        title: asset.title,

        description: asset.primary_concept || "No description available",

        category: asset.concept_domain || "General",

        difficulty:
            asset.parent_expertise_stage[0] === "novice" || asset.parent_expertise_stage[0] === "emerging"
                ? "Beginner"
                : asset.parent_expertise_stage[0] === "developing" || asset.parent_expertise_stage[0] === "proficient"
                    ? "Intermediate"
                    : "Advanced",

        duration: "5 min",

        progress: 0,
        completed: false,
        
        topics: [...asset.secondary_concepts,asset.primary_concept],
    };
};