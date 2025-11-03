import React, { useState, useCallback, ChangeEvent } from 'react';
import { UploadIcon, LinkIcon } from './icons';

interface ImageUploaderProps {
  onGenerate: (image: { data: string; mimeType: string }) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onGenerate, disabled }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
        setError('Tipo de arquivo inválido. Por favor, envie um arquivo JPG, PNG ou WEBP.');
        setFile(null);
        setPreview(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Arquivo muito grande. Por favor, envie uma imagem menor que 5MB.');
        setFile(null);
        setPreview(null);
        return;
      }
      setError(null);
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const handleSubmit = useCallback(() => {
    if (!file || !preview) return;
    const base64String = preview.split(',')[1];
    onGenerate({ data: base64String, mimeType: file.type });
  }, [file, preview, onGenerate]);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/60 border border-gray-200/80 rounded-xl p-8 shadow-2xl backdrop-blur-lg">
      <div
        className="border-2 border-dashed border-gray-400 rounded-lg p-8 text-center bg-slate-50/50 cursor-pointer hover:border-indigo-500 hover:bg-slate-50 transition-colors"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
        {preview ? (
          <img src={preview} alt="Pré-visualização do produto" className="max-h-48 mx-auto rounded-md object-contain" />
        ) : (
          <div className="flex flex-col items-center text-slate-500">
            <UploadIcon className="w-12 h-12 mb-4 text-gray-400" />
            <p className="font-semibold text-slate-700">
              <span className="text-indigo-600">Clique para enviar</span> ou arraste e solte
            </p>
            <p className="text-sm">PNG, JPG, ou WEBP (máx. 5MB)</p>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}

      <div className="relative my-6 flex items-center justify-center">
          <span className="absolute w-full h-px bg-gray-300"></span>
          <span className="relative px-4 bg-white/0 text-sm font-medium text-slate-500 backdrop-blur-sm">OU</span>
      </div>
      
      <div>
          <label htmlFor="url-input" className="sr-only">Importar de um link</label>
          <div className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5 text-slate-400"/>
              <input 
                  id="url-input"
                  type="text"
                  placeholder="Cole a URL do produto para importar (em breve)"
                  disabled
                  className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
          </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!file || disabled || !!error}
          className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:bg-indigo-700 hover:scale-105 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
        >
          {disabled ? 'Gerando...' : 'Gerar Materiais de Marketing'}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
