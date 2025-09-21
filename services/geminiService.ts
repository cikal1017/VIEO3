
import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageFile, GeneratedResult, VideoResult } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (file: ImageFile) => {
  return {
    inlineData: {
      data: file.base64,
      mimeType: file.mimeType,
    },
  };
};

export const generateImageFromImages = async (
  sourceImage: ImageFile,
  referenceImage: ImageFile,
  prompt: string
): Promise<GeneratedResult> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const sourceImagePart = fileToGenerativePart(sourceImage);
    const referenceImagePart = fileToGenerativePart(referenceImage);
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [sourceImagePart, referenceImagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });
    
    let imageUrl = '';
    let text = '';

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
          text = part.text;
        }
      }
    }

    if (!imageUrl) {
        throw new Error("API did not return an image. It may have refused the request.");
    }

    return { imageUrl, text };
  } catch (error) {
    console.error("Error generating image:", error);
    // Add more specific error messages if possible
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The request was blocked due to safety policies. Please adjust your prompt or images.");
    }
    throw new Error("Failed to generate image. Please try again.");
  }
};


export const generateVideoFromImage = async (
  sourceImage: ImageFile,
  prompt: string,
  onProgress: (message: string) => void
): Promise<VideoResult> => {
    try {
        onProgress("Initiating video generation...");
        let operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            image: {
                imageBytes: sourceImage.base64,
                mimeType: sourceImage.mimeType,
            },
            config: {
                numberOfVideos: 1
            }
        });

        onProgress("Video generation in progress... this can take a few minutes.");
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        onProgress("Finalizing video...");
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        
        if (!downloadLink) {
            throw new Error("Video generation completed but no download link was provided.");
        }

        onProgress("Downloading video...");
        const response = await fetch(`${downloadLink}&key=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`Failed to download video: ${response.statusText}`);
        }
        
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        return { videoUrl };

    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes('SAFETY')) {
            throw new Error("The request was blocked due to safety policies. Please adjust your prompt or image.");
        }
        throw new Error("Failed to generate video. Please try again.");
    }
};
