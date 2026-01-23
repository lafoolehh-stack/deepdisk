import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const performDeepReview = async (name: string, description: string, category: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Perform a verification check on the following entity from Somalia's registry:
      Entity Name: ${name}
      Category: ${category}
      Initial Description: ${description}
      
      Evaluate the public visibility, relevance to the Somali national landscape, and likely authenticity.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: {
              type: Type.INTEGER,
              description: "A score from 0-100 indicating the confidence in verification.",
            },
            analysis: {
              type: Type.STRING,
              description: "A brief summary of findings about this entity.",
            },
            sectorSuggestion: {
              type: Type.STRING,
              description: "Suggested industry or sector for this entity.",
            }
          },
          required: ["score", "analysis"]
        }
      }
    });

    const jsonStr = response.text;
    if (jsonStr) {
        return JSON.parse(jsonStr);
    }
    throw new Error("No response from AI");
  } catch (error) {
    console.error("Deep Review Error:", error);
    return {
      score: 50,
      analysis: "Automatic verification failed. Manual review required.",
      sectorSuggestion: "Unknown"
    };
  }
};