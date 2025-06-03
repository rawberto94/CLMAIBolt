import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai"; // Added HarmBlockThreshold & HarmCategory
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Flag to track initialization status
let isInitialized = false;

// Simple browser-compatible vector store implementation
class SimpleVectorStore {
  documents: Array<{ id: string, text: string, metadata: any, embedding?: number[] }> = [];
  embeddingCache: Map<string, number[]> = new Map();
  genAI: GoogleGenerativeAI; // Changed type to GoogleGenerativeAI
  embeddingModel: any; // To store the initialized embedding model

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Initialize the embedding model instance here
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: "text-embedding-004", // Or "embedding-001" - text-embedding-004 is newer
      // It's good practice to set safety settings, though less critical for embeddings
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });
  }

  async addDocuments(documentsToAdd: Document[]) { // Parameter name changed for clarity
    for (let i = 0; i < documentsToAdd.length; i++) {
      const doc = documentsToAdd[i];
      const embedding = await this.getEmbedding(doc.pageContent);

      this.documents.push({
        id: doc.metadata.id || doc.metadata.contractId || `doc-${Date.now()}-${this.documents.length}`, // Use more specific ID if available
        text: doc.pageContent,
        metadata: doc.metadata,
        embedding
      });
    }
  }

  async similaritySearch(query: string, k: number = 5): Promise<Document[]> {
    if (this.documents.length === 0) {
      return [];
    }

    try {
      const queryEmbedding = await this.getEmbedding(query);

      const similarities = this.documents
        .filter(doc => doc.embedding) // Ensure doc has an embedding
        .map((doc, index) => ({
          originalDoc: doc, // Keep reference to original stored item
          similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
        }));

      similarities.sort((a, b) => b.similarity - a.similarity);
      const topK = similarities.slice(0, k);

      return topK.map(({ originalDoc }) => {
        return new Document({
          pageContent: originalDoc.text,
          metadata: originalDoc.metadata
        });
      });
    } catch (error) {
      console.error("Error in similarity search:", error);
      return [];
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    try {
      if (!this.embeddingModel) {
        console.warn("Embedding model not initialized, using random embeddings as fallback.");
        // This fallback should ideally not be hit if constructor initializes model correctly
        return Array.from({ length: 768 }, () => Math.random() - 0.5); // Match typical embedding dim
      }

      // *** ACTUAL EMBEDDING CALL ***
      const result = await this.embeddingModel.embedContent(text);
      const embedding = result.embedding.values;

      if (!embedding) {
        throw new Error("Failed to generate embedding, API returned no values.");
      }

      this.embeddingCache.set(text, embedding);
      return embedding;

    } catch (error) {
      console.error("Error getting embedding:", error);
      // Fallback to random embedding in case of API error during development
      // For production, you might want more sophisticated error handling or retries.
      console.warn("Falling back to random embedding due to error.");
      return Array.from({ length: 768 }, () => Math.random() - 0.5); // Ensure consistent dimension
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b || a.length !== b.length) {
        console.warn("Cannot calculate cosine similarity for invalid vectors:", a, b);
        return 0;
    }
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) {
        return 0; // Avoid division by zero
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn("Gemini API key (VITE_GEMINI_API_KEY) not found. Embeddings will not be generated correctly. Add VITE_GEMINI_API_KEY to your .env file.");
}

let vectorStore: SimpleVectorStore | null = null;

// Function to initialize the vector store
// *** MODIFIED to accept Document[] ***
export async function initializeVectorStore(initialDocuments: Document[]): Promise<SimpleVectorStore> {
  try {
    if (isInitialized && vectorStore) {
      console.log("Vector store already initialized. Adding new initial documents if any.");
      // Decide if re-initialization should clear or append. Current logic implies it doesn't re-add if already initialized.
      // If you want to add more docs to an existing store, call addDocumentsToVectorStore
    } else {
        vectorStore = new SimpleVectorStore(geminiApiKey || "dummy-key-for-init-fallback"); // Provide a fallback key if needed
        isInitialized = true; // Mark initialized only when a new store is created
    }


    if (initialDocuments.length > 0) {
        const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
        });

        // The documents are already LangChain Document objects.
        // Metadata from these Document objects will be preserved by splitDocuments.
        const splitDocs = await textSplitter.splitDocuments(initialDocuments);
        console.log(`Created ${splitDocs.length} document chunks from ${initialDocuments.length} initial documents.`);

        await vectorStore.addDocuments(splitDocs);
    } else {
        console.log("Initializing vector store without any initial documents.");
    }

    return vectorStore;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    throw error;
  }
}

// Function to query the vector store
export async function queryVectorStore(query: string, k: number = 5): Promise<Document[]> {
  if (!vectorStore) { // Simplified check: if no vectorStore, it's not usable.
    throw new Error("Vector store not initialized. Call initializeVectorStore first.");
  }

  try {
    const results = await vectorStore.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error("Error querying vector store:", error);
    throw error;
  }
}

// Function to add documents to the vector store
// *** MODIFIED to accept Document[] ***
export async function addDocumentsToVectorStore(documentsToAdd: Document[]): Promise<void> {
  if (!vectorStore) {
    // Optionally, initialize it if it's not already.
    // console.warn("Vector store not initialized during addDocumentsToVectorStore. Initializing it now.");
    // await initializeVectorStore([]); // Initialize empty if not present
    // This behavior might be debated; often an explicit init is preferred.
    // For now, let's throw an error to enforce initialization first.
    throw new Error("Vector store not initialized. Call initializeVectorStore first before adding documents.");
  }

  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // The documents are already LangChain Document objects.
    // Metadata from these Document objects will be preserved by splitDocuments.
    const splitDocs = await textSplitter.splitDocuments(documentsToAdd);

    await vectorStore.addDocuments(splitDocs);
    console.log(`Added ${splitDocs.length} document chunks from ${documentsToAdd.length} documents to vector store.`);
  } catch (error) {
    console.error("Error adding documents to vector store:", error);
    throw error;
  }
}
// In src/services/ragService.ts

// ... (other imports and code remain the same)

class SimpleVectorStore {
  documents: Array<{ id: string, text: string, metadata: any, embedding?: number[] }> = [];
  embeddingCache: Map<string, number[]> = new Map();
  genAI: GoogleGenerativeAI;
  embeddingModel: any;

  constructor(apiKey: string) {
    // ... (constructor remains the same)
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: "text-embedding-004",
      // ... safetySettings
    });
  }

  async addDocuments(documentsToAdd: Document[]) {
    // ... (addDocuments remains the same)
  }

  // MODIFIED: Added metadata filter parameter
  async similaritySearch(
    query: string,
    k: number = 5,
    filter?: { [key: string]: any } // Optional metadata filter
  ): Promise<Document[]> {
    if (this.documents.length === 0) {
      return [];
    }

    try {
      const queryEmbedding = await this.getEmbedding(query);

      let candidateDocuments = this.documents;

      // Apply metadata filter if provided
      if (filter && Object.keys(filter).length > 0) {
        candidateDocuments = this.documents.filter(doc => {
          if (!doc.metadata) return false;
          return Object.entries(filter).every(([key, value]) => {
            return doc.metadata[key] === value;
          });
        });
      }

      if (candidateDocuments.length === 0) {
        console.log("No documents matched the metadata filter.");
        return [];
      }

      const similarities = candidateDocuments
        .filter(doc => doc.embedding)
        .map((doc) => ({ // Removed 'index' as it's relative to candidateDocuments now
          originalDoc: doc,
          similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
        }));

      similarities.sort((a, b) => b.similarity - a.similarity);
      const topK = similarities.slice(0, k);

      return topK.map(({ originalDoc }) => {
        return new Document({
          pageContent: originalDoc.text,
          metadata: originalDoc.metadata
        });
      });
    } catch (error) {
      console.error("Error in similarity search:", error);
      return [];
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    // ... (getEmbedding remains the same)
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    // ... (cosineSimilarity remains the same)
  }
}

// ... (rest of the file, including initializeVectorStore, queryVectorStore, addDocumentsToVectorStore)

// MODIFIED: Update queryVectorStore to pass the filter
export async function queryVectorStore(
  query: string,
  k: number = 5,
  filter?: { [key: string]: any } // Added filter parameter
): Promise<Document[]> {
  if (!vectorStore) {
    throw new Error("Vector store not initialized. Call initializeVectorStore first.");
  }

  try {
    // Pass the filter to the vector store's similaritySearch
    const results = await vectorStore.similaritySearch(query, k, filter);
    return results;
  } catch (error) {
    console.error("Error querying vector store:", error);
    throw error;
  }
}

// No changes needed for initializeVectorStore or addDocumentsToVectorStore for this feature
// as they deal with adding documents, not querying them with filters.
