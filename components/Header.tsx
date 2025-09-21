import React from 'react';
import { SparklesIcon } from './Icons';
import { GoogleAuth } from './GoogleAuth';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="relative flex flex-col lg:flex-row justify-center items-center gap-4">
        <div className="inline-flex items-center gap-4">
          <SparklesIcon className="w-12 h-12 text-purple-400" />
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Gemini Image Fusion
          </h1>
        </div>
        <div className="lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 mt-4 lg:mt-0">
          <GoogleAuth />
        </div>
      </div>
      <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
        Combine images and prompts to generate something new, or bring your images to life as videos.
      </p>
    </header>
  );
};
