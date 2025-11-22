export async function generateVisitSummary(transcript: string, readingLevel: number): Promise<any> {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  return {
    summary: "Doctor discussed recent test results. Lung function has improved by 15% since last visit. Continue current medication routine.",
    keyPoints: [
      "Lung function improved 15% since last visit",
      "Continue current medications as prescribed",
      "Schedule follow-up in 3 months",
      "Monitor oxygen levels daily",
    ],
    diagnoses: ["Chronic pulmonary condition"],
    actions: [
      "Take medication twice daily",
      "Use oxygen therapy as needed",
      "Track symptoms in diary",
    ],
    medicalTerms: [
      {
        term: "Pulmonary Function",
        explanation: "How well your lungs work to move air in and out. Higher numbers mean better breathing.",
      },
      {
        term: "Oxygen Saturation",
        explanation: "The amount of oxygen in your blood. Normal is 95-100%.",
      },
    ],
  };
}

export async function askQuestionAboutVisit(
  question: string,
  visitContext: string,
  readingLevel: number
): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  const responses: { [key: string]: string } = {
    default: "Based on the visit notes, this is important to discuss with your doctor. The information suggests monitoring this closely and following the prescribed treatment plan.",
  };
  
  return responses.default;
}

export async function suggestPlannerQuestions(visitHistory: any[]): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return [
    "How is my child's lung function progressing?",
    "Are there any new treatment options we should consider?",
    "What symptoms should I watch for?",
    "How can we improve daily breathing exercises?",
  ];
}

export function calculateSMOG(text: string): number {
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
  
  let polysyllables = 0;
  words.forEach((word) => {
    const syllables = word.match(/[aeiouy]{1,2}/gi)?.length || 0;
    if (syllables >= 3) polysyllables++;
  });
  
  if (sentences === 0) return 8;
  
  const smog = 1.043 * Math.sqrt((polysyllables * 30) / sentences) + 3.1291;
  return Math.round(smog);
}
