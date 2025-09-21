
import React, { useState, useCallback, useRef } from 'react';
import { ImageUploader } from './ImageUploader';
import { ResultDisplay } from './ResultDisplay';
import { Spinner } from './Spinner';
import { generateImageFromImages } from '../services/geminiService';
import type { GeneratedResult, ImageFile } from '../types';
import { SparklesIcon } from './Icons';
import { PromptSuggestions } from './PromptSuggestions';

const ImageFusion: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageFile | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useSeparateReference, setUseSeparateReference] = useState<boolean>(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [showPromptIdeas, setShowPromptIdeas] = useState(true);
  const [numImages, setNumImages] = useState(1);
  const [resolution, setResolution] = useState('1024');
  const [generationProgress, setGenerationProgress] = useState('');
  const [previewResult, setPreviewResult] = useState<GeneratedResult | null>(null);
  const promptTextareaRef = useRef<HTMLTextAreaElement>(null);


  const handleSeparateReferenceToggle = (checked: boolean) => {
    setUseSeparateReference(checked);
    if (!checked) {
      setReferenceImage(null);
    }
  };

  const handlePromptSuggestion = (suggestion: string) => {
    setPrompt(suggestion);
    promptTextareaRef.current?.focus();
  };
  
  const handlePreview = useCallback(async () => {
    const finalReferenceImage = useSeparateReference ? referenceImage : sourceImage;
    if (!sourceImage || !finalReferenceImage || !prompt) {
        setError('Please provide a source image and a prompt for the preview.');
        return;
    }

    setIsPreviewLoading(true);
    setError(null);
    setGeneratedResults([]);
    setPreviewResult(null);

    const previewPrompt = `${prompt}\n\nImportant instructions: Generate a low-resolution, fast preview. The image must contain only one person/subject.`;

    try {
        const result = await generateImageFromImages(sourceImage, finalReferenceImage, previewPrompt);
        setPreviewResult(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
        setIsPreviewLoading(false);
    }
  }, [sourceImage, referenceImage, prompt, useSeparateReference]);

  const handleSubmit = useCallback(async () => {
    const finalReferenceImage = useSeparateReference ? referenceImage : sourceImage;

    if (!sourceImage || !finalReferenceImage || !prompt) {
      setError('Please provide a source image, reference image (if applicable), and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedResults([]);
    setPreviewResult(null); // Clear preview when generating final images
    
    const finalPrompt = `${prompt}\n\nImportant instructions: The generated image must contain only one person/subject. Do not show duplicate people or subjects. Produce an image with an aspect ratio of ${aspectRatio} and a high resolution of approximately ${resolution}px on its longest side.`;

    const results: GeneratedResult[] = [];
    try {
      for (let i = 0; i < numImages; i++) {
        if (numImages > 1) {
            setGenerationProgress(`Generating image ${i + 1} of ${numImages}...`);
        }
        const result = await generateImageFromImages(sourceImage, finalReferenceImage, finalPrompt);
        results.push(result);
        setGeneratedResults([...results]); // Update results as they come in
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setGenerationProgress('');
    }
  }, [sourceImage, referenceImage, prompt, useSeparateReference, aspectRatio, numImages, resolution]);

  const isButtonDisabled = isLoading || isPreviewLoading || !sourceImage || (useSeparateReference && !referenceImage) || !prompt;

  const getAspectRatioButtonClasses = (ratio: string) => {
    const baseClasses = "py-2 px-3 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
    if (aspectRatio === ratio) {
        return `${baseClasses} bg-purple-600 text-white focus:ring-purple-500`;
    }
    return `${baseClasses} bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500`;
  };

  const renderOutputContent = () => {
    if (isPreviewLoading) {
        return (
            <div className="text-center p-4">
                <Spinner size="lg"/>
                <p className="mt-4 text-gray-400">Generating preview...</p>
            </div>
        );
    }
    if (isLoading) {
         return (
            <div className="text-center p-4">
                <Spinner size="lg"/>
                <p className="mt-4 text-gray-400">{generationProgress || 'Fusing images... this may take a moment.'}</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-lg">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
            </div>
        );
    }
    if (generatedResults.length > 0) {
        return <ResultDisplay results={generatedResults} />;
    }
    if (previewResult) {
        return (
            <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
                <p className="text-sm font-bold text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full">PREVIEW</p>
                <div className="w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden shadow-lg">
                    <img
                    src={previewResult.imageUrl}
                    alt="Generated preview"
                    className="w-full h-full object-contain"
                    />
                </div>
                {previewResult.text && <p className="text-xs text-center text-gray-400">{previewResult.text}</p>}
                <p className="mt-2 text-gray-300">Like the preview? Adjust settings and generate the full quality version!</p>
            </div>
        );
    }
    // Default placeholder
    return (
        <div className="text-center text-gray-500">
            <SparklesIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg">Your generated image will appear here.</p>
            <p className="text-sm">Try generating a preview first!</p>
        </div>
    );
  };


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
              <label htmlFor="show-prompt-ideas" className="font-medium text-gray-300 cursor-pointer select-none">
                Show Prompt Ideas
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="show-prompt-ideas"
                  id="show-prompt-ideas"
                  checked={showPromptIdeas}
                  onChange={(e) => setShowPromptIdeas(e.target.checked)}
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-all duration-300"
                />
                <label htmlFor="show-prompt-ideas" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer"></label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                Aspect Ratio
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {['1:1', '16:9', '9:16', '4:3', '3:4'].map((ratio) => (
                    <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={getAspectRatioButtonClasses(ratio)}
                    aria-label={`Set aspect ratio to ${ratio}`}
                    >
                    {ratio}
                    </button>
                ))}
                </div>
            </div>
            <div>
              <label htmlFor="resolution" className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution
              </label>
              <select
                  id="resolution"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200"
              >
                  <option value="1024">1K (~1024px)</option>
                  <option value="2048">2K (~2048px)</option>
                  <option value="4096">4K (~4096px)</option>
                  <option value="8192">8K (~8192px)</option>
              </select>
            </div>
            <div className="sm:col-span-2">
                <label htmlFor="num-images" className="block text-sm font-medium text-gray-300 mb-2">
                    Number of Images ({numImages})
                </label>
                <input
                    id="num-images"
                    type="range"
                    min="1"
                    max="10"
                    value={numImages}
                    onChange={(e) => setNumImages(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
            </div>
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
             {showPromptIdeas && <PromptSuggestions onSelect={handlePromptSuggestion} />}
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2 sr-only">
              Prompt
            </label>
            <textarea
              id="prompt"
              ref={promptTextareaRef}
              rows={3}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition duration-200 placeholder-gray-500"
              placeholder="e.g., 'Change the car to red, in the style of the reference image'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              aria-label="Image fusion prompt"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePreview}
              disabled={isButtonDisabled}
              className="w-1/3 flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-gray-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isPreviewLoading ? <Spinner size="sm" /> : 'Preview'}
            </button>
            <button
              onClick={handleSubmit}
              disabled={isButtonDisabled}
              className="w-2/3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Spinner />
                  {generationProgress || 'Generating...'}
                </>
              ) : (
                <>
                  Generate {numImages > 1 ? `${numImages} Images` : 'Image'}
                  <SparklesIcon className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Output Section */}
      <div className="lg:w-1/2 bg-gray-800/50 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col justify-start items-center min-h-[400px]">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-500 mb-6 self-start w-full">
          2. Your Fused Image
        </h2>
        <div className="w-full flex-grow flex flex-col justify-center items-center">
            {renderOutputContent()}
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
.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #a855f7; /* purple-500 */
  cursor: pointer;
  border-radius: 50%;
}

.slider-thumb::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #a855f7; /* purple-500 */
  cursor: pointer;
  border-radius: 50%;
  border: none;
}
`;
document.head.appendChild(style);


export default ImageFusion;
