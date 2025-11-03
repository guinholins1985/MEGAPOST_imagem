import React, { useState, useEffect } from 'react';
import { SparklesIcon } from './icons';

const LOADING_MESSAGES = [
  "Analisando as características do produto...",
  "Determinando os melhores materiais de marketing para gerar...",
  "Gerando conceitos criativos com IA...",
  "Criando fotos de produtos em alta resolução...",
  "Construindo mockups de estilo de vida realistas...",
  "Planejando layouts para redes sociais...",
  "Desenhando banners chamativos para anúncios...",
  "Explorando efeitos visuais e estilos...",
  "Renderizando vídeos promocionais (isso pode levar um minuto)...",
  "Otimizando os materiais para todas as plataformas...",
  "Aplicando os toques finais...",
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
    <div className="max-w-3xl mx-auto flex flex-col items-center text-center p-8 bg-white/60 border border-gray-200/80 rounded-xl shadow-2xl backdrop-blur-lg">
      <div className="relative mb-6">
        {originalImage && (
          <img src={originalImage} alt="Produto sendo analisado" className="w-48 h-48 rounded-lg object-cover shadow-lg" />
        )}
        <div className="absolute -inset-2 rounded-lg border-2 border-dashed border-indigo-500/50 animate-spin-slow"></div>
        <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center">
            <SparklesIcon className="w-16 h-16 text-indigo-500 animate-pulse"/>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Geração com IA em Progresso</h2>
      <p className="text-slate-500 mb-6">Seus materiais de marketing estão sendo criados. Por favor, aguarde...</p>
      
      <div className="w-full bg-slate-200 rounded-full h-2.5 mb-4 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full animate-loader-progress"></div>
      </div>

      <div className="h-6 mt-2">
          <p className="text-indigo-600 transition-opacity duration-500">
            {LOADING_MESSAGES[currentMessageIndex]}
          </p>
      </div>

      <style>{`
        @keyframes loader-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loader-progress {
          animation: loader-progress 45s linear infinite;
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