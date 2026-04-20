import { OpenAI } from "openai";

/**
 * Generates an embedding vector for a given text string using OpenAI's small embedding model.
 * 
 * @param text The string to embed (e.g. Job Description or Resume Summary)
 * @returns An array of numbers representing the vector embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
        throw new Error("Cannot generate embedding for empty string.");
    }

    const client = new OpenAI();
    
    try {
        const response = await client.embeddings.create({
            model: "text-embedding-3-small", // Cost-effective and highly precise
            input: text.replace(/\n/g, " "), // Best practice to remove newlines for embeddings
        });

        // The API returns the embedding in the data array
        return response.data[0].embedding;
    } catch (error) {
        console.error("Failed to generate embedding", error);
        throw error;
    }
}
