import { Document } from "@langchain/core/documents";
// ragService functions now expect Document[] and handle chunking internally
// queryVectorStore now supports an optional metadata filter
import { initializeVectorStore, queryVectorStore, addDocumentsToVectorStore } from './ragService';
import { extractTextFromPDF } from './pdfService'; // Assuming direct import is fine

// Import the new function from geminiService and the placeholder type
import { getStructuredAnalysisFromGemini, StructuredAnalysisResponse } from './geminiService';

// Module-level flag for initialization state
let isKnowledgeBaseInitialized = false;

// Define the target structure for the JSON output from Gemini.
// This should evolve to match your UI's `AnalysisResult` interface more completely.
// Start with a manageable subset.
export interface TargetJsonStructure {
  executiveSummary: string;
  documentType?: string; // e.g., 'Master Service Agreement', 'NDA', 'Software License Agreement'
  partiesInvolved?: Array<{ name: string; role?: string }>; // role e.g., 'Client', 'Vendor'
  keyDates?: {
    effectiveDate?: string | null; // YYYY-MM-DD or null
    expirationDate?: string | null; // YYYY-MM-DD or null
    renewalDate?: string | null; // YYYY-MM-DD, description, or null
  };
  identifiedRisks?: Array<{
    level: 'low' | 'medium' | 'high' | 'unknown';
    description: string;
    mitigation?: string | null;
  }>;
  keyObligations?: Array<{
    description: string;
    responsibleParty?: string; // e.g., 'Client', 'Vendor', 'Both'
    dueDate?: string | null; // YYYY-MM-DD, description, or null
  }>;
  recommendations?: string[];
  // Future fields to align with UI's AnalysisResult:
  // keyFindings: Array<{ type: string; label: string; value: string; risk: 'low' | 'medium' | 'high'; }>;
  // clauses: Array<{ type: string; title: string; content: string; location: string; importance: 'low' | 'medium' | 'high'; }>;
  // financialInformation: { spendFY2024?: string; totalContractValue?: string; rateCards?: string; paymentTerms?: string };
  // termAndTermination: { contractTerm?: string; renewalClauses?: string; terminationRights?: string; };
  // score: { overall: number; risk: number; compliance: number; clarity: number; };
  // insights: string[];
}


/**
 * Initializes the contract knowledge base with sample contracts.
 * Documents are created here with metadata and passed to ragService for chunking and storage.
 */
export async function initializeContractKnowledgeBase(
  sampleContractsData: Array<{ id: string; text: string; metadata: any }>
): Promise<void> {
  try {
    if (isKnowledgeBaseInitialized) {
      console.log("Contract knowledge base samples already processed for initialization.");
      // Ensure vector store itself is ready (idempotent call)
      await initializeVectorStore([]);
      // return; // Decide if you want to prevent re-adding samples
    }

    const documentsToStore: Document[] = sampleContractsData.map(item => new Document({
      pageContent: item.text, // Full text, ragService will chunk
      metadata: {
        ...item.metadata, // User-provided metadata for the sample
        contractId: item.id,
        source: 'sample_document',
        processingTimestamp: new Date().toISOString(),
      }
    }));

    if (documentsToStore.length > 0) {
      await initializeVectorStore(documentsToStore);
      console.log(`Contract knowledge base initialized with ${documentsToStore.length} sample documents.`);
    } else {
      // Ensure vector store is initialized even if no samples are provided
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

/**
 * Main initialization function for the RAG system from the contract perspective.
 */
export async function initializeContractRAG(): Promise<void> {
  try {
    if (isKnowledgeBaseInitialized) {
      console.log("Contract RAG system's initial knowledge base already processed. Ensuring store is ready.");
      await initializeVectorStore([]); // Still ensure the underlying store is ready
      return;
    }

    const sampleContractsData = [
      {
        id: "MSA_Sample_001",
        text: "This is a sample Master Service Agreement between Company A and Company B for professional services. The agreement covers scope of work, payment terms, intellectual property rights, and confidentiality provisions.",
        metadata: { type: "Master Service Agreement", partiesInvolvedNames: ["Company A", "Company B"] }
      },
      {
        id: "NDA_Sample_001",
        text: "This Non-Disclosure Agreement (NDA) is entered into by and between Company X and Company Y to protect confidential information shared during business discussions. The agreement defines confidential information, permitted use, and the duration of confidentiality obligations.",
        metadata: { type: "Non-Disclosure Agreement", partiesInvolvedNames: ["Company X", "Company Y"] }
      },
      {
        id: "SLA_Sample_001",
        text: "Software License Agreement: This agreement grants the licensee the right to use the software under specified terms and conditions. It includes license scope, restrictions, warranty disclaimers, and limitation of liability clauses.",
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

/**
 * Adds a contract file to the RAG system.
 */
export async function addContractFileToRAG(contractId: string, file: File, userMetadata: any = {}): Promise<void> {
  try {
    await initializeVectorStore([]); // Ensure vector store is ready

    let text: string;
    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(file);
    } else if (file.type.startsWith('text/') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      // For DOC/DOCX, pdfService would need to be enhanced or use a different parser.
      // Assuming extractTextFromPDF can handle them or text extraction is simplified.
      console.warn(`Attempting to read ${file.name} as text. For DOC/DOCX, ensure appropriate parsing.`);
      text = await file.text(); // This is a placeholder for .doc/.docx, ideally use a robust parser.
                                  // Or enhance pdfService to handle these types with a library.
    } else {
      console.warn(`Unsupported file type: ${file.type}. Skipping file: ${file.name}`);
      throw new Error(`Unsupported file type: ${file.type}. Supported: PDF, TXT, DOC, DOCX`);
    }

    const documentToAdd = new Document({
      pageContent: text, // Full text, ragService will chunk
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

/**
 * Analyzes a contract using RAG-enhanced Gemini, expecting a structured JSON response.
 */
export async function analyzeContractWithRAG(
  contractTextToAnalyze: string,
  userQuery: string,
  options?: {
    targetContractId?: string;
    retrieveSimilarContext?: boolean;
    maxChunksFromTarget?: number;
    maxSimilarDocs?: number;
  }
): Promise<TargetJsonStructure> { // Return type changed to the structured object
  try {
    await initializeVectorStore([]);

    let specificContractContext = "";
    let generalSimilarContext = "";
    const {
      targetContractId,
      retrieveSimilarContext = true,
      maxChunksFromTarget = 3,
      maxSimilarDocs = 2
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
        const similarDocs = await queryVectorStore(queryForGeneralSimilarity, maxSimilarDocs);
        if (similarDocs && similarDocs.length > 0) {
          generalSimilarContext = "\n\n--- Context from Other Potentially Similar Contracts/Clauses ---\n";
          generalSimilarContext += similarDocs
            .map(doc => `Source Document (ID: ${doc.metadata?.contractId || 'N/A'}):\n${doc.pageContent}`)
            .join("\n\n---\n\n");
        }
      } catch (e) { console.error(`Error fetching general similar context:`, e); }
    }

    const jsonSchemaForPrompt = `
    You MUST output a single, valid JSON object. Do NOT include any text outside this JSON object (e.g., no "Here is the JSON:" or similar preambles or explanations).
    The JSON object should strictly adhere to the following structure:
    {
      "executiveSummary": "string (A concise 2-4 sentence summary of the contract focusing on its purpose, main parties, and key outcomes, tailored by the user's query.)",
      "documentType": "string (e.g., 'Master Service Agreement', 'Non-Disclosure Agreement', 'Software License Agreement', or 'Not Specified' if unclear.)",
      "partiesInvolved": [
        { "name": "string (Full official name of the party)", "role": "string (e.g., 'Client', 'Vendor', 'Licensor', 'Licensee', 'Service Provider', 'Customer', or their specific contractual role like 'Buyer', 'Seller', or 'Party' if role is generic/unclear)" }
      ],
      "keyDates": {
        "effectiveDate": "string (Extracted date in YYYY-MM-DD format. If not found or ambiguous, use null.)",
        "expirationDate": "string (Extracted date in YYYY-MM-DD format. If not found, a fixed term is not specified, or it's perpetual, use null.)",
        "renewalDate": "string (Extracted date in YYYY-MM-DD format, or a textual description of renewal terms like 'Annually on anniversary' or 'Automatic 60-day notice'. Use null if no renewal terms are found.)"
      },
      "identifiedRisks": [
        { "level": "string (Choose one: 'low', 'medium', 'high', 'unknown'. Base this on common business/legal risk perceptions.)", "description": "string (Clear, concise description of the identified risk. Focus on risks relevant to the user's query if specified, otherwise general key risks.)", "mitigation": "string (A brief, actionable suggestion for mitigation, or null if not immediately obvious or applicable.)" }
      ],
      "keyObligations": [
        { "description": "string (Clear description of a key contractual obligation.)", "responsibleParty": "string (The party responsible, e.g., 'Client', 'Vendor', specific party name, or 'Both Parties'. If unclear, use 'Unclear'.)", "dueDate": "string (Due date in YYYY-MM-DD, a recurring period like 'Monthly', or a condition like 'Upon project completion'. Use null if not specified.)" }
      ],
      "recommendations": ["string (A list of 1-3 actionable recommendations based on the overall analysis and the user's query. Each recommendation should be a string.)"]
    }
    Ensure all string values are properly escaped for JSON. If a list should be empty (e.g., no risks found), provide an empty array []. For optional string or object fields that are not found, use null where appropriate or omit if the schema implies optionality (but for this schema, provide nulls for dates if not found).
    `;

    const enhancedPromptForJson = `
You are an expert AI legal assistant performing a contract analysis.
The user's query for this analysis is: "${userQuery}"

Here is the full text of the contract to analyze:
\`\`\`text
${contractTextToAnalyze}
\`\`\`
${specificContractContext}
${generalSimilarContext}

Based on all the provided information (prioritizing the full contract text, then relevant excerpts if provided, and then context from other similar contracts for comparison or clarification), please extract the requested information and structure your entire response as a single, valid JSON object according to the schema and instructions below.

${jsonSchemaForPrompt}
JSON object:
`;

    console.log("Sending structured prompt to Gemini for analysis...");
    const result = await getStructuredAnalysisFromGemini(enhancedPromptForJson);

    if (!result.success || !result.analysis) {
      throw new Error(result.error || "Failed to get structured analysis from Gemini or analysis was empty.");
    }

    // Assuming result.analysis is the parsed JSON object matching TargetJsonStructure
    // Add further validation here if needed (e.g., using a JSON schema validator)
    console.log("Received structured analysis:", result.analysis);
    return result.analysis as TargetJsonStructure;

  } catch (error) {
    console.error("Error in analyzeContractWithRAG (structured JSON attempt):", error);
    if (error instanceof Error && error.message.includes("JSON")) {
        // If it's a JSON parse error from geminiService or here, it's already informative.
        throw error;
    } else if (error instanceof Error) {
        throw new Error(`RAG Structured Analysis Failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during RAG structured analysis.");
  }
}
