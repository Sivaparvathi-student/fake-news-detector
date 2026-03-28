import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface Claim {
  text: string;
  verdict: string;
  reasoning: string;
}

export interface VerificationResult {
  truthScore: number;
  confidenceScore: number; // 0 to 100 for explainability
  verdict: string;
  analysis: string;
  biasLevel: string;
  detectedLanguage: string;
  // Futuristic Features
  aiProbability: number;
  sentiment: {
    outrage: number;
    fear: number;
    neutral: number;
  };
  claims: Claim[];
  sources: { title: string; uri: string }[];
}

export async function verifyNews(
  content: string, 
  targetLanguage: string = "English", 
  image?: { data: string; mimeType: string }
): Promise<VerificationResult> {
  const model = "gemini-3-flash-preview";
  
  // Check if content is a URL
  const isUrl = content.trim().match(/^https?:\/\/[^\s$.?#].[^\s]*$/i);
  
  let promptParts: any[] = [];
  
  if (image) {
    promptParts.push({
      inlineData: {
        data: image.data,
        mimeType: image.mimeType
      }
    });
    promptParts.push({
      text: `DEEP FORENSIC ANALYSIS REQUEST:
      1. Analyze this image for digital manipulation, AI artifacts, or inconsistencies in lighting/shadows.
      2. Cross-reference the visual content with the provided text: "${content}".
      3. Use Google Search to find the original source of this image or similar events.
      4. Determine if this is a deepfake, miscontextualized media, or authentic evidence.
      5. Provide the entire analysis in ${targetLanguage}.`
    });
  } else if (isUrl) {
    promptParts.push({
      text: `GLOBAL LINK ANALYSIS REQUEST:
      1. Fetch and analyze the content at this URL: ${content}.
      2. Verify all major claims against authoritative sources using Google Search.
      3. Detect bias, logical fallacies, and emotional manipulation.
      4. Provide a detailed truth index and confidence score.
      5. Provide the entire analysis in ${targetLanguage}.`
    });
  } else {
    promptParts.push({
      text: `NEURAL TEXT ANALYSIS REQUEST:
      1. Analyze the following news content: "${content}".
      2. Extract core claims and verify them using real-time grounding.
      3. Assess the linguistic style for AI-generation signatures.
      4. Evaluate the emotional tone and potential for misinformation spread.
      5. Provide the entire analysis in ${targetLanguage}.`
    });
  }
  
  const systemInstruction = `
    You are VERITAS OS, a highly advanced, transparent, and explainable AI fact-checking engine. 
    Your mission is to protect the global information ecosystem through rigorous forensic analysis.
    
    CORE PROTOCOLS:
    - SCIENTIFIC PRECISION: Every claim must be dissected and verified.
    - EXPLAINABILITY: Provide clear reasoning for every score. Be transparent about your data sources.
    - MULTIMODAL FORENSICS: If an image is provided, perform deep visual analysis.
    - REAL-TIME GROUNDING: Always use Google Search to verify against the latest data.
    
    OUTPUT REQUIREMENTS (JSON):
    1. truthScore (0-100): Overall accuracy index.
    2. confidenceScore (0-100): Your certainty in this prediction.
    3. verdict: Use one of these exact terms: "True", "Fake", or "Half True" (translated to ${targetLanguage}).
    4. analysis: In-depth explanation (Markdown, translated to ${targetLanguage}).
    5. biasLevel: "Low", "Medium", or "High".
    6. detectedLanguage: The language of the input.
    7. aiProbability (0-100): Likelihood of synthetic generation.
    8. sentiment: { outrage, fear, neutral } (0-100).
    9. claims: Array of { text, verdict, reasoning }.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: promptParts },
      config: {
        systemInstruction,
        tools: isUrl ? [{ googleSearch: {} }, { urlContext: {} }] : [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            truthScore: { type: "NUMBER" },
            confidenceScore: { type: "NUMBER" },
            verdict: { type: "STRING" },
            analysis: { type: "STRING" },
            biasLevel: { type: "STRING" },
            detectedLanguage: { type: "STRING" },
            aiProbability: { type: "NUMBER" },
            sentiment: {
              type: "OBJECT",
              properties: {
                outrage: { type: "NUMBER" },
                fear: { type: "NUMBER" },
                neutral: { type: "NUMBER" }
              },
              required: ["outrage", "fear", "neutral"]
            },
            claims: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  text: { type: "STRING" },
                  verdict: { type: "STRING" },
                  reasoning: { type: "STRING" }
                },
                required: ["text", "verdict", "reasoning"]
              }
            }
          },
          required: ["truthScore", "confidenceScore", "verdict", "analysis", "biasLevel", "detectedLanguage", "aiProbability", "sentiment", "claims"]
        }
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    // Extract grounding sources
    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ title: chunk.web.title, uri: chunk.web.uri });
        }
      });
    }

    return {
      ...result,
      sources,
    };
  } catch (error) {
    console.error("Verification error:", error);
    throw error;
  }
}
