import { analyzeContractWithGemini } from './geminiService';
import { Document } from "@langchain/core/documents";
// ragService functions now expect Document[] and handle chunking internally
// queryVectorStore now supports an optional metadata filter
import { initializeVectorStore, queryVectorStore, addDocumentsToVectorStore } from './ragService';
import { extractTextFromPDF } from './pdfService'; // Assuming direct import is fine

// Module-level flag for initialization state, consistent with ragService
let isKnowledgeBaseInitialized = false;

// --- initializeContractKnowledgeBase function remains the same ---
export async function initializeContractKnowledgeBase(
  sampleContractsData: Array<{ id: string; text: string; metadata: any }>
): Promise<void> {
  try {
    if (isKnowledgeBaseInitialized) {
        console.log("Contract knowledge base samples already processed for initialization.");
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
      isKnowledgeBaseInitialized = true;
    } else {
      await initializeVectorStore([]);
      console.log("Contract knowledge base: No sample documents provided, vector store initialized if not already.");
      isKnowledgeBaseInitialized = true;
    }
  } catch (error) {
    console.error("Error initializing contract knowledge base:", error);
    isKnowledgeBaseInitialized = false;
    throw error;
  }
}

// --- initializeContractRAG function remains the same ---
export async function initializeContractRAG(): Promise<void> {
  try {
    if (isKnowledgeBaseInitialized) {
      console.log("Contract RAG system's initial knowledge base already processed.");
      await initializeVectorStore([]); // Ensure underlying store is ready
      return;
    }
    const sampleContractsData = [
      // ... your sample contracts data
      {
        id: "MSA_Sample_001",
        text: "This is a sample Master Service Agreement...",
        metadata: { type: "Master Service Agreement", parties: ["Company A", "Company B"] }
      },
      {
        id: "NDA_Sample_001",
        text: "This Non-Disclosure Agreement (NDA) is entered into by...",
        metadata: { type: "Non-Disclosure Agreement", parties: ["Company X", "Company Y"] }
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

// --- addContractFileToRAG function remains the same ---
export async function addContractFileToRAG(contractId: string, file: File, userMetadata: any = {}): Promise<void> {
  try {
    await initializeVectorStore([]); // Ensure vector store is ready

    let text: string;
    if (file.type === 'application/pdf') {
      text = await extractTextFromPDF(file);
    } else if (file.type.startsWith('text/')) {
      text = await file.text();
    } else {
      console.warn(`Unsupported file type: ${file.type}. Skipping file: ${file.name}`);
      throw new Error(`Unsupported file type: ${file.type}`);
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

/**
 * Analyzes a contract using RAG-enhanced Gemini.
 * Prioritizes context from the target contract itself using metadata filtering,
 * then optionally adds context from other similar contracts.
 */
export async function analyzeContractWithRAG(
  contractTextToAnalyze: string,
  userQuery: string,
  options?: {
    targetContractId?: string; // ID of the contract being analyzed (if it's in the vector store)
    retrieveSimilarContext?: boolean; // Whether to fetch context from other generally similar contracts
    maxChunksFromTarget?: number; // Max relevant chunks from the target contract
    maxSimilarDocs?: number; // Max relevant documents/chunks from other contracts
  }
): Promise<string> {
  try {
    await initializeVectorStore([]); // Ensure vector store is ready

    let specificContractContext = "";
    let generalSimilarContext = "";

    const {
      targetContractId,
      retrieveSimilarContext = true,
      maxChunksFromTarget = 3, // Default to retrieving 3 relevant chunks from the target contract
      maxSimilarDocs = 2     // Default to retrieving 2 similar documents/chunks from other contracts
    } = options || {};

    // Strategy 1: Get relevant chunks from the *target contract itself*
    if (targetContractId && userQuery) {
      try {
        const targetFilter = { contractId: targetContractId };
        console.log(`Querying for relevant chunks from target contract '${targetContractId}' based on query: "${userQuery.substring(0,100)}..."`);
        const targetChunks = await queryVectorStore(userQuery, maxChunksFromTarget, targetFilter);

        if (targetChunks && targetChunks.length > 0) {
          specificContractContext = "\n\n--- Relevant Sections from the Contract Being Analyzed ---\n";
          specificContractContext += targetChunks
            .map(chunk => `Section (relevance score may vary):\n${chunk.pageContent}`)
            .join("\n\n---\n\n");
          console.log(`Found ${targetChunks.length} relevant chunks from target contract '${targetContractId}'.`);
        } else {
          console.log(`No specific chunks found for contractId '${targetContractId}' matching the query. The full contract text will be the primary source.`);
        }
      } catch (e) {
        console.error(`Error fetching context for target contract ${targetContractId}:`, e);
        // Non-fatal, proceed without this specific context
      }
    }

    // Strategy 2: Get context from *other similar documents/contracts* in the vector store
    if (retrieveSimilarContext) {
      try {
        // Use a snippet of the contract or the user query to find generally similar documents
        const queryForGeneralSimilarity = contractTextToAnalyze.substring(0, 1000); // Or userQuery
        console.log(`Querying for generally similar documents based on content snippet: "${queryForGeneralSimilarity.substring(0,100)}..."`);

        // We could also add a filter here to EXCLUDE the targetContractId if desired,
        // but for simplicity, we'll allow it to potentially find the target contract again
        // if it's globally very similar. The separate display in the prompt will help.
        const similarDocs = await queryVectorStore(queryForGeneralSimilarity, maxSimilarDocs);

        if (similarDocs && similarDocs.length > 0) {
          generalSimilarContext = "\n\n--- Context from Other Potentially Similar Contracts/Clauses in Knowledge Base ---\n";
          generalSimilarContext += similarDocs
            .map(doc => `Source Document ID: ${doc.metadata?.contractId || 'N/A'}\nContent Snippet:\n${doc.pageContent}`)
            .join("\n\n---\n\n");
          console.log(`Found ${similarDocs.length} generally similar documents/chunks.`);
        } else {
          generalSimilarContext = "\n\n--- No other highly similar contracts or clauses found in the knowledge base for additional context. ---\n";
        }
      } catch (e) {
        console.error(`Error fetching general similar context:`, e);
        // Non-fatal, proceed without this general context
      }
    }

    const enhancedPrompt = `
You are a contract analysis expert. Please analyze the provided "Contract to Analyze" based on the user's query.

User's Query: "${userQuery}"

Contract to Analyze:
\`\`\`
${contractTextToAnalyze}
\`\`\`
${specificContractContext}
${generalSimilarContext}

Instructions:
1.  Your primary focus is the "Contract to Analyze" provided in full above.
2.  If "Relevant Sections from the Contract Being Analyzed" are provided, use these specific excerpts to inform your answer to the user's query about *this* contract. These sections are identified as most relevant to the query from the contract itself.
3.  If "Context from Other Potentially Similar Contracts/Clauses" is provided, you can use it for comparison, to highlight standard practices, or to identify common risks/terms, but only if relevant to the user's query and the "Contract to Analyze".
4.  Provide a detailed, professional, and actionable response.
5.  If the query is general (e.g., "analyze this contract comprehensively"), then consider identifying key terms, clauses, risks, ambiguities, party obligations, and recommendations.

Begin your analysis:
`;

    const result = await analyzeContractWithGemini(enhancedPrompt);

    if (!result.success || typeof result.analysis !== 'string') {
      throw new Error(result.error || "Failed to analyze contract with Gemini or received invalid response.");
    }

    return result.analysis;
  } catch (error) {
    console.error("Error analyzing contract with RAG:", error);
    if (error instanceof Error) {
      throw new Error(`RAG Analysis Failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred during RAG analysis.");
  }
}
