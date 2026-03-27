import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface CoverStyle {
  bgGradient: string;
  textColor: string;
  fontFamily: string;
  emoji: string;
  vibe: string;
}

export async function analyzeVoiceMessage(transcript: string): Promise<{
  summary: string;
  style: CoverStyle;
}> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this voice message transcript and suggest a visual "cover" style.
    Transcript: "${transcript}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING, description: "A short, catchy summary of the message (max 50 chars)" },
          style: {
            type: Type.OBJECT,
            properties: {
              bgGradient: { type: Type.STRING, description: "Tailwind gradient class (e.g., 'from-purple-500 to-pink-500')" },
              textColor: { type: Type.STRING, description: "Tailwind text color class (e.g., 'text-white')" },
              fontFamily: { type: Type.STRING, description: "A vibe-matching font category (serif, sans, mono)" },
              emoji: { type: Type.STRING, description: "A single relevant emoji" },
              vibe: { type: Type.STRING, description: "A one-word description of the vibe" }
            },
            required: ["bgGradient", "textColor", "fontFamily", "emoji", "vibe"]
          }
        },
        required: ["summary", "style"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      summary: transcript.slice(0, 50),
      style: {
        bgGradient: "from-blue-500 to-indigo-600",
        textColor: "text-white",
        fontFamily: "sans",
        emoji: "🎙️",
        vibe: "Classic"
      }
    };
  }
}

export async function transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          data: base64Audio,
          mimeType: mimeType
        }
      },
      { text: "Transcribe this audio message accurately. Return only the transcript text." }
    ]
  });

  return response.text || "";
}
