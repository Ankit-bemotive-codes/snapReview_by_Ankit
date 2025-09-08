import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateInitialImage = async (prompt: string): Promise<{ base64: string, mimeType: string }> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const image = response.generatedImages[0];
      return { base64: image.image.imageBytes, mimeType: image.image.mimeType };
    } else {
      throw new Error("Image generation failed, no images were returned.");
    }
  } catch (error) {
    console.error("Error generating initial image:", error);
    throw new Error("Failed to generate image. Please check your prompt or API key.");
  }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<{ base64: string, mimeType: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          };
        }
      }
    }
    
    throw new Error("Image editing failed. The model did not return an image.");
  } catch (error) {
    console.error("Error editing image:", error);
    throw new Error("Failed to edit image. The revision might be too complex or there was an API issue.");
  }
};
