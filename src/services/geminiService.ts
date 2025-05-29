import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Function to analyze contract with Gemini API
export async function analyzeContractWithGemini(fileContent: string): Promise<{ success: boolean; analysis?: string; error?: string }> {
  try {
    // Get API key from environment variable or use a placeholder for development
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    
    if (!apiKey) {
      return {
        success: false,
        error: "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your environment variables."
      };
    }
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use the gemini-1.5-flash model for better performance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Configure safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
    
    // Create a structured prompt for contract analysis
    const prompt = `
You are an expert legal and financial AI assistant specializing in detailed contract analysis.

Please analyze the following contract text and provide a comprehensive analysis with the following structure:

# Contract Analysis Report

## Executive Summary
[Provide a brief summary of the contract, its purpose, and key points]

## Description
[Short description of what this contract is for]

## Document Title/Type
[Identify the type of contract]

## Parties involved:
- [List all parties in the contract with their roles]

## Financial Information

### Spend FY2024
[Identify current fiscal year spend if mentioned]

### Total Contract Value
[Total value of the contract]

## Key Dates

### Effective Date
[When the contract starts]

### Expiration Date
[When the contract ends]

### Renewal Date
[When the contract is up for renewal]

## Rate Cards
[Extract any rate cards or pricing tables if present, formatted as a markdown table]

## Payment Terms
[Payment schedule, terms, and conditions]

## Term and Termination

### Contract Term/Duration
[Length of the contract]

### Renewal Clauses
[How renewal works]

### Termination Rights
[How either party can terminate]

## Findings
[List key findings, numbered 1-N]

## Risks
[List identified risks, categorized as high/medium/low]

## Recommendations
[Provide actionable recommendations to address risks or improve the contract]

IMPORTANT: Format your response using markdown for readability. For any sections where information is not available in the contract, indicate "Not specified" or "Not found in document".
`;

    // Combine prompt with contract text
    const fullPrompt = `${prompt}\n\nCONTRACT TEXT:\n${fileContent.substring(0, 100000)}`; // Limit text to avoid token limits
    
    console.log("Sending request to Gemini API...");
    console.log("Using model: gemini-pro");
    
    // Generate content with the model
    try {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt.substring(0, 30000) }] }],
        safetySettings: safetySettings,
        generationConfig: {
          temperature: 0.2, // Slightly higher temperature for more creative analysis
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 8192,
        },
      });
    
      const response = result.response;
      const text = response.text();
    
      if (!text || text.trim() === "") {
        throw new Error("Received empty response from Gemini API");
      }
    
      console.log("Received response from Gemini API");
    
      return {
        success: true,
        analysis: text
      };
    } catch (apiError) {
      console.error("Gemini API error:", apiError);
      return {
        success: false,
        error: apiError instanceof Error ? apiError.message : "Error calling Gemini API"
      };
    }
  } catch (error) {
    console.error('Error in analyzeContractWithGemini:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("key not valid")) {
        return {
          success: false,
          error: "Invalid or missing API key. Please check your Gemini API key configuration."
        };
      } else if (error.message.includes("429") || error.message.includes("quota") || error.message.includes("rate limit")) {
        return {
          success: false,
          error: "API rate limit exceeded. Please try again later or check your API quota."
        };
      } else if (error.message.includes("network") || error.message.includes("connection") || error.message.includes("CORS")) {
        return {
          success: false,
          error: "Network error. This may be due to CORS restrictions in the WebContainer environment."
        };
      } else if (error.message.includes("model") || error.message.includes("not available")) {
        return {
          success: false,
          error: "The specified AI model is not available. Please try a different model."
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred while using Gemini API"
    };
  }
}