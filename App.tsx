
import React, { useState, useEffect, useCallback } from 'react';
import { generateVideoFromImage } from './services/geminiService';
import type { ImageData } from './types';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import VideoPlayer from './components/VideoPlayer';

const loadingMessages = [
  "Warming up the digital director's chair...",
  "Cueing the digital actors...",
  "Rendering the first few frames...",
  "This is taking longer than usual, but good things come to those who wait.",
  "Applying special effects and sparkles...",
  "Almost there, adding the final touches...",
  "Your video is being finalized, this may take a few minutes."
];

const App: React.FC = () => {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState<string>(loadingMessages[0]);

  useEffect(() => {
    // FIX: Replaced NodeJS.Timeout with ReturnType<typeof setInterval> for browser compatibility.
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      let messageIndex = 0;
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setCurrentLoadingMessage(loadingMessages[messageIndex]);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleImageUpload = useCallback((data: ImageData) => {
    setImageData(data);
    setVideoUrl(null);
    setError(null);
  }, []);

  const handleGenerateVideo = async () => {
    if (!imageData || !prompt.trim()) {
      setError('Please upload an image and provide a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setVideoUrl(null);
    setCurrentLoadingMessage(loadingMessages[0]);

    try {
      const generatedUrl = await generateVideoFromImage(imageData.base64, imageData.mimeType, prompt);
      setVideoUrl(generatedUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during video generation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            Image to Video Generator
          </h1>
          <p className="mt-2 text-lg text-gray-400">Bring your images to life with AI-powered video generation.</p>
        </header>

        <main className="bg-gray-800 shadow-2xl rounded-lg p-6 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-bold text-gray-200">1. Upload Image</h2>
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl font-bold text-gray-200">2. Describe the Motion</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'A gentle breeze rustles the leaves of the tree.'"
                className="w-full h-36 p-3 bg-gray-700 border-2 border-gray-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 resize-none text-gray-100 placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              onClick={handleGenerateVideo}
              disabled={isLoading || !imageData || !prompt.trim()}
              className="w-full py-3 px-6 text-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
            >
              {isLoading ? 'Generating...' : 'Generate Video'}
            </button>
          </div>

          <div className="mt-8 min-h-[300px] flex items-center justify-center bg-gray-900/50 rounded-lg p-4">
            {isLoading && <Loader message={currentLoadingMessage} />}
            {error && <div className="text-red-400 text-center">{error}</div>}
            {videoUrl && !isLoading && !error && <VideoPlayer src={videoUrl} />}
            {!videoUrl && !isLoading && !error && (
              <div className="text-gray-500 text-center">
                <p>Your generated video will appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
