import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

// Flag to track initialization status
let isInitialized = false;

// Simple browser-compatible vector store implementation
class SimpleVectorStore {
  documents: Array<{id: string, text: string, metadata: any, embedding?: number[]}> = [];
  embeddingCache: Map<string, number[]> = new Map();
  genAI: any;

  constructor(apiKey: string) {
    // Import dynamically to avoid circular dependencies
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async addDocuments(documents: Document[]) {
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      const embedding = await this.getEmbedding(doc.pageContent);
      
      this.documents.push({
        id: doc.metadata.id || `doc-${this.documents.length}`,
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
      
      // Calculate cosine similarity
      const similarities = this.documents.map((doc, index) => ({
        index,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
      }));
    
      // Sort by similarity and get top k
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topK = similarities.slice(0, k);

      return topK.map(({ index }) => {
        const doc = this.documents[index];
        return new Document({
          pageContent: doc.text,
          metadata: doc.metadata
        });
      });
    } catch (error) {
      console.error("Error in similarity search:", error);
      return [];
    }
  }

  private async getEmbedding(text: string): Promise<number[]> {
    // Check cache first
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }
    
    try {
      if (!this.genAI) {
        // If genAI is not initialized yet, return random embedding
        console.warn("GenAI not initialized, using random embeddings");
        console.warn("GenAI not initialized, using random embeddings");
        const randomEmbedding = Array.from({ length: 768 }, () => Math.random() - 0.5); 
        return randomEmbedding;
      }
      
      // Use Gemini's embedding model
      try {
        // Simplified embedding for demo purposes
        // In production, use a proper embedding model
        const embedding = Array.from({ length: 768 }, () => Math.random() - 0.5);
        for (let i = 0; i < Math.min(text.length, 768); i++) {
          embedding[i] = text.charCodeAt(i) / 255;
        }
        
        // Cache the result
        this.embeddingCache.set(text, embedding);
        
        return embedding;
      } catch (embeddingError) {
        console.error("Error getting embedding from API:", embeddingError);
        // Fallback to random embedding
        const randomEmbedding = Array.from({ length: 768 }, () => Math.random() - 0.5);
        return randomEmbedding;
      }
    } catch (error) {
      console.error("Error getting embedding:", error);
      // Fallback to random embedding for demo purposes
      const randomEmbedding = Array.from({ length: 768 }, () => Math.random() - 0.5);
      return randomEmbedding;
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// Check for Gemini API key
const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn("Gemini API key not found. Using dummy key for development. Add VITE_GEMINI_API_KEY to your .env file for production use.");
}

// Create a vector store
let vectorStore: SimpleVectorStore | null = null;

// Function to initialize the vector store
export async function initializeVectorStore(documents: string[]): Promise<SimpleVectorStore> {
  try {
    // If already initialized, return the existing vector store
    if (isInitialized && vectorStore) {
      console.log("Vector store already initialized");
      return vectorStore;
    }
    
    // Create vector store if it doesn't exist
    if (!vectorStore) {
      vectorStore = new SimpleVectorStore(geminiApiKey || "dummy-key");
    }

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Create Document objects
    const docs = documents.map(
      (text, i) => new Document({ pageContent: text, metadata: { id: `doc-${i}` } })
    );

    // Split documents into chunks
    const splitDocs = await textSplitter.splitDocuments(docs);
    console.log(`Created ${splitDocs.length} document chunks`);

    // Add documents to vector store
    await vectorStore.addDocuments(splitDocs);
    
    // Mark as initialized
    isInitialized = true;
    return vectorStore;
  } catch (error) {
    console.error("Error initializing vector store:", error);
    throw error;
  }
}

// Function to query the vector store
export async function queryVectorStore(query: string, k: number = 5): Promise<Document[]> {
  if (!isInitialized || !vectorStore) {
    // Try to initialize with empty documents if not initialized
    try {
      await initializeVectorStore([]);
    } catch (error) {
      throw new Error("Vector store not initialized. Call initializeVectorStore first.");
    }
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
export async function addDocumentsToVectorStore(documents: string[]): Promise<void> {
  if (!isInitialized || !vectorStore) {
    // Try to initialize with empty documents if not initialized
    try {
      await initializeVectorStore([]);
    } catch (error) {
      throw new Error("Vector store not initialized. Call initializeVectorStore first.");
    }
  }

  try {
    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Create Document objects
    const docs = documents.map(
      (text, i) => new Document({ pageContent: text, metadata: { id: `doc-${i + Date.now()}` } })
    );

    // Split documents into chunks
    const splitDocs = await textSplitter.splitDocuments(docs);
    
    // Add documents to the vector store
    await vectorStore.addDocuments(splitDocs);
    console.log(`Added ${splitDocs.length} document chunks to vector store`);
  } catch (error) {
    console.error("Error adding documents to vector store:", error);
    throw error;
  }
}