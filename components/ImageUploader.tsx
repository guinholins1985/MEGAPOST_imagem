
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
        setError('Invalid file type. Please upload a JPG, PNG, or WEBP file.');
        setFile(null);
        setPreview(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Please upload an image smaller than 5MB.');
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
    <div className="max-w-3xl mx-auto bg-gray-800/50 border border-gray-700 rounded-xl p-8 shadow-2xl">
      <div className="flex space-x-4 mb-6 border-b border-gray-700">
        <button className="flex items-center space-x-2 py-3 px-4 text-white border-b-2 border-indigo-500 font-semibold">
          <UploadIcon className="w-5 h-5" />
          <span>Upload Image</span>
        </button>
        <button className="flex items-center space-x-2 py-3 px-4 text-gray-500 cursor-not-allowed" title="Link import is not yet available">
          <LinkIcon className="w-5 h-5" />
          <span>Import from Link</span>
        </button>
      </div>

      <div
        className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center bg-gray-900/50 cursor-pointer hover:border-indigo-500 transition-colors"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
        {preview ? (
          <img src={preview} alt="Product Preview" className="max-h-48 mx-auto rounded-md object-contain" />
        ) : (
          <div className="flex flex-col items-center text-gray-400">
            <UploadIcon className="w-12 h-12 mb-4 text-gray-500" />
            <p className="font-semibold text-gray-300">
              <span className="text-indigo-400">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm">PNG, JPG, or WEBP (max. 5MB)</p>
          </div>
        )}
      </div>

      {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!file || disabled || !!error}
          className="w-full sm:w-auto px-10 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg transition-all transform hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
        >
          {disabled ? 'Generating...' : 'Generate Marketing Assets'}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
