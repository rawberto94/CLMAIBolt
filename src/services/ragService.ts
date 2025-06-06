import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// Flag to track initialization status
let isInitialized = false;

// Simple browser-compatible vector store implementation
class SimpleVectorStore {
  documents: Array<{ id: string, text: string, metadata: any, embedding?: number[] }> = [];
  embeddingCache: Map<string, number[]> = new Map();
  genAI: GoogleGenerativeAI;
  embeddingModel: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.embeddingModel = this.genAI.getGenerativeModel({
      model: "text-embedding-004",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });
  }

  async addDocuments(documentsToAdd: Document[]) {
    for (let i = 0; i < documentsToAdd.length; i++) {
      const doc = documentsToAdd[i];
      const embedding = await this.getEmbedding(doc.pageContent);

      this.documents.push({
        id: doc.metadata.id || doc.metadata.contractId || `doc-${Date.now()}-${this.documents.length}`,
        text: doc.pageContent,
        metadata: doc.metadata,
        embedding
      });
    }
  }

  async similaritySearch(
    query: string,
    k: number = 5,
    filter?: { [key: string]: any }
  ): Promise<Document[]> {
    if (this.documents.length === 0) {
      return [];
    }

    try {
      const queryEmbedding = await this.getEmbedding(query);

      let candidateDocuments = this.documents;

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
        .map((doc) => ({
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
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }

    try {
      if (!this.embeddingModel) {
        console.warn("Embedding model not initialized, using random embeddings as fallback.");
        return Array.from({ length: 768 }, () => Math.random() - 0.5);
      }

      const result = await this.embeddingModel.embedContent(text);
      const embedding = result.embedding.values;

      if (!embedding) {
        throw new Error("Failed to generate embedding, API returned no values.");
      }

      this.embeddingCache.set(text, embedding);
      return embedding;

    } catch (error) {
      console.error("Error getting embedding:", error);
      console.warn("Falling back to random embedding due to error.");
      return Array.from({ length: 768 }, () => Math.random() - 0.5);
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
      return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!geminiApiKey) {
  console.warn("Gemini API key (VITE_GEMINI_API_KEY) not found. Embeddings will not be generated correctly. Add VITE_GEMINI_API_KEY to your .env file.");
}

let vectorStore: SimpleVectorStore | null = null;

export async function initializeVectorStore(initialDocuments: Document[]): Promise<SimpleVectorStore> {
  try {
    if (isInitialized && vectorStore) {
      console.log("Vector store already initialized. Adding new initial documents if any.");
    } else {
      vectorStore = new SimpleVectorStore(geminiApiKey || "dummy-key-for-init-fallback");
      isInitialized = true;
    }

    if (initialDocuments.length > 0) {
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

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

export async function queryVectorStore(
  query: string,
  k: number = 5,
  filter?: { [key: string]: any }
): Promise<Document[]> {
  if (!vectorStore) {
    throw new Error("Vector store not initialized. Call initializeVectorStore first.");
  }

  try {
    const results = await vectorStore.similaritySearch(query, k, filter);
    return results;
  } catch (error) {
    console.error("Error querying vector store:", error);
    throw error;
  }
}

export async function addDocumentsToVectorStore(documentsToAdd: Document[]): Promise<void> {
  if (!vectorStore) {
    throw new Error("Vector store not initialized. Call initializeVectorStore first before adding documents.");
  }

  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const splitDocs = await textSplitter.splitDocuments(documentsToAdd);

    await vectorStore.addDocuments(splitDocs);
    console.log(`Added ${splitDocs.length} document chunks from ${documentsToAdd.length} documents to vector store.`);
  } catch (error) {
    console.error("Error adding documents to vector store:", error);
    throw error;
  }
}
