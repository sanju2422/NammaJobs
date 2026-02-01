
import { GoogleGenAI, Type } from "@google/genai";
import { Job, AISearchResponse } from "./types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async searchJobs(query: string, lang: string): Promise<AISearchResponse> {
    const prompt = `Search for real-time job openings in Karnataka matching: "${query}". 
    Format the output as JSON with the following structure:
    {
      "jobs": [{ 
        "id": "uuid", 
        "title": "string", 
        "company": "string", 
        "location": "string", 
        "type": "Full-time/Contract/Part-time", 
        "salary": "string", 
        "description": "short summary", 
        "postedAt": "string",
        "sourceUrl": "absolute URL to apply for this job"
      }],
      "summary": "a short summary of the job market for this query in ${lang === 'kn' ? 'Kannada' : 'English'}"
    }
    Translate all content in the JSON fields (except sourceUrl) to ${lang === 'kn' ? 'Kannada' : 'English'}.
    Crucial: Provide real URLs for the sourceUrl field from your search results.
    Use Google Search grounding to find active postings.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jobs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    company: { type: Type.STRING },
                    location: { type: Type.STRING },
                    type: { type: Type.STRING },
                    salary: { type: Type.STRING },
                    description: { type: Type.STRING },
                    postedAt: { type: Type.STRING },
                    sourceUrl: { type: Type.STRING }
                  },
                  required: ["id", "title", "company", "location", "type", "salary", "description", "postedAt", "sourceUrl"]
                }
              },
              summary: { type: Type.STRING }
            },
            required: ["jobs", "summary"]
          }
        }
      });

      const text = response.text || '{}';
      const data = JSON.parse(text);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || 'Source',
          uri: c.web.uri
        }));

      return {
        jobs: data.jobs || [],
        summary: data.summary || '',
        sources: sources
      };
    } catch (error) {
      console.error("Gemini Search Error:", error);
      throw error;
    }
  }
}
