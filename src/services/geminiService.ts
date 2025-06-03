import { GoogleGenerativeAI } from '@google/generative-ai';

const client = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

interface AnalysisResult {
  success: boolean;
  error?: string;
  analysis?: string;
}

export async function getStructuredAnalysisFromGemini(text: string): Promise<AnalysisResult> {
  try {
    if (!text || text.trim() === '') {
      return {
        success: false,
        error: 'No text provided for analysis'
      };
    }

    const model = client.getGenerativeModel({ model: 'models/gemini-pro' });

    const prompt = `Analyze the following contract text and provide a structured analysis. Include:
      1. Summary
      2. Contract type
      3. Parties involved
      4. Contract value (if mentioned)
      5. Term/duration
      6. Key clauses
      7. Risks
      8. Recommendations

      Contract text:
      ${text}`;

    const result = await model.generateText(prompt);
    
    if (!result.response) {
      return {
        success: false,
        error: 'Failed to generate analysis'
      };
    }

    return {
      success: true,
      analysis: result.response.text()
    };

  } catch (error) {
    console.error('Error in getStructuredAnalysisFromGemini:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}