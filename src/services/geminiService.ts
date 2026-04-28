import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ParseResult {
  matches: Record<string, number>;
  unmatched: Array<{ name: string; qty: number }>;
}

export async function parseStockInput(
  text: string, 
  products: Product[], 
  columnName: string
): Promise<ParseResult> {
  const productList = products.map(p => `${p.id}: ${p.name} (${p.category})`).join('\n');
  
  const systemInstruction = `
    You are an ADVANACED AI inventory agent for "Broomies Bakery".
    Your task is to parse a text list or natural language notes representing "${columnName}" values.
    
    Products available in the Menu:
    ${productList}
    
    KNOWLEDGE & INSTRUCTIONS:
    - Language: Users may speak in English, Hindi, or Hinglish (e.g., "5 chocolate cake bhej do", "pani ki dus botal").
    - Smart Matching: You must use deep semantics. 
      * "Pani" or "Water bottle" should match a "Water" product if it exists. 
      * "Choco cake" matches "Chocolate Cake".
      * "Pineapple pastry" matches "Classic Pineapple Pastry".
    - Confidence: If you are >70% confident that the user refers to a specific product in the menu, MATCH IT to that Product ID.
    - Translation: Automatically translate common Hindi food words to the Menu item equivalents.
    - Extraction: Extract numbers (quantities) and product names from messy text.
    
    Return a JSON object with:
    1. "matches": { [productId]: quantity }
    2. "unmatched": Array of { "name": originalText, "qty": extractedQuantity } for items you absolutely can't map to the menu.
    
    Example input: "bhai 5 classic pineapple bheja hai aur 2 pani ki botal"
    Example output (if IDs match):
    {
      "matches": { "p-123": 5, "w-456": 2 },
      "unmatched": []
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: text,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: {
              type: Type.OBJECT,
              additionalProperties: { type: Type.NUMBER }
            },
            unmatched: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  qty: { type: Type.NUMBER }
                }
              }
            }
          },
          required: ["matches", "unmatched"]
        }
      },
    });

    const result = JSON.parse(response.text || '{"matches":{}, "unmatched":[]}');
    return result;
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return { matches: {}, unmatched: [] };
  }
}
