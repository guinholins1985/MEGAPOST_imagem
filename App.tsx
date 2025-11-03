import React, { useState, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import Loader from './components/Loader';
import ImageGrid from './components/ImageGrid';
import { GeneratedAsset, AssetCategory, GenerationResult } from './types';
import { generateMarketingAssets } from './services/geminiService';
import { SparklesIcon } from './components/icons';

type AppState = 'idle' | 'loading' | 'results';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('idle');
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [failedAssets, setFailedAssets] = useState<AssetCategory[]>([]);
  const [originalImage, setOriginalImage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (image: { data: string; mimeType: string }) => {
    setAppState('loading');
    setError(null);
    setGeneratedAssets([]);
    setFailedAssets([]);
    setOriginalImage(`data:${image.mimeType};base64,${image.data}`);

    try {
      const result: GenerationResult = await generateMarketingAssets(image);
      setGeneratedAssets(result.successfulAssets);
      setFailedAssets(result.failedAssetTitles);
      setAppState('results');
    } catch (err) {
      console.error("Generation failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Falha ao gerar os materiais. Por favor, tente novamente. Detalhes: ${errorMessage}`);
      setAppState('idle');
    }
  }, []);
  
  const handleReset = () => {
    setAppState('idle');
    setGeneratedAssets([]);
    setFailedAssets([]);
    setOriginalImage(undefined);
    setError(null);
  };


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-b border-gray-200/80 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-20">
                <div className="flex items-center space-x-3">
                     <SparklesIcon className="w-10 h-10 text-indigo-500" />
                     <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        MEGAPOST
                     </h1>
                </div>
            </div>
        </div>
      </header>
      
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8">
        {appState === 'idle' && (
          <div className="text-center mb-12 animate-fadeIn">
             <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
                Transforme Uma Foto em uma Campanha Completa
             </h2>
             <p className="max-w-2xl mx-auto text-lg text-slate-600">
                Faça o upload da imagem do seu produto e nossa IA irá gerar dezenas de materiais de marketing profissionais e prontos para usar em segundos.
             </p>
          </div>
        )}

        {appState === 'idle' && <ImageUploader onGenerate={handleGenerate} disabled={false} />}
        {appState === 'loading' && <Loader originalImage={originalImage} />}
        
        {appState === 'results' && (
           <div className="animate-fadeIn">
              <div className="max-w-7xl mx-auto text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-4">
                    Seus Materiais Estão Prontos!
                  </h2>
                  <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-6">
                    Use os materiais abaixo para suas campanhas. Geramos {generatedAssets.length} materiais com sucesso para você.
                  </p>
                  <button 
                    onClick={handleReset}
                    className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:bg-indigo-700 hover:scale-105"
                  >
                    Gerar Novos Materiais
                  </button>
              </div>

            {failedAssets.length > 0 && (
                <div className="max-w-3xl mx-auto my-8 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
                    <p className="font-semibold">Alguns materiais não puderam ser gerados:</p>
                    <ul className="list-disc list-inside text-sm">
                        {failedAssets.map(title => <li key={title}>{title}</li>)}
                    </ul>
                </div>
            )}

             <ImageGrid assets={generatedAssets} />
           </div>
        )}

        {error && (
          <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-100 border border-red-300 text-red-800 rounded-lg text-center">
            <p>{error}</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-100 border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
             <p>&copy; {new Date().getFullYear()} MEGAPOST. Todos os direitos reservados.</p>
             <p className="mt-1">Powered by Google Gemini</p>
          </div>
      </footer>
    </div>
  );
};

export default App;