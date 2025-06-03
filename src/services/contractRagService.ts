import { analyzeContractWithGemini } from './geminiService';
import { Document } from "@langchain/core/documents";
// We'll likely need a text splitter, e.g., from LangChain
// import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { initializeVectorStore, queryVectorStore, addDocumentsToVectorStore as addDocsToVectorStore } from './ragService';

// In-memory tracking of initialization state
let isInitialized = false;
// Placeholder for a text splitter instance
// let textSplitter: RecursiveCharacterTextSplitter | null = null;

/**
 * Initialize the text splitter.
 * This could be configured with specific chunk size and overlap.
 */
// function getSplitter() {
//   if (!textSplitter) {
//     textSplitter = new RecursiveCharacterTextSplitter({
//       chunkSize: 1500, // Example: Adjust as needed
//       chunkOverlap: 200, // Example: Adjust as needed
//     });
//   }
//   return textSplitter;
// }

/**
 * Initialize the contract knowledge base with sample contracts.
 * These samples should also be chunked and stored as Documents.
 */
export async function initializeContractKnowledgeBase(sampleContractsAndMetadata: Array<{id: string, text: string, metadata: any}>): Promise<void> {
  try {
    if (!isInitialized) {
      // const splitter = getSplitter();
      const allDocs: Document[] = [];
      for (const item of sampleContractsAndMetadata) {
        // const chunks = await splitter.splitText(item.text);
        // chunks.forEach(chunk => {
        //   allDocs.push(new Document({
        //     pageContent: chunk,
        //     metadata: { ...item.metadata, contractId: item.id, isSample: true }
        //   }));
        // });
        // --- SIMPLIFIED FOR NOW until ragService details are known ---
        // Assuming initializeVectorStore can handle raw texts or needs to be adapted
        // For now, we'll stick to the original structure but acknowledge it needs chunking.
        allDocs.push(new Document({ pageContent: item.text, metadata: { ...item.metadata, contractId: item.id, isSample: true } }));
      }
      // This assumes initializeVectorStore can take Document[] or will be adapted.
      // If it still takes string[], we'd need to adjust.
      await initializeVectorStore(allDocs); // MODIFIED: Pass Document objects
    }
    isInitialized = true;
    console.log("Contract knowledge base initialized with sample contracts");
  } catch (error) {
    console.error("Error initializing contract knowledge base:", error);
    throw error;
  }
}

/**
 * Initialize the RAG system with sample contracts
 */
export async function initializeContractRAG(): Promise<void> {
  try {
    if (isInitialized) {
      console.log("RAG system already initialized");
      return;
    }

    // Sample contracts for initialization - now with ID and basic metadata
    const sampleContractsData = [
      {
        id: "MSA_Sample_001",
        text: "This is a sample Master Service Agreement between Company A and Company B for professional services. The agreement covers scope of work, payment terms, intellectual property rights, and confidentiality provisions.",
        metadata: { type: "Master Service Agreement", parties: ["Company A", "Company B"] }
      },
      {
        id: "NDA_Sample_001",
        text: "This Non-Disclosure Agreement (NDA) is entered into by and between Company X and Company Y to protect confidential information shared during business discussions. The agreement defines confidential information, permitted use, and the duration of confidentiality obligations.",
        metadata: { type: "Non-Disclosure Agreement", parties: ["Company X", "Company Y"] }
      },
      {
        id: "SLA_Sample_001",
        text: "Software License Agreement: This agreement grants the licensee the right to use the software under specified terms and conditions. It includes license scope, restrictions, warranty disclaimers, and limitation of liability clauses.",
        metadata: { type: "Software License Agreement" }
      }
    ];

    await initializeContractKnowledgeBase(sampleContractsData); // MODIFIED
  } catch (error) {
    console.error("Error initializing RAG system:", error);
    throw error;
  }
}

/**
 * Add a contract file to the RAG system.
 * This function will now chunk the contract and add each chunk as a Document.
 */
export async function addContractFileToRAG(contractId: string, file: File, metadata: any): Promise<void> {
  try {
    if (!isInitialized) {
      await initializeContractRAG();
    }

    let text: string;
    if (file.type === 'application/pdf') {
      const { extractTextFromPDF } = await import('./pdfService');
      text = await extractTextFromPDF(file);
    } else {
      text = await file.text();
    }

    // const splitter = getSplitter();
    // const chunks = await splitter.splitText(text);
    // const documents = chunks.map((chunk, index) => new Document({
    //   pageContent: chunk,
    //   metadata: {
    //     ...metadata, // Original metadata passed to the function
    //     contractId: contractId,
    //     fileName: file.name,
    //     fileType: file.type,
    //     chunkNumber: index + 1,
    //     totalChunks: chunks.length,
    //   }
    // }));

    // --- SIMPLIFIED FOR NOW until ragService details are known ---
    // Assuming addDocsToVectorStore can take Document[] or will be adapted.
    // For now, we pass a single Document, but ideally it should be chunked.
    const document = new Document({
        pageContent: text,
        metadata: {
            ...metadata,
            contractId: contractId,
            fileName: file.name,
            fileType: file.type,
        }
    });
    await addDocsToVectorStore([document]); // MODIFIED: Pass Document object(s)

    console.log(`Contract ${contractId} (file: ${file.name}) processed and added to RAG system.`);

  } catch (error) {
    console.error(`Error adding contract file ${file.name} to RAG:`, error);
    throw error;
  }
}

/**
 * Analyze a contract using RAG-enhanced Gemini.
 * This function can be enhanced to use chunks from the contractText itself for more focused analysis.
 */
export async function analyzeContractWithRAG(
  contractText: string,
  contractIdForAnalysis: string, // ID of the contract being analyzed, if known/stored
  userQuery: string = "Provide a comprehensive analysis" // More flexible query
): Promise<string> {
  try {
    if (!isInitialized) {
      await initializeContractRAG();
    }

    let analysisContext = "";
    let contractToAnalyze = contractText;

    // --- Strategy 1: Use chunks from the contractText itself (if it's long) ---
    // const splitter = getSplitter();
    // const contractChunks = await splitter.splitText(contractText);
    //
    // // For simplicity, let's assume we use all chunks for now.
    // // In a more advanced scenario, you might embed the userQuery and find relevant chunks from contractChunks.
    // const internalContext = contractChunks.join("\n\n");
    // analysisContext += `\n\n--- Sections from the contract being analyzed (${contractIdForAnalysis || 'current contract'}) ---\n${internalContext}`;
    // contractToAnalyze = `The contract identified as ${contractIdForAnalysis || 'current contract'} (full text provided separately if needed, focus on the sections above).`;


    // --- Strategy 2: Get relevant context from the broader vector store (similar contracts) ---
    // The query to the vector store could be the userQuery, or the first few lines/summary of contractText
    const queryForSimilar = contractText.substring(0, 500); // Example: use beginning of contract to find similar ones
    const relevantDocsFromStore = await queryVectorStore(queryForSimilar, 3); // Find 3 similar documents/chunks

    if (relevantDocsFromStore && relevantDocsFromStore.length > 0) {
      const similarContractsContext = relevantDocsFromStore
        .map(doc => `Document ID: ${doc.metadata?.contractId || 'N/A'}\nContent:\n${doc.pageContent}`)
        .join("\n\n---\n\n");
      analysisContext += `\n\n--- Context from potentially similar contracts in the knowledge base ---\n${similarContractsContext}`;
    }


    const enhancedPrompt = `
You are a contract analysis expert.
User's request: "${userQuery}"

Contract to analyze:
${contractText}
${analysisContext}

Based on the user's request, the contract provided, and any relevant context from similar contracts or specific sections, please provide your analysis.
If the request is for a "comprehensive analysis", please include:
1. Key terms and clauses identified.
2. Potential risks or issues.
3. Recommendations for improvement or points to consider.
4. If context from similar contracts is available, briefly note any significant similarities or differences in approach to common clauses.

Your analysis should be detailed, professional, and actionable. Structure your response clearly.
`;

    const result = await analyzeContractWithGemini(enhancedPrompt);

    if (!result.success) {
      throw new Error(result.error || "Failed to analyze contract with Gemini");
    }

    return result.analysis;
  } catch (error) {
    console.error("Error analyzing contract with RAG:", error);
    throw error;
  }
}
