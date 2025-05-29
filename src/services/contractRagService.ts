import { analyzeContractWithGemini } from './geminiService';
import { Document } from "@langchain/core/documents";
import { initializeVectorStore, queryVectorStore, addDocumentsToVectorStore as addDocsToVectorStore } from './ragService';

// In-memory tracking of initialization state
let isInitialized = false;

/**
 * Initialize the contract knowledge base with sample contracts
 */
export async function initializeContractKnowledgeBase(sampleContracts: string[]): Promise<void> {
  try {
    // Initialize the vector store with sample contracts
    if (!isInitialized) {
      await initializeVectorStore(sampleContracts);
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
    
    // Sample contracts for initialization
    const sampleContracts = [
      "This is a sample Master Service Agreement between Company A and Company B for professional services. The agreement covers scope of work, payment terms, intellectual property rights, and confidentiality provisions.",
      "This Non-Disclosure Agreement (NDA) is entered into by and between Company X and Company Y to protect confidential information shared during business discussions. The agreement defines confidential information, permitted use, and the duration of confidentiality obligations.",
      "Software License Agreement: This agreement grants the licensee the right to use the software under specified terms and conditions. It includes license scope, restrictions, warranty disclaimers, and limitation of liability clauses."
    ];
    
    await initializeContractKnowledgeBase(sampleContracts);
  } catch (error) {
    console.error("Error initializing RAG system:", error);
    throw error;
  }
}

/**
 * Add a contract file to the RAG system
 */
export async function addContractFileToRAG(contractId: string, file: File, metadata: any): Promise<void> {
  try {
    if (!isInitialized) {
      await initializeContractRAG();
    }
    
    // Process file based on type
    let text: string;
    
    if (file.type === 'application/pdf') {
      // Import dynamically to avoid circular dependencies
      const { extractTextFromPDF } = await import('./pdfService');
      text = await extractTextFromPDF(file);
    } else {
      // For text files, read directly
      text = await file.text();
    }
    
    // Add to vector store
    await addDocsToVectorStore([text]);
  } catch (error) {
    console.error("Error adding contract file to RAG:", error);
    throw error;
  }
}

/**
 * Analyze a contract using RAG-enhanced Gemini
 */
export async function analyzeContractWithRAG(contractText: string): Promise<string> {
  try {
    if (!isInitialized) {
      await initializeContractRAG();
    }
    
    // Get relevant context from the vector store
    const relevantDocs = await queryVectorStore(contractText, 3);
    
    const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
    
    // Enhance the contract text with context
    const enhancedPrompt = `
I'm analyzing a contract and have some similar contracts for context.

Contract to analyze:
${contractText}

Context from similar contracts:
${context}

Please provide a comprehensive analysis of the contract, including:
1. Key terms and clauses identified
2. Potential risks or issues
3. Recommendations for improvement
4. Comparison with standard practices based on the context

Your analysis should be detailed, professional, and actionable.
`;
    
    // Call Gemini API with the enhanced prompt
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