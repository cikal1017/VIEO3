import React, { useState, useCallback } from 'react';
import { ImageUploader } from './ImageUploader';
import { ResultDisplay } from './ResultDisplay';
import { Spinner } from './Spinner';
import { generateImageFromImages } from '../services/geminiService';
import type { GeneratedResult, ImageFile } from '../types';
import { SparklesIcon } from './Icons';

const ImageFusion: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState<boolean>(false);
  const [numberOfImages, setNumberOfImages] = useState<number>(5);
  const [loadingProgress, setLoadingProgress] = useState<string>('');
  const [useSeparateReference, setUseSeparateReference] = useState<boolean>(false);

  const handleSeparateReferenceToggle = (checked: boolean) => {
    setUseSeparateReference(checked);
    if (!checked) {
      setReferenceImage(null);
    }
  };

  const handleSubmit = useCallback(async () => {
    const finalReferenceImage = useSeparateReference ? referenceImage : sourceImage;

    if (!sourceImage || !finalReferenceImage || !prompt) {
      setError('Please provide a source image and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedResults([]);
    setLoadingProgress('');
    
    const count = isBulkMode ? numberOfImages : 1;

    try {
      const results: GeneratedResult[] = [];
      for (let i = 0; i < count; i++) {
        if (count > 1) {
          setLoadingProgress(`Generating image ${i + 1} of ${count}...`);
        }
        const result = await generateImageFromImages(sourceImage, finalReferenceImage, prompt);
        results.push(result);
        setGeneratedResults([...results]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setLoadingProgress('');
    }
  }, [sourceImage, referenceImage, prompt, isBulkMode, numberOfImages, useSeparateReference]);

  const generationCount = isBulkMode ? numberOfImages : 1;
  const isButtonDisabled = isLoading || !sourceImage || (useSeparateReference && !referenceImage) || !prompt;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in">
      {/* Input Section */}
      <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6">
          1. Provide Your Inputs
        </h2>
        <div className="space-y-6">

          <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
                <label htmlFor="separate-style-mode" className="font-medium text-gray-300 cursor-pointer select-none">
                    Use separate style image
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                        type="checkbox"
                        name="separate-style-mode"
                        id="separate-style-mode"
                        checked={useSeparateReference}
                        onChange={(e) => handleSeparateReferenceToggle(e.target.checked)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                    />
                    <label htmlFor="separate-style-mode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                </div>
            </div>
             <p className="text-xs text-gray-500 pl-1 -mt-2">
                {useSeparateReference 
                    ? "Provide a second image for style transfer." 
                    : "The source image will be used for both content and style reference."}
            </p>
            
            <hr className="border-gray-700" />
            
            <div className="flex items-center justify-between">
                <label htmlFor="bulk-mode" className="font-medium text-gray-300 cursor-pointer select-none">
                    Bulk Generate
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                    <input
                        type="checkbox"
                        name="bulk-mode"
                        id="bulk-mode"
                        checked={isBulkMode}
                        onChange={(e) => setIsBulkMode(e.target.checked)}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                    />
                    <label htmlFor="bulk-mode" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
                </div>
            </div>
            {isBulkMode && (
                <div className="pt-2 animate-fade-in-fast">
                    <label htmlFor="num-images" className="block text-sm font-medium text-gray-300 mb-2">
                        Number of Images: <span className="font-bold text-purple-400">{numberOfImages}</span>
                    </label>
                    <input
                        id="num-images"
                        type="range"
                        min="5"
                        max="20"
                        value={numberOfImages}
                        onChange={(e) => setNumberOfImages(parseInt(e.target.value, 10))}
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
            <div className={!useSeparateReference ? "md:col-span-2" : ""}>
                <ImageUploader
                id="source-image"
                label="Source Image"
                onImageSelect={setSourceImage}
                />
            </div>
            {useSeparateReference && (
                <div className="animate-fade-in-fast">
                    <ImageUploader
                    id="reference-image"
                    label="Reference / Style Image"
                    onImageSelect={setReferenceImage}
                    />
                </div>
            )}
          </div>
          
          <div>
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
              Prompt
            </label>
            <textarea
              id="prompt"
              rows={3}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-gray-500"
              placeholder="e.g., 'Change the car to red, in the style of the reference image'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Image fusion prompt"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Spinner />
                Generating...
              </>
            ) : (
              <>
                Generate {generationCount > 1 ? `${generationCount} Images` : 'Image'}
                <SparklesIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col justify-start items-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 mb-6 self-start w-full">
          2. Your Fused Image{generationCount > 1 || generatedResults.length > 1 ? 's' : ''}
        </h2>
        <div className="w-full flex-grow flex flex-col justify-center items-center">
            {isLoading && (
              <div className="text-center p-4">
                <Spinner size="lg"/>
                <p className="mt-4 text-gray-400">{loadingProgress || 'Fusing images... this may take a moment.'}</p>
              </div>
            )}
            {error ? (
                <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                    <p className="font-bold">An Error Occurred</p>
                    <p>{error}</p>
                </div>
            ) : generatedResults.length > 0 ? (
                <ResultDisplay results={generatedResults} />
            ) : !isLoading && (
                <div className="text-center text-gray-500">
                    <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg">Your generated image(s) will appear here.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Add fade-in and toggle switch animation
const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInFast {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
.animate-fade-in-fast {
  animation: fadeInFast 0.3s ease-out forwards;
}
.toggle-checkbox:checked {
    right: 0;
    transform: translateX(100%);
    border-color: #a855f7; /* purple-500 */
}
.toggle-checkbox:checked + .toggle-label {
    background-color: #a855f7; /* purple-500 */
}
`;
document.head.appendChild(style);


export default ImageFusion;
