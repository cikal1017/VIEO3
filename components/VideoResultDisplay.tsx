import React, { useState } from 'react';
import type { VideoResult } from '../types';
import { DownloadIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import { uploadToDrive } from '../services/googleDriveService';
import { Spinner } from './Spinner';

interface VideoResultDisplayProps {
  results: VideoResult[];
}

const handleDownload = (videoUrl: string, index?: number) => {
    const link = document.createElement('a');
    link.href = videoUrl;
    
    const fileName = index !== undefined 
        ? `gemini-generated-video-${index + 1}.mp4`
        : `gemini-generated-video.mp4`;
        
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const DriveButton: React.FC<{ videoUrl: string; index?: number, large?: boolean }> = ({ videoUrl, index, large = false }) => {
    const { isLoggedIn } = useAuth();
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    const handleSaveToDrive = async () => {
        setUploadState('uploading');
        try {
            const fileName = index !== undefined
                ? `gemini-generated-video-${index + 1}.mp4`
                : `gemini-generated-video.mp4`;
            await uploadToDrive(videoUrl, fileName);
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
            aria-label={`Save generated video ${index !== undefined ? index + 1 : ''} to Google Drive`}
        >
            <svg className={large ? "w-5 h-5" : "w-4 h-4"} viewBox="0 0 24 24" fill="currentColor"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"></path></svg>
            {uploadState === 'idle' && 'Save to Drive'}
            {uploadState === 'uploading' && <><Spinner size="sm" /> Uploading...</>}
            {uploadState === 'success' && 'Saved!'}
            {uploadState === 'error' && 'Error!'}
        </button>
    );
};

const VideoCard: React.FC<{ result: VideoResult; index: number }> = ({ result, index }) => {
    return (
        <div className="w-full flex flex-col items-center gap-2 animate-fade-in">
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg shadow-blue-900/20">
                <video
                    src={result.videoUrl}
                    controls
                    loop
                    className="w-full h-full object-contain"
                    aria-label={`Generated video ${index + 1}`}
                />
            </div>
            <div className="w-full mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                    onClick={() => handleDownload(result.videoUrl, index)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-lime-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:from-green-600 hover:to-lime-600 transition-all duration-300 transform hover:scale-105 text-sm"
                    aria-label={`Download generated video ${index + 1}`}
                >
                    <DownloadIcon className="w-4 h-4" />
                    Download
                </button>
                <DriveButton videoUrl={result.videoUrl} index={index} />
            </div>
        </div>
    );
}

const VideoResultDisplay: React.FC<VideoResultDisplayProps> = ({ results }) => {
  const { isLoggedIn } = useAuth();
  if (results.length === 1) {
    const result = results[0];
    return (
        <div className="w-full flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden shadow-2xl shadow-blue-900/20">
            <video
              src={result.videoUrl}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
              aria-label="Generated video"
            />
          </div>
          <div className={`w-full max-w-md mt-2 grid ${isLoggedIn ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
            <button
              onClick={() => handleDownload(result.videoUrl)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-lime-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-green-600 hover:to-lime-600 transition-all duration-300 transform hover:scale-105"
              aria-label="Download generated video"
            >
              <DownloadIcon className="w-5 h-5" />
              Download
            </button>
            <DriveButton videoUrl={result.videoUrl} large={true} />
          </div>
        </div>
    );
  }
  
  return (
    <div className="w-full h-full max-h-[60vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 gap-6">
        {results.map((result, index) => (
          <VideoCard key={index} result={result} index={index}/>
        ))}
      </div>
    </div>
  );
};

export default VideoResultDisplay;
