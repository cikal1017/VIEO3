import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { Spinner } from './Spinner';
import { generateVideoFromImage } from '../services/geminiService';
import type { VideoResult, ImageFile } from '../types';
import { VideoCameraIcon, FilmIcon } from './Icons';
import VideoResultDisplay from './VideoResultDisplay';

const ImageToVideo: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedResults, setGeneratedResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [numberOfVideos, setNumberOfVideos] = useState<number>(5);
  const [loadingProgress, setLoadingProgress] = useState<string>('');

  const handleSubmit = useCallback(async () => {
    if (!sourceImage || !prompt) {
      setError('Please provide a source image and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedResults([]);
    setLoadingProgress('');

    const count = isBulkMode ? numberOfVideos : 1;

    try {
      const results: VideoResult[] = [];
      for (let i = 0; i < count; i++) {
        const progressCallback = (message: string) => {
           if (count > 1) {
             setLoadingProgress(`Generating video ${i + 1} of ${count}: ${message}`);
           } else {
             setLoadingProgress(message);
           }
        };

        const result = await generateVideoFromImage(sourceImage, prompt, progressCallback);
        results.push(result);
        setGeneratedResults([...results]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  }, [sourceImage, prompt, isBulkMode, numberOfVideos]);
  
  const generationCount = isBulkMode ? numberOfVideos : 1;
  const isButtonDisabled = isLoading || !sourceImage || !prompt;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Input Section */}
      <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 mb-6">
          1. Provide Your Inputs
        </h2>
        <div className="space-y-6">
          <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
                <label htmlFor="video-bulk-mode" className="font-medium text-gray-300 cursor-pointer select-none">
                    Bulk Generate
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                        type="checkbox"
                        name="video-bulk-mode"
                        id="video-bulk-mode"
                        checked={isBulkMode}
                        onChange={(e) => setIsBulkMode(e.target.checked)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                    />
                    <label htmlFor="video-bulk-mode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                </div>
            </div>
            {isBulkMode && (
                <div className="pt-2 animate-fade-in-fast">
                    <label htmlFor="num-videos" className="block text-sm font-medium text-gray-300 mb-2">
                        Number of Videos: <span className="font-bold text-blue-400">{numberOfVideos}</span>
                    </label>
                    <input
                        id="num-videos"
                        type="range"
                        min="5"
                        max="20"
                        value={numberOfVideos}
                        onChange={(e) => setNumberOfVideos(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>5</span>
                        <span>20</span>
                    </div>
                </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             <div className="md:col-span-2">
                <ImageUploader
                    id="video-source-image"
                    label="Source Image"
                    onImageSelect={setSourceImage}
                />
             </div>
          </div>
          <div>
            <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Animation Prompt
            </label>
            <textarea
              id="video-prompt"
              rows={3}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 placeholder-gray-500"
              placeholder="e.g., 'Make the clouds move and the water ripple'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Image to video prompt"
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                Generate {generationCount > 1 ? `${generationCount} Videos` : 'Video'}
                <VideoCameraIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col justify-start items-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400 mb-6 self-start w-full">
          2. Your Animated Video{generationCount > 1 || generatedResults.length > 1 ? 's' : ''}
        </h2>
        <div className="w-full flex-grow flex justify-center items-center">
          {isLoading ? (
            <div className="text-center">
              <Spinner size="lg"/>
              <p className="mt-4 text-gray-400 max-w-xs">{loadingProgress || 'Preparing to generate...'}</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
              <p className="font-bold">An Error Occurred</p>
              <p>{error}</p>
            </div>
          ) : generatedResults.length > 0 ? (
            <VideoResultDisplay results={generatedResults} />
          ) : (
            <div className="text-center text-gray-500">
                <FilmIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-lg">Your generated video(s) will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageToVideo;