import React, { useState } from 'react';
import { Header } from './components/Header';
import ImageFusion from './components/ImageFusion';
import ImageToVideo from './components/ImageToVideo';
import { SparklesIcon, VideoCameraIcon } from './components/Icons';
import { AuthProvider } from './contexts/AuthContext';

type Mode = 'fusion' | 'video';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('fusion');

  const getButtonClasses = (buttonMode: Mode) => {
    const baseClasses = "flex-1 sm:flex-none sm:px-8 py-3 text-sm sm:text-base font-bold rounded-full transition-all duration-300 transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    if (mode === buttonMode) {
      return `${baseClasses} bg-purple-600 text-white shadow-lg scale-105 focus:ring-purple-500`;
    }
    return `${baseClasses} bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-500`;
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-7xl">
          <Header />

          <div className="my-8 flex justify-center items-center p-1 bg-gray-800/80 rounded-full border border-gray-700 max-w-md mx-auto">
            <button onClick={() => setMode('fusion')} className={getButtonClasses('fusion')}>
              <SparklesIcon className="w-5 h-5 mr-2 inline-block"/>
              Image Fusion
            </button>
            <button onClick={() => setMode('video')} className={getButtonClasses('video')}>
              <VideoCameraIcon className="w-5 h-5 mr-2 inline-block"/>
              Image to Video
            </button>
          </div>

          <main>
            {mode === 'fusion' ? <ImageFusion /> : <ImageToVideo />}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;
