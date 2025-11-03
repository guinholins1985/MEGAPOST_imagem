
import React, { useState, useCallback } from 'react';
import { GeneratedAsset } from './types';
import { generateMarketingAssets } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ImageGrid from './components/ImageGrid';
import Loader from './components/Loader';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (image: { data: string; mimeType: string }) => {
    setIsLoading(true);
    setError(null);
    setGeneratedAssets([]);
    setOriginalImage(image);

    try {
      if (!process.env.API_KEY) {
        throw new Error("API key is not configured. Please set the API_KEY environment variable.");
      }
      const assets = await generateMarketingAssets(image.data, image.mimeType);
      setGeneratedAssets(assets);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during generation.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b border-gray-700">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-10 w-10 text-indigo-400" />
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Marketing Asset Generator</h1>
          </div>
          <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Powered by Gemini
          </a>
        </div>
      </header>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
              Transform Your Product Image into a Marketing Powerhouse
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
              Upload a single product image to automatically generate a complete set of professional, ready-to-use marketing assets in seconds.
            </p>
          </div>

          {!isLoading && generatedAssets.length === 0 && (
            <ImageUploader onGenerate={handleGenerate} disabled={isLoading} />
          )}

          {error && (
            <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-900/50 border border-red-700 rounded-lg text-center">
              <h3 className="text-lg font-semibold text-red-300">Generation Failed</h3>
              <p className="mt-2 text-red-400">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  setOriginalImage(null);
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-semibold transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {isLoading && (
            <Loader originalImage={originalImage?.data ? `data:${originalImage.mimeType};base64,${originalImage.data}` : undefined} />
          )}
          
          {!isLoading && generatedAssets.length > 0 && (
             <div className="flex flex-col items-center">
                <ImageGrid assets={generatedAssets} />
                <button
                    onClick={() => {
                      setGeneratedAssets([]);
                      setOriginalImage(null);
                    }}
                    className="mt-10 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
                >
                    Generate New Assets
                </button>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-6 mt-12 border-t border-gray-700">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} AI Asset Generator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
