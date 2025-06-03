import { analyzeContractWithGemini } from './geminiService';
import { Document } from "@langchain/core/documents";
// ragService functions now expect Document[] and handle chunking internally
import { initializeVectorStore, queryVectorStore, addDocumentsToVectorStore } from './ragService';
import { extractTextFromPDF } from './pdfService'; // Assuming direct import is fine

// Module-level flag for initialization state, consistent with ragService
let isKnowledgeBaseInitialized = false;

/**
 * Initializes the contract knowledge base with sample contracts.
 * Documents are created here with metadata and passed to ragService for chunking and storage.
 */
export async function initializeContractKnowledgeBase(
  sampleContractsData: Array<{ id: string; text: string; metadata: any }>
): Promise<void> {
  try {
    // In this revised model, initializeVectorStore in ragService handles the isInitialized check for the store itself.
    // contractRagService's isKnowledgeBaseInitialized refers to loading its initial dataset.
    if (isKnowledgeBaseInitialized) {
        console.log("Contract knowledge base samples already processed for initialization.");
        // If initializeVectorStore itself is idempotent or handles multiple calls, this is fine.
        // Otherwise, we might only call initializeVectorStore once globally.
        // For now, let's assume ragService.initializeVectorStore can be called to ensure store is ready
        // and potentially add these documents if the store was empty or reset.
    }

    const documentsToStore: Document[] = sampleContractsData.map(item => new Document({
      pageContent: item.text, // Full text, ragService will chunk
      metadata: {
        ...item.metadata, // User-provided metadata for the sample
        contractId: item.id,
        source: 'sample_document', // Mark as a sample
        processingTimestamp: new Date().toISOString(),
      }
    }));

    if (documentsToStore.length > 0) {
      // ragService.initializeVectorStore will chunk and add these documents
      await initializeVectorStore(documentsToStore);
      console.log(`Contract knowledge base initialized with ${documentsToStore.length} sample documents.`);
      isKnowledgeBaseInitialized = true; // Mark that these samples have been processed at least once
    } else {
      // Ensure vector store is initialized even if no samples are provided this time
      await initializeVectorStore([]);
      console.log("Contract knowledge base: No sample documents provided, vector store initialized if not already.");
      isKnowledgeBaseInitialized = true; // Still mark as "attempted to initialize"
    }

  } catch (error) {
    console.error("Error initializing contract knowledge base:", error);
    isKnowledgeBaseInitialized = false; // Reset on error
    throw error; // Re-throw to allow calling function to handle
  }
}

/**
 * Main initialization function for the RAG system from the contract perspective.
 * Loads sample contracts into the vector store.
 */
export async function initializeContractRAG(): Promise<void> {
  try {
    // The isKnowledgeBaseInitialized flag in this service ensures we only load samples once per "session"
    // or until an error resets it. The underlying vector store init is handled by ragService.
    if (isKnowledgeBaseInitialized) {
      console.log("Contract RAG system's initial knowledge base already processed.");
      // Ensure the underlying vector store is ready (idempotent call)
      await initializeVectorStore([]);
      return;
    }

    const sampleContractsData = [
      {
        id: "MSA_Sample_001",
        text: "This is a sample Master Service Agreement...", // Full text
        metadata: { type: "Master Service Agreement", parties: ["Company A", "Company B"] }
      },
      {
        id: "NDA_Sample_001",
        text: "This Non-Disclosure Agreement (NDA) is entered into by...", // Full text
        metadata: { type: "Non-Disclosure Agreement", parties: ["Company X", "Company Y"] }
      },
      {
        id: "SLA_Sample_001",
        text: "Software License Agreement: This agreement grants...", // Full text
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
 * The file content is extracted, a Document object is created, and then passed to ragService.
 */
export async function addContractFileToRAG(contractId: string, file: File, userMetadata: any = {}): Promise<void> {
  try {
    // Ensure the vector store is ready via ragService's initializer
    // This call is idempotent and ensures vectorStore instance exists in ragService
    await initializeVectorStore([]);

    let text: string;
    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(file); // Assuming pdfService is robust
    } else if (file.type.startsWith('text/')) {
      text = await file.text();
    } else {
      console.warn(`Unsupported file type: ${file.type}. Skipping file: ${file.name}`);
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    const documentToAdd = new Document({
      pageContent: text, // Full text, ragService will chunk
      metadata: {
        ...userMetadata, // Metadata provided by the user during upload
        contractId: contractId, // Unique ID for this contract
        fileName: file.name,
        fileType: file.type,
        source: 'uploaded_document',
        uploadTimestamp: new Date().toISOString(),
      }
    });

    // addDocumentsToVectorStore in ragService now expects Document[] and handles chunking
    await addDocumentsToVectorStore([documentToAdd]);
    console.log(`Contract '${contractId}' (file: ${file.name}) processed and added to RAG system.`);

  } catch (error) {
    console.error(`Error adding contract file '${file.name}' (ID: ${contractId}) to RAG:`, error);
    throw error;
  }
}

/**
 * Analyzes a contract using RAG-enhanced Gemini.
 * Can use context from the contract itself (if previously added) and/or similar contracts.
 */
export async function analyzeContractWithRAG(
  contractTextToAnalyze: string, // The actual text of the contract to analyze
  userQuery: string, // Specific question or analysis request from the user
  options?: {
    targetContractId?: string; // If the contractTextToAnalyze corresponds to a contractId in the store
    retrieveSimilarContext?: boolean; // Whether to fetch context from other similar contracts
    maxSimilarDocs?: number;
  }
): Promise<string> {
  try {
    // Ensure vector store is initialized
    await initializeVectorStore([]);

    let ragContext = "";
    const {
        targetContractId,
        retrieveSimilarContext = true, // Default to true
        maxSimilarDocs = 2
    } = options || {};

    // Strategy 1: Get context from the *target contract itself* if its ID is known
    // This assumes the contract (or its chunks) is already in the vector store.
    // For this to work effectively, queryVectorStore would need a way to filter by metadata (e.g., contractId)
    // or the query itself needs to be specific enough to pull chunks from that contract.
    // For now, if a targetContractId is provided, we can attempt a general query potentially prefixed
    // or scoped if queryVectorStore supports metadata filters.
    // This part is more advanced and depends on ragService.queryVectorStore capabilities.
    // We can build a simpler version for now.

    // Strategy 2: Get context from *similar documents/contracts* in the vector store
    if (retrieveSimilarContext) {
      // Use a snippet of the contract or the user query to find similar documents
      const queryForSimilarity = contractTextToAnalyze.substring(0, 1000); // Or userQuery
      const similarDocs = await queryVectorStore(queryForSimilarity, maxSimilarDocs);

      if (similarDocs && similarDocs.length > 0) {
        ragContext += "\n\n--- Context from potentially similar contracts or clauses in the knowledge base ---\n";
        ragContext += similarDocs
          .map(doc => `Source Document ID: ${doc.metadata?.contractId || 'N/A'}\nContent Snippet:\n${doc.pageContent}`)
          .join("\n\n---\n\n");
      } else {
        ragContext += "\n\n--- No highly similar contracts or clauses found in the knowledge base for additional context. ---\n";
      }
    }

    const enhancedPrompt = `
You are a contract analysis expert. Please analyze the following contract based on the user's query.
Use any provided contextual information from similar contracts or clauses to enhance your analysis if relevant.

User's Query: "${userQuery}"

Contract to Analyze:
\`\`\`
${contractTextToAnalyze}
\`\`\`
${ragContext}

Please provide a detailed, professional, and actionable response to the user's query.
If the query is general (e.g., "analyze this contract"), then identify:
1. Key terms and clauses.
2. Potential risks or ambiguities.
3. Obligations of the involved parties.
4. Recommendations or points of attention.
If context from similar documents was provided, you can use it for comparison or to highlight standard practices, but the primary focus should be the "Contract to Analyze".
`;

    const result = await analyzeContractWithGemini(enhancedPrompt);

    if (!result.success || typeof result.analysis !== 'string') {
      throw new Error(result.error || "Failed to analyze contract with Gemini or received invalid response.");
    }

    return result.analysis;
  } catch (error) {
    console.error("Error analyzing contract with RAG:", error);
    // Consider if the error object itself is more informative or if a custom message is better
    if (error instanceof Error) {
        throw new Error(`RAG Analysis Failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during RAG analysis.");
  }
}
