
import { GoogleGenAI } from "@google/genai";

// FIX: Aligned with guidelines to use process.env.API_KEY directly and assume it's set.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateVideoFromImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
  try {
    console.log("Starting video generation process...");
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      image: {
        imageBytes: base64Image,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
      }
    });

    console.log("Operation started:", operation.name);

    while (!operation.done) {
      console.log("Polling for video generation status...");
      await wait(10000); 
      operation = await ai.operations.getVideosOperation({ operation: operation });
      console.log("Current operation status:", operation.done ? "Done" : "In Progress");
    }
    
    console.log("Video generation complete.");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
      throw new Error("Failed to get video download link from API response.");
    }
    
    console.log("Fetching video from download link:", downloadLink);
    
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    // FIX: Aligned with guidelines to use process.env.API_KEY directly.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if (!response.ok) {
        throw new Error(`Failed to fetch video file: ${response.statusText}`);
    }

    const videoBlob = await response.blob();
    const videoUrl = URL.createObjectURL(videoBlob);
    
    console.log("Video URL created:", videoUrl);
    return videoUrl;

  } catch (error) {
    console.error("Error in generateVideoFromImage:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the video.");
  }
};
