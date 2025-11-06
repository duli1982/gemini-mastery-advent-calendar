
import { GoogleGenAI } from "@google/genai";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this project, we assume it's set.
  console.warn("API_KEY environment variable not set. Using static content mode.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'MISSING_API_KEY' });

export const getDailySurprise = async (prompt: string, day: number): Promise<string> => {
  // Static content mode: Return the prompt directly for all days
  // This allows you to add custom messages for each day in constants.ts
  // without needing the Gemini API key
  return Promise.resolve(prompt);

  // NOTE: If you want to enable AI-generated content in the future,
  // uncomment the code below and add your GEMINI_API_KEY to the .env file

  /*
  // For Day 1, the surprise is the prompt itself.
  if (day === 1) {
    return Promise.resolve(prompt);
  }

  if (!process.env.API_KEY) {
    return Promise.resolve("### API Key Not Found\n\nPlease set up your Gemini API key to receive your daily surprise!");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful and festive AI assistant. Please format your answers in Markdown for best display. Use headings, lists, and bold text where appropriate.",
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    throw new Error("Failed to fetch surprise from Gemini API.");
  }
  */
};
