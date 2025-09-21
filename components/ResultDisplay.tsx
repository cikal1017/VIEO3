import React, { useState } from 'react';
import type { GeneratedResult } from '../types';
import { DownloadIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { uploadToDrive } from '../services/googleDriveService';
import { Spinner } from './Spinner';


const handleDownload = (result: GeneratedResult, index?: number) => {
    const link = document.createElement('a');
    link.href = result.imageUrl;
    
    const fileExtension = result.imageUrl.substring(
        result.imageUrl.indexOf('/') + 1,
        result.imageUrl.indexOf(';')
    ) || 'png';
    
    const fileName = index !== undefined 
        ? `gemini-fused-image-${index + 1}.${fileExtension}`
        : `gemini-fused-image.${fileExtension}`;
        
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const DriveButton: React.FC<{ result: GeneratedResult; index?: number, large?: boolean }> = ({ result, index, large = false }) => {
    const { isLoggedIn } = useAuth();
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleSaveToDrive = async () => {
        setUploadState('uploading');
        try {
            const fileExtension = result.imageUrl.substring(result.imageUrl.indexOf('/') + 1, result.imageUrl.indexOf(';')) || 'png';
            const fileName = index !== undefined
                ? `gemini-fused-image-${index + 1}.${fileExtension}`
                : `gemini-fused-image.${fileExtension}`;
            await uploadToDrive(result.imageUrl, fileName);
            setUploadState('success');
            setTimeout(() => setUploadState('idle'), 3000); 
        } catch (error) {
            console.error(error);
            setUploadState('error');
            setTimeout(() => setUploadState('idle'), 3000);
        }
    };

    if (!isLoggedIn) return null;
    
    const buttonClasses = large 
        ? "flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-gray-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
        : "w-full flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300 transform hover:scale-105 text-sm disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none";


    return (
        <button
            onClick={handleSaveToDrive}
            disabled={uploadState === 'uploading' || uploadState === 'success'}
            className={buttonClasses}
            aria-label={`Save generated image ${index !== undefined ? index + 1 : ''} to Google Drive`}
        >
            <svg className={large ? "w-5 h-5" : "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path></svg>
            {uploadState === 'idle' && 'Save to Drive'}
            {uploadState === 'uploading' && <><Spinner size="sm" /> Uploading...</>}
            {uploadState === 'success' && 'Saved!'}
            {uploadState === 'error' && 'Error!'}
        </button>
    );
}


const ResultCard: React.FC<{ result: GeneratedResult; index: number }> = ({ result, index }) => {
    return (
        <div className="w-full flex flex-col items-center gap-2 animate-fade-in">
            <div className="w-full aspect-square bg-black rounded-lg overflow-hidden shadow-lg shadow-purple-900/20">
                <img
                    src={result.imageUrl}
                    alt={`Generated result ${index + 1}`}
                    className="w-full h-full object-contain"
                />
            </div>
            {result.text && (
                <p className="mt-1 text-xs text-center text-gray-400 bg-gray-900/50 p-2 rounded-md w-full">
                    {result.text}
                </p>
            )}
            <div className="w-full mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                 <button
                    onClick={() => handleDownload(result, index)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 text-sm"
                    aria-label={`Download generated image ${index + 1}`}
                >
                    <DownloadIcon className="w-4 h-4" />
                    Download
                </button>
                <DriveButton result={result} index={index} />
            </div>
        </div>
    );
}

export const ResultDisplay: React.FC<{ results: GeneratedResult[] }> = ({ results }) => {
  const { isLoggedIn } = useAuth();
  if (results.length === 1) {
    const result = results[0];
    return (
        <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden shadow-2xl shadow-purple-900/20">
            <img
              src={result.imageUrl}
              alt="Generated result"
              className="w-full h-full object-contain"
            />
          </div>
          {result.text && (
            <p className="mt-2 text-center text-gray-300 bg-gray-900/50 p-3 rounded-md w-full max-w-md">
              {result.text}
            </p>
          )}
          <div className={`w-full max-w-md mt-2 grid ${isLoggedIn ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <button
              onClick={() => handleDownload(result)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
              aria-label="Download generated image"
            >
              <DownloadIcon className="w-5 h-5" />
              Download
            </button>
             <DriveButton result={result} large={true} />
          </div>
        </div>
    );
  }
  
  return (
    <div className="w-full h-full max-h-[60vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <ResultCard key={index} result={result} index={index}/>
        ))}
      </div>
    </div>
  );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
`;
document.head.appendChild(style);
