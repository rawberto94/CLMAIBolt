import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Define a placeholder for the expected structured response.
// You should replace 'any' with a more specific interface matching what you ask Gemini for.
// For example, a subset of your UI's AnalysisResult interface.
export type StructuredAnalysisResponse = any; // TODO: Define this more accurately

/**
 * Sends a prompt to the Gemini API and expects a JSON response.
 * @param promptText The full prompt string, which should instruct Gemini to return JSON.
 * @returns A promise that resolves to the parsed JSON object or an error.
 */
export async function getStructuredAnalysisFromGemini(
  promptText: string
): Promise<{ success: boolean; analysis?: StructuredAnalysisResponse; error?: string }> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Ensure this is NOT the hardcoded key

    if (!apiKey) {
      return {
        success: false,
        error: "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables."
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        // IMPORTANT: Tell the model to generate JSON
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // The promptText already contains the contract and instructions.
    // We are now relying on promptText to ask for JSON.
    // Limit the prompt size if necessary, though gemini-1.5-flash has a large context window.
    const effectivePrompt = promptText.substring(0, 32000); // Example limit

    console.log("Sending request to Gemini API for STRUCTURED JSON response...");

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: effectivePrompt }] }],
      safetySettings: safetySettings,
      // generationConfig is now set when initializing the model for responseMimeType
      // but you can still override temperature, topP, topK, maxOutputTokens here if needed.
      // For JSON, temperature is often kept low (e.g., 0.1 or 0.2) for predictability.
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 8192, // Ensure this is enough for your JSON
        responseMimeType: "application/json", // Reinforce, though set on model init
      },
    });

    const response = result.response;
    const responseText = response.text();

    if (!responseText || responseText.trim() === "") {
      throw new Error("Received empty response from Gemini API. Expected JSON.");
    }

    console.log("Received raw JSON string from Gemini API:", responseText);

    try {
      const parsedAnalysis: StructuredAnalysisResponse = JSON.parse(responseText);
      return {
        success: true,
        analysis: parsedAnalysis
      };
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError);
      console.error("Raw response was:", responseText);
      return {
        success: false,
        error: `Failed to parse JSON response from Gemini. Raw response: ${responseText.substring(0, 200)}...` // Include snippet for debugging
      };
    }

  } catch (error) {
    console.error('Error in getStructuredAnalysisFromGemini:', error);
    // Handle specific error types as you did before
    if (error instanceof Error) {
        // ... (your existing detailed error handling for API keys, quota, network etc.)
         if (error.message.includes("API key") || error.message.includes("key not valid")) {
             return { success: false, error: "Invalid or missing API key for Gemini."};
         } // ... etc.
         return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unexpected error occurred while calling Gemini API for structured analysis."
    };
  }
}
