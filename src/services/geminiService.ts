import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { TargetJsonStructure } from './contractRagService'; // Assuming TargetJsonStructure is exported there

// Initialize the Gemini client
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not set. Please check your .env file.");
  // Potentially throw an error or handle this more gracefully depending on your app's needs
}
const client = new GoogleGenerativeAI(apiKey);

// Updated interface to align with what contractRagService expects
export interface StructuredAnalysisResponse {
  success: boolean;
  error?: string;
  analysis?: TargetJsonStructure | string | null; // Can be structured JSON or plain string
}

// Consider using a newer model if available and you need more robust JSON output,
// e.g., 'gemini-1.5-pro-latest'. For 'gemini-pro', precise prompting is key.
const modelName = 'gemini-1.5-pro-latest'; // Or 'gemini-pro' if 1.5 is not yet used

export async function getStructuredAnalysisFromGemini(
  promptContent: string, // Renamed: this is the full prompt constructed by the calling service
  expectJson: boolean = true // New parameter to control output processing
): Promise<StructuredAnalysisResponse> {
  try {
    // --- ADD LOG ---
    console.log('[geminiService] getStructuredAnalysisFromGemini called. Expect JSON:', expectJson);

    if (!promptContent || promptContent.trim() === '') {
      // --- ADD LOG ---
      console.warn('[geminiService] No prompt content provided.');
      return {
        success: false,
        error: 'No prompt content provided for analysis',
        analysis: null,
      };
    }

    const model = client.getGenerativeModel({
      model: modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: expectJson && modelName.includes('1.5') // Check if it's a model that supports JSON mode
        ? { responseMimeType: "application/json" } // Enforce JSON output if model supports it
        : undefined
    });

    // --- ADD LOG (Potentially very verbose, use for deep debugging) ---
    // console.debug('[geminiService] Full prompt to Gemini:', promptContent);

    const result = await model.generateContent(promptContent);
    const response = result.response;

    if (!response) {
      // --- ADD LOG ---
      console.error('[geminiService] Gemini response was empty. Prompt Feedback:', response?.promptFeedback);
      return {
        success: false,
        error: 'Failed to generate analysis from Gemini (empty response)',
        analysis: null,
      };
    }

    const responseText = response.text();
    // --- ADD LOG ---
    console.log('[geminiService] Raw text from Gemini:', responseText);

    if (expectJson) {
      let jsonString = responseText;
      const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/;
      const match = jsonRegex.exec(responseText.trim());

      if (match) {
        jsonString = match[1] || match[2];
      } else {
        console.warn("[geminiService] Could not find a clear JSON block (```json ... ``` or raw object) in LLM response. Attempting to parse the whole response.");
      }

      try {
        const parsedAnalysis = JSON.parse(jsonString) as TargetJsonStructure;
        // --- ADD LOG ---
        console.log('[geminiService] Successfully parsed JSON analysis:', parsedAnalysis);
        return {
          success: true,
          analysis: parsedAnalysis,
        };
      } catch (parseError) {
        // --- MODIFIED LOG for more detail ---
        console.error('[geminiService] Failed to parse JSON response from Gemini:', parseError);
        console.error('[geminiService] Problematic JSON string received for parsing:', jsonString);
        return {
          success: false,
          error: `Failed to parse JSON response. Error: ${(parseError as Error).message}. Raw output preview: ${responseText.substring(0, 500)}...`,
          analysis: null,
        };
      }
    } else {
      // --- ADD LOG ---
      console.log('[geminiService] Returning plain text analysis (expectJson was false):', responseText);
      return {
        success: true,
        analysis: responseText,
      };
    }

  } catch (error) {
    // --- MODIFIED LOG for more detail ---
    console.error('[geminiService] Error in getStructuredAnalysisFromGemini (catch block):', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred communicating with Gemini',
      analysis: null,
    };
  }
}