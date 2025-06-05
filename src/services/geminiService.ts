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
    if (!promptContent || promptContent.trim() === '') {
      return {
        success: false,
        error: 'No prompt content provided for analysis',
        analysis: null,
      };
    }

    // For gemini-1.5-pro and newer, you can specify response_mime_type for JSON output.
    // For older models like 'gemini-pro', you rely on prompt engineering.
    const model = client.getGenerativeModel({
      model: modelName,
      // Basic safety settings - adjust as needed for your use case
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


    console.log(`Sending prompt to Gemini model (${modelName}). Expect JSON: ${expectJson}`);
    // console.debug("Full prompt to Gemini:", promptContent); // Uncomment for debugging prompts

    const result = await model.generateContent(promptContent);
    const response = result.response;

    if (!response) {
      // Log the prompt and any finishReason if available for debugging
      console.error("Gemini response was empty. Finish Reason:", response?.promptFeedback);
      return {
        success: false,
        error: 'Failed to generate analysis from Gemini (empty response)',
        analysis: null,
      };
    }

    const responseText = response.text();
    // console.debug("Raw text from Gemini:", responseText); // Uncomment for debugging raw output

    if (expectJson) {
      // Attempt to extract JSON from potentially mixed content (e.g., markdown code blocks)
      let jsonString = responseText;
      const jsonRegex = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/; // Look for markdown block or raw JSON
      const match = jsonRegex.exec(responseText.trim());

      if (match) {
        jsonString = match[1] || match[2]; // Prioritize content within ```json ... ```
      } else {
        // If no clear JSON block, assume the whole text might be JSON, or it's malformed.
        // This might happen if the LLM doesn't perfectly follow JSON-only instructions.
        console.warn("Could not find a clear JSON block (```json ... ``` or raw object) in LLM response. Attempting to parse the whole response. Raw text:", responseText);
      }

      try {
        const parsedAnalysis = JSON.parse(jsonString) as TargetJsonStructure;
        return {
          success: true,
          analysis: parsedAnalysis,
        };
      } catch (parseError) {
        console.error('Failed to parse JSON response from Gemini:', parseError);
        console.error('Problematic JSON string received:', jsonString); // Log the string that failed to parse
        return {
          success: false,
          error: `Failed to parse JSON response. Error: ${(parseError as Error).message}. Raw output: ${responseText.substring(0, 500)}...`, // Include part of raw output for context
          analysis: null,
        };
      }
    } else {
      // If JSON is not expected, return the plain text (e.g., for chat)
      return {
        success: true,
        analysis: responseText,
      };
    }

  } catch (error) {
    console.error('Error in getStructuredAnalysisFromGemini:', error);
    // Check for specific API errors if the SDK provides them, e.g., quota issues, API key issues
    // const typedError = error as GoogleGenerativeAIError; // Or whatever error type the SDK uses
    // if (typedError.status === 'INVALID_ARGUMENT' && typedError.message.includes('API_KEY')) { ... }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred communicating with Gemini',
      analysis: null,
    };
  }
}
