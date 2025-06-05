// contractRagService.ts
import { Document } from "@langchain/core/documents";
import { initializeVectorStore, queryVectorStore, addDocumentsToVectorStore } from './ragService';
import { extractTextFromPdf } from './pdfService';
import { getStructuredAnalysisFromGemini, StructuredAnalysisResponse } from './geminiService'; // Assuming this is correctly defined in geminiService

let isKnowledgeBaseInitialized = false;

// SINGLE, CORRECT DEFINITION of TargetJsonStructure
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
    mitigation?: string | null;
  }>;
  keyObligations?: Array<{
    description: string;
    responsibleParty?: string;
    dueDate?: string | null;
  }>;
  recommendations?: string[];
  financialDetails?: {
    currency?: string | null;
    totalContractValue?: string | null;
    paymentTerms?: Array<{
        term: string;
        schedule?: string | null;
        amount?: string | null;
    }> | null;
    renewalFees?: string | null;
    terminationPenalties?: Array<{
        condition: string;
        fee: string;
    }> | null;
    liabilityCap?: string | null;
  } | null;
  benchmarkingInsights?: string[] | null;
  contractTaxonomy?: string | null;
  //governingLaw?: string | null; // Example: Add if needed from your UI mapping
  //renewalInformation?: { terms?: string; noticePeriod?: string; } | null; // Example
  //confidentiality?: { isConfidential: boolean; clauses?: string[]; } | null; // Example
  //keyHighlights?: Array<{ category?: string; title?: string; description: string; riskLevel?: 'low' | 'medium' | 'high' | 'unknown'; }> | null; // Example for keyFindings
  //extractedClauses?: Array<{ type: string; title: string; summary: string; verbatim?: string; location_in_document?: string; importance?: 'low'|'medium'|'high'; }> | null; // Example
  //contractScore?: { overall: number; risk: number; compliance: number; clarity: number; } | null; // Example
  //generalInsights?: string[] | null; // Example
  //actionableRecommendations?: string[] | null; // If different from 'recommendations'
}


export async function initializeContractKnowledgeBase(
  sampleContractsData: Array<{ id: string; text: string; metadata: any }>
): Promise<void> {
  try {
    if (isKnowledgeBaseInitialized) {
      console.log("Contract knowledge base samples already processed for initialization.");
      await initializeVectorStore([]);
      // return;
    }
    const documentsToStore: Document[] = sampleContractsData.map(item => new Document({
      pageContent: item.text,
      metadata: {
        ...item.metadata,
        contractId: item.id,
        source: 'sample_document',
        processingTimestamp: new Date().toISOString(),
      }
    }));
    if (documentsToStore.length > 0) {
      await initializeVectorStore(documentsToStore);
      console.log(`Contract knowledge base initialized with ${documentsToStore.length} sample documents.`);
    } else {
      await initializeVectorStore([]);
      console.log("Contract knowledge base: No sample documents provided, vector store initialized.");
    }
    isKnowledgeBaseInitialized = true;
  } catch (error) {
    console.error("Error initializing contract knowledge base:", error);
    isKnowledgeBaseInitialized = false;
    throw error;
  }
}

export async function initializeContractRAG(): Promise<void> {
  try {
    if (isKnowledgeBaseInitialized) {
      console.log("Contract RAG system's initial knowledge base already processed. Ensuring store is ready.");
      await initializeVectorStore([]);
      return;
    }
    const sampleContractsData = [
      {
        id: "MSA_Sample_001",
        text: "This is a sample Master Service Agreement...",
        metadata: { type: "Master Service Agreement", partiesInvolvedNames: ["Company A", "Company B"] }
      },
      {
        id: "NDA_Sample_001",
        text: "This Non-Disclosure Agreement (NDA) is entered into by...",
        metadata: { type: "Non-Disclosure Agreement", partiesInvolvedNames: ["Company X", "Company Y"] }
      },
      {
        id: "SLA_Sample_001",
        text: "Software License Agreement: This agreement grants...",
        metadata: { type: "Software License Agreement" }
      }
    ];
    await initializeContractKnowledgeBase(sampleContractsData);
    console.log("Contract RAG system initialized with sample knowledge base.");
  } catch (error) {
    console.error("Error initializing Contract RAG system:", error);
    throw error;
  }
}

export async function addContractFileToRAG(contractId: string, file: File, userMetadata: any = {}): Promise<void> {
  try {
    await initializeVectorStore([]);
    let text: string;
    if (file.type === 'application/pdf') {
      text = await extractTextFromPdf(file);
    } else if (file.type.startsWith('text/') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      console.warn(`Attempting to read ${file.name} as text. For DOC/DOCX, ensure appropriate parsing.`);
      text = await file.text();
    } else {
      console.warn(`Unsupported file type: ${file.type}. Skipping file: ${file.name}`);
      throw new Error(`Unsupported file type: ${file.type}. Supported: PDF, TXT, DOC, DOCX`);
    }
    const documentToAdd = new Document({
      pageContent: text,
      metadata: {
        ...userMetadata,
        contractId: contractId,
        fileName: file.name,
        fileType: file.type,
        source: 'uploaded_document',
        uploadTimestamp: new Date().toISOString(),
      }
    });
    await addDocumentsToVectorStore([documentToAdd]);
    console.log(`Contract '${contractId}' (file: ${file.name}) processed and added to RAG system.`);
  } catch (error) {
    console.error(`Error adding contract file '${file.name}' (ID: ${contractId}) to RAG:`, error);
    throw error;
  }
}


// ====================================================================================
// SINGLE, CORRECT DEFINITION of analyzeContractWithRAG
// This is the version that handles taxonomy, financialDetails, benchmarkingInsights,
// and the isChatQuery flag.
// ====================================================================================
export async function analyzeContractWithRAG(
  contractTextToAnalyze: string,
  userQuery: string,
  options?: {
    targetContractId?: string;
    retrieveSimilarContext?: boolean;
    maxChunksFromTarget?: number;
    maxSimilarDocs?: number;
    taxonomy?: string;
    isChatQuery?: boolean;
  }
): Promise<TargetJsonStructure | string> { // Return type can be string for chat
  try {
    console.log('[contractRagService] analyzeContractWithRAG called with options:', options);
    console.log('[contractRagService] User Query:', userQuery);

    await initializeVectorStore([]);

    let specificContractContext = "";
    let generalSimilarContext = "";
    const {
      targetContractId,
      retrieveSimilarContext = true,
      maxChunksFromTarget = 3,
      maxSimilarDocs = 2,
      taxonomy,
      isChatQuery = false
    } = options || {};

    if (targetContractId && userQuery) {
      try {
        const targetFilter = { contractId: targetContractId };
        const targetChunks = await queryVectorStore(userQuery, maxChunksFromTarget, targetFilter);
        if (targetChunks && targetChunks.length > 0) {
          specificContractContext = `\n\n--- Relevant Excerpts from the Contract Being Analyzed (ID: ${targetContractId}) ---\n`;
          specificContractContext += targetChunks
            .map((chunk, i) => `Excerpt ${i + 1}:\n${chunk.pageContent}`)
            .join("\n\n---\n\n");
        }
      } catch (e) { console.error(`Error fetching context for target contract ${targetContractId}:`, e); }
    }

    if (retrieveSimilarContext) {
      try {
        const queryForGeneralSimilarity = `${userQuery}\n\n${contractTextToAnalyze.substring(0, 1000)}`;
        // For general context, don't filter by targetContractId if it's set
        const generalFilter = targetContractId ? { contractId: { $ne: targetContractId } } : undefined;
        const similarDocs = await queryVectorStore(queryForGeneralSimilarity, maxSimilarDocs, generalFilter);
        if (similarDocs && similarDocs.length > 0) {
          generalSimilarContext = "\n\n--- Context from Other Potentially Similar Contracts/Clauses ---\n";
          generalSimilarContext += similarDocs
            .map(doc => `Source Document (ID: ${doc.metadata?.contractId || 'N/A'}, Type: ${doc.metadata?.userProvidedType || doc.metadata?.type || 'N/A'}):\n${doc.pageContent}`)
            .join("\n\n---\n\n");
        }
      } catch (e) { console.error(`Error fetching general similar context:`, e); }
    }

    if (isChatQuery) {
        const chatPrompt = `
You are an AI assistant discussing a contract previously analyzed.
The user's question is: "${userQuery}"
The contract context (which might be its full text or prior analysis summary) is:
\`\`\`text
${contractTextToAnalyze} 
\`\`\`
${specificContractContext || "No specific excerpts from this contract were retrieved for this query."}
${generalSimilarContext || "No general similar context was retrieved for this query."}

Based on this, provide a concise answer to the user's question.
Answer:
`;
        console.log('[contractRagService] Sending chat prompt to geminiService.');
        const result = await getStructuredAnalysisFromGemini(chatPrompt, false); // expectJson is false
        if (!result.success || typeof result.analysis !== 'string') {
            throw new Error(result.error || "Failed to get chat response or response was not a string.");
        }
        console.log('[contractRagService] Received chat response from geminiService:', result.analysis);
        return result.analysis;
    }

    // --- PROMPT FOR STRUCTURED JSON (Main Analysis) ---
    // This is the detailed schema definition for the LLM
    const jsonSchemaForPrompt = `
    You MUST output a single, valid JSON object. Do NOT include any text outside this JSON object.
    The JSON object should strictly adhere to the following structure:
    {
      "executiveSummary": "string (A concise 2-4 sentence summary of the contract focusing on its purpose, main parties, and key outcomes, tailored by the user's query and the provided contract taxonomy if available.)",
      "documentType": "string (e.g., 'Master Service Agreement', 'Non-Disclosure Agreement', 'IT Support Contract'. If a contract taxonomy is provided by the user, reflect that or refine it based on content. If unclear, use 'Not Specified'.)",
      "contractTaxonomy": "string (The contract taxonomy provided by the user, or if none, the LLM's best guess, e.g., 'IT', 'Professional Services'. Use null if truly unclassifiable.)",
      "partiesInvolved": [
        { "name": "string (Full official name of the party)", "role": "string (e.g., 'Client', 'Vendor', 'Licensor', 'Service Provider', or their specific contractual role)" }
      ],
      "keyDates": {
        "effectiveDate": "string (YYYY-MM-DD format, or null)",
        "expirationDate": "string (YYYY-MM-DD format, or null if not fixed/perpetual)",
        "renewalDate": "string (YYYY-MM-DD, textual description like 'Annually on anniversary', or null)"
      },
      "financialDetails": {
        "currency": "string (e.g., 'USD', 'EUR', 'GBP', or null if not specified. Infer if possible.)",
        "totalContractValue": "string (e.g., '100000', 'Approx. 50000 per year', 'Not specified', or null. Extract specific figures if available.)",
        "paymentTerms": [ { "term": "string (e.g., 'Net 30 days', 'Upon receipt')", "schedule": "string (e.g., 'Monthly', 'Per milestone', or null)", "amount": "string (e.g., '5000', 'Variable based on usage', or null)" } ],
        "renewalFees": "string (Specific fee or description like 'Subject to 5% annual increase', or null)",
        "terminationPenalties": [ { "condition": "string (e.g., 'Early termination by Client within 1st year')", "fee": "string (e.g., 'Equivalent to 3 months service fee', '2500', or null)" } ],
        "liabilityCap": "string (e.g., '1000000', 'Equal to fees paid in the last 12 months', 'Not specified', or null)"
      },
      "identifiedRisks": [
        { "level": "string ('low', 'medium', 'high', 'unknown')", "description": "string (Clear risk description, considering the contract taxonomy)", "mitigation": "string (Brief mitigation suggestion, or null)" }
      ],
      "keyObligations": [
        { "description": "string (Key obligation)", "responsibleParty": "string (Responsible party, e.g., 'Client', 'Vendor', specific name)", "dueDate": "string (YYYY-MM-DD, period like 'Monthly', or condition like 'Upon project completion', or null)" }
      ],
      "recommendations": ["string (1-3 actionable recommendations, considering the contract taxonomy.)"],
      "benchmarkingInsights": ["string (1-2 brief qualitative statements comparing key terms like payment, liability, termination to typical standards for the given contract taxonomy, if discernible. e.g., 'Payment terms (Net 30) are standard for IT contracts.' or 'Liability cap appears lower than typical for Professional Services agreements.' Use an empty array if no clear benchmarks can be stated.)"]
    }
    Ensure all string values are properly escaped for JSON. If a list should be empty, provide an empty array []. For optional string or object fields that are not found or not applicable, use null where appropriate (especially for dates and financial fields if not explicitly mentioned or found).
    `;

    const enhancedPromptForJson = `
You are an expert AI legal and procurement assistant performing a contract analysis.
The user's primary query/focus for this analysis is: "${userQuery}"
${taxonomy ? `The contract has been categorized by the user under the taxonomy: "${taxonomy}". Please tailor your analysis, risk assessment, and benchmarking considering common practices for this category of contract (e.g., for an "IT" contract, focus on IT-related risks, clauses, and benchmarks).` : "The user has not specified a contract taxonomy. Use your best judgment to infer one if possible (and state it in the 'contractTaxonomy' field), or analyze generally."}

Here is the full text of the contract to analyze:
\`\`\`text
${contractTextToAnalyze}
\`\`\`
${specificContractContext || "No specific excerpts from this contract were retrieved for this query."}
${generalSimilarContext || "No general similar context from other documents was retrieved for this query."}

Based on all the provided information (prioritizing the full contract text, then relevant excerpts, and context from other similar contracts for comparison or clarification), please extract the requested information.
Your entire response MUST be a single, valid JSON object adhering to the schema and instructions below. Do NOT include any text outside this JSON object (no preambles, no explanations, just the JSON).

${jsonSchemaForPrompt}
JSON object:
`;

    console.log('[contractRagService] Final enhancedPromptForJson for Gemini (structured analysis):', /* For brevity, not logging the full prompt here but you can: enhancedPromptForJson */ `Length: ${enhancedPromptForJson.length}`);
    const result = await getStructuredAnalysisFromGemini(enhancedPromptForJson, true); // expectJson is true

    if (!result.success || !result.analysis || typeof result.analysis === 'string') {
      throw new Error(result.error || "Failed to get structured analysis or analysis was in an unexpected string format.");
    }
    
    const analysisResult = result.analysis as TargetJsonStructure;
    // Ensure the contractTaxonomy field in the result reflects what was used or inferred.
    if (!analysisResult.contractTaxonomy && taxonomy) {
        analysisResult.contractTaxonomy = taxonomy; // If LLM didn't set it, use user's input.
    } else if (!analysisResult.contractTaxonomy && !taxonomy && analysisResult.documentType) {
        // If LLM identified a documentType but not taxonomy, and user didn't provide, use documentType as a fallback.
        analysisResult.contractTaxonomy = analysisResult.documentType;
    }


    console.log('[contractRagService] Raw structured analysis received from geminiService:', analysisResult);
    return analysisResult;

  } catch (error) {
    console.error('[contractRagService] Error in analyzeContractWithRAG (catch block):', error);
    if (error instanceof Error) {
        throw new Error(`RAG Analysis Failed in contractRagService: ${error.message}`);
    }
    throw new Error("An unknown error occurred during RAG analysis in contractRagService.");
  }
}
