// At the top of contractRagService.ts, or import if defined elsewhere
// This should mirror the structure you want Gemini to return.
// Start with a manageable subset of your full AnalysisResult.
export interface TargetJsonStructure {
  executiveSummary: string;
  documentType?: string;
  partiesInvolved?: Array<{ name: string; role?: string }>;
  keyDates?: {
    effectiveDate?: string | null;
    expirationDate?: string | null;
    renewalDate?: string | null;
  };
  identifiedRisks?: Array<{
    level: 'low' | 'medium' | 'high' | 'unknown';
    description: string;
    mitigation?: string;
  }>;
  keyObligations?: Array<{
    description:string;
    responsibleParty?: string;
    dueDate?: string | null;
  }>;
  recommendations?: string[];
  // Add other fields from AnalysisResult as you refine the prompt
}


// ... (other imports: Document, initializeVectorStore, queryVectorStore, addDocumentsToVectorStore, extractTextFromPDF)
// Import the new function from geminiService
import { getStructuredAnalysisFromGemini } from './geminiService'; // Adjust path

// ... (initializeContractKnowledgeBase, initializeContractRAG, addContractFileToRAG remain the same)

/**
 * Analyzes a contract using RAG-enhanced Gemini, expecting a structured JSON response.
 */
export async function analyzeContractWithRAG( // Renamed from your original analyzeContractWithRAG
  contractTextToAnalyze: string,
  userQuery: string, // This query will guide the *focus* of the structured analysis
  options?: {
    targetContractId?: string;
    retrieveSimilarContext?: boolean;
    maxChunksFromTarget?: number;
    maxSimilarDocs?: number;
  }
): Promise<TargetJsonStructure> { // Return type changed
  try {
    await initializeVectorStore([]); // Ensure vector store is ready

    let specificContractContext = "";
    let generalSimilarContext = "";
    const {
      targetContractId,
      retrieveSimilarContext = true,
      maxChunksFromTarget = 3,
      maxSimilarDocs = 2
    } = options || {};

    // Strategy 1: Get relevant chunks from the *target contract itself* (remains the same)
    if (targetContractId && userQuery) {
      try {
        const targetFilter = { contractId: targetContractId };
        const targetChunks = await queryVectorStore(userQuery, maxChunksFromTarget, targetFilter);
        if (targetChunks && targetChunks.length > 0) {
          specificContractContext = "\n\n--- Relevant Sections from the Contract Being Analyzed (ID: " + targetContractId + ") ---\n";
          specificContractContext += targetChunks
            .map(chunk => `Excerpt:\n${chunk.pageContent}`)
            .join("\n\n---\n\n");
        }
      } catch (e) { console.error(`Error fetching context for target contract ${targetContractId}:`, e); }
    }

    // Strategy 2: Get context from *other similar documents/contracts* (remains the same)
    if (retrieveSimilarContext) {
      try {
        const queryForGeneralSimilarity = userQuery + "\n\n" + contractTextToAnalyze.substring(0, 1000);
        const similarDocs = await queryVectorStore(queryForGeneralSimilarity, maxSimilarDocs);
        if (similarDocs && similarDocs.length > 0) {
          generalSimilarContext = "\n\n--- Context from Other Potentially Similar Contracts/Clauses ---\n";
          generalSimilarContext += similarDocs
            .map(doc => `Source Document ID: ${doc.metadata?.contractId || 'N/A'}\nContent Snippet:\n${doc.pageContent}`)
            .join("\n\n---\n\n");
        }
      } catch (e) { console.error(`Error fetching general similar context:`, e); }
    }

    // ***** PROMPT ENGINEERING FOR JSON OUTPUT *****
    const jsonSchemaForPrompt = `
    {
      "executiveSummary": "string (concise overview of the contract, its purpose, main parties, and key outcomes/terms)",
      "documentType": "string (e.g., 'Master Service Agreement', 'NDA', 'Software License Agreement', 'Not Specified')",
      "partiesInvolved": [
        { "name": "string (full name of the party)", "role": "string (e.g., 'Client', 'Vendor', 'Licensor', 'Licensee', 'Service Provider', 'Customer', or their specific role in contract like 'Buyer', 'Seller')" }
      ],
      "keyDates": {
        "effectiveDate": "string (YYYY-MM-DD format, or null if not found)",
        "expirationDate": "string (YYYY-MM-DD format, or null if not found)",
        "renewalDate": "string (YYYY-MM-DD format, or null if not found, or description of renewal terms)"
      },
      "identifiedRisks": [
        { "level": "string ('low', 'medium', 'high', or 'unknown')", "description": "string (clear description of the risk)", "mitigation": "string (suggested mitigation, if any, or null)" }
      ],
      "keyObligations": [
        { "description": "string (clear description of the obligation)", "responsibleParty": "string (who is responsible, e.g., 'Client', 'Vendor', or specific party name, or 'Both')", "dueDate": "string (YYYY-MM-DD or description of timing, or null)" }
      ],
      "recommendations": ["string (actionable recommendations based on the analysis, list of strings)"]
    }
    `;

    const enhancedPromptForJson = `
You are an expert legal AI assistant. Analyze the following contract based on the user's query and the provided context.
Your primary task is to extract specific information and structure it as a JSON object.

User's Query for focus: "${userQuery}"

Contract to Analyze:
\`\`\`text
${contractTextToAnalyze}
\`\`\`
${specificContractContext}
${generalSimilarContext}

INSTRUCTIONS:
1.  Carefully read the "Contract to Analyze".
2.  Use the "User's Query" to guide the focus of your extraction and summary.
3.  If "Relevant Sections from the Contract Being Analyzed" are provided, prioritize information from these excerpts for the JSON fields.
4.  If "Context from Other Potentially Similar Contracts/Clauses" is provided, use it for comparison or to understand standard terms if it helps in interpreting the main contract, but the JSON output must pertain to the "Contract to Analyze".
5.  You MUST return your entire response as a single, valid JSON object that strictly adheres to the following schema. Do NOT include any text outside of this JSON object (e.g., no "Here is the JSON:" preamble).

JSON Schema to follow:
${jsonSchemaForPrompt}

Specific instructions for fields:
-   **executiveSummary**: Provide a concise summary (2-4 sentences) of the "Contract to Analyze", informed by the "User's Query".
-   **documentType**: Identify the type of contract (e.g., MSA, NDA, SLA). If not clear, state "Not Specified".
-   **partiesInvolved**: List all distinct parties. If roles are not explicit, infer from context or state role as "Party".
-   **keyDates**: Extract specified dates. If a date is not found, use null for that date field.
-   **identifiedRisks**: Based on the "User's Query" and the contract, list 2-5 key risks. If no specific risks are apparent related to the query or overall, provide a general statement in the description and set level to 'unknown' or 'low'.
-   **keyObligations**: Based on the "User's Query" and the contract, list 2-5 key obligations.
-   **recommendations**: Provide 1-3 actionable recommendations based on the analysis and user query.

If information for a field or sub-field is not found or not applicable, use an appropriate empty value (e.g., empty string "", empty array [], null for optional object fields) as indicated in the schema or use a sensible default like "Not specified". Ensure the JSON is well-formed.

Begin JSON output now:
`;

    // Call the new Gemini service function
    const result = await getStructuredAnalysisFromGemini(enhancedPromptForJson);

    if (!result.success || !result.analysis) {
      throw new Error(result.error || "Failed to get structured analysis from Gemini.");
    }

    // The result.analysis should now be a JavaScript object matching TargetJsonStructure (or 'any')
    // TODO: You might want to validate result.analysis against the TargetJsonStructure schema here
    // before returning, or handle potential discrepancies.
    return result.analysis as TargetJsonStructure;

  } catch (error) {
    console.error("Error in analyzeContractWithRAG (structured):", error);
    if (error instanceof Error) {
      throw new Error(`RAG Structured Analysis Failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during RAG structured analysis.");
  }
}
