
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
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [numVideos, setNumVideos] = useState(1);

  const handleSubmit = useCallback(async () => {
    if (!sourceImage || !prompt) {
      setError('Please provide a source image and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedResults([]);
    setLoadingProgress('');

    try {
      const results = await generateVideoFromImage(sourceImage, prompt, setLoadingProgress, numVideos);
      setGeneratedResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  }, [sourceImage, prompt, numVideos]);
  
  const isButtonDisabled = isLoading || !sourceImage || !prompt;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Input Section */}
      <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 mb-6">
          1. Provide Your Inputs
        </h2>
        <div className="space-y-6">
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
              <label htmlFor="num-videos" className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Videos ({numVideos})
              </label>
              <input
                  id="num-videos"
                  type="range"
                  min="1"
                  max="10"
                  value={numVideos}
                  onChange={(e) => setNumVideos(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb-video"
              />
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
                Generate {numVideos > 1 ? `${numVideos} Videos` : 'Video'}
                <VideoCameraIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col justify-start items-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400 mb-6 self-start w-full">
          2. Your Animated Video
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
              <p className="text-lg">Your generated video will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
.slider-thumb-video::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #2563eb; /* blue-600 */
  cursor: pointer;
  border-radius: 50%;
}

.slider-thumb-video::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #2563eb; /* blue-600 */
  cursor: pointer;
  border-radius: 50%;
  border: none;
}
`;
document.head.appendChild(style);


export default ImageToVideo;