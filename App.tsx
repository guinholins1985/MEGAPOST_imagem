import React, { useState, useCallback } from 'react';
import { GeneratedAsset } from './types';
import { generateMarketingAssets } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import ImageGrid from './components/ImageGrid';
import Loader from './components/Loader';
import { SparklesIcon } from './components/icons';

// Add aistudio to window interface for Veo API key selection
// FIX: The original inline type for `aistudio` caused a declaration conflict. Defining a named `AIStudio` interface and using it resolves the issue.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

const Logo: React.FC = () => (
    <div className="flex items-center space-x-3">
        <SparklesIcon className="w-8 h-8 text-indigo-500" />
        <span className="text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
            MEGAPOST
        </span>
    </div>
);


const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (image: { data: string; mimeType: string }) => {
     if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        if (typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        } else {
          setError("Função para selecionar chave de API não encontrada.");
          return;
        }
      }
    }

    setIsLoading(true);
    setError(null);
    setGeneratedAssets([]);
    setOriginalImage(image);

    try {
      // FIX: Removed explicit API_KEY check to align with guidelines, which state the key is assumed to be configured externally.
      const assets = await generateMarketingAssets(image.data, image.mimeType);
      setGeneratedAssets(assets);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "Ocorreu um erro desconhecido durante a geração.";
       if (errorMessage.includes("Requested entity was not found.")) {
        setError("Sua chave de API pode ser inválida. Por favor, selecione uma chave de API válida. [Saiba mais sobre cobrança](https://ai.google.dev/gemini-api/docs/billing)");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="sticky top-0 z-50 py-4 border-b border-slate-200/80 bg-white/60 backdrop-blur-lg">
        <div className="container mx-auto flex items-center justify-center px-4">
          <Logo />
        </div>
      </header>

      <main className="py-10 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500">
              Transforme uma Imagem em Posts Incríveis
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
              Envie uma única imagem de produto para gerar automaticamente um conjunto completo de materiais de marketing profissionais e prontos para uso em segundos.
            </p>
          </div>

          <div className="animate-slideUp" style={{ animationDelay: '0.4s' }}>
            {!isLoading && generatedAssets.length === 0 && (
              <ImageUploader onGenerate={handleGenerate} disabled={isLoading} />
            )}

            {error && (
              <div className="max-w-3xl mx-auto mt-8 p-4 bg-red-100 border border-red-300 rounded-lg text-center">
                <h3 className="text-lg font-semibold text-red-800">Falha na Geração</h3>
                <p className="mt-2 text-red-600">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setOriginalImage(null);
                  }}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold transition-colors"
                >
                  Tentar Novamente
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
                      Gerar Novos Materiais
                  </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 mt-12 border-t border-slate-200">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} MEGAPOST. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;