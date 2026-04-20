/**
 * Computes the Cosine Similarity between two vectors of numbers.
 * The value ranges from -1 to 1, where 1 means identical, 0 means orthogonal, and -1 means opposite.
 * 
 * @param vecA Array of numbers representing the first vector
 * @param vecB Array of numbers representing the second vector
 * @returns A number representing the cosine similarity score
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length to calculate cosine similarity");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) {
        return 0; // Prevent division by zero
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface DocumentWithVector {
    id: string;
    vector: number[];
    [key: string]: any; // Allow arbitrary extra payload (e.g. Job Description, Title)
}

/**
 * Searches a list of vectorized documents and sorts them by highest similarity to the query vector.
 *
 * @param queryVector The embedding vector of the search query (e.g., user resume)
 * @param documents The list of documents containing their pre-computed embeddings
 * @param topK The number of top results to return (default returns all, sorted)
 * @returns Sorted array of documents with their similarity score attached
 */
export function searchSimilarDocuments<T extends DocumentWithVector>(
    queryVector: number[], 
    documents: T[], 
    topK?: number
): (T & { similarity: number })[] {
    
    // 1. Calculate similarity for all docs
    const scoredDocs = documents.map(doc => {
        const similarity = cosineSimilarity(queryVector, doc.vector);
        return { ...doc, similarity };
    });

    // 2. Sort descending (highest similarity first)
    scoredDocs.sort((a, b) => b.similarity - a.similarity);

    // 3. Optional slice
    if (topK && topK > 0) {
        return scoredDocs.slice(0, topK);
    }

    return scoredDocs;
}
