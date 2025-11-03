
import React, { useState, useEffect } from 'react';
import { LogoIcon } from './icons';

const LOADING_MESSAGES = [
  "Analyzing product features...",
  "Generating creative concepts...",
  "Crafting high-resolution product photos...",
  "Building realistic lifestyle mockups...",
  "Designing eye-catching banners...",
  "Rendering promotional video (this can take a minute)...",
  "Optimizing assets for web and social media...",
  "Applying final touches...",
];

interface LoaderProps {
  originalImage?: string;
}

const Loader: React.FC<LoaderProps> = ({ originalImage }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % LOADING_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center text-center p-8 bg-gray-800/50 border border-gray-700 rounded-xl shadow-2xl">
      <div className="relative mb-6">
        {originalImage && (
          <img src={originalImage} alt="Product being analyzed" className="w-48 h-48 rounded-lg object-cover shadow-lg" />
        )}
        <div className="absolute -inset-2 rounded-lg border-2 border-dashed border-indigo-500/50 animate-spin-slow"></div>
        <div className="absolute inset-0 bg-gray-900/60 rounded-lg flex items-center justify-center">
            <LogoIcon className="w-16 h-16 text-indigo-400 animate-pulse"/>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">AI Generation in Progress</h2>
      <p className="text-gray-400 mb-6">Your marketing assets are being created. Please wait...</p>
      
      <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
        <div className="bg-indigo-500 h-2.5 rounded-full animate-loader-progress"></div>
      </div>

      <div className="h-6 mt-2">
          <p className="text-indigo-300 transition-opacity duration-500">
            {LOADING_MESSAGES[currentMessageIndex]}
          </p>
      </div>

      <style>{`
        @keyframes loader-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loader-progress {
          animation: loader-progress 20s linear infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Loader;
