import React from 'react';
import { GeneratedAsset } from '../types';
import { DownloadIcon } from './icons';

interface ImageGridProps {
  assets: GeneratedAsset[];
}

const AssetCard: React.FC<{ asset: GeneratedAsset }> = ({ asset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = `${asset.title.replace(/\s+/g, '_')}.${asset.type === 'video' ? 'mp4' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      {asset.type === 'image' ? (
        <img src={asset.url} alt={asset.title} className="w-full h-full object-cover aspect-square" />
      ) : (
        <video src={asset.url} autoPlay loop muted playsInline className="w-full h-full object-cover aspect-square" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="p-4 absolute bottom-0 left-0 right-0">
          <h3 className="font-bold text-slate-800 text-lg">{asset.title}</h3>
          <p className="text-sm text-slate-600 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100">{asset.prompt}</p>
        </div>
        <button
          onClick={handleDownload}
          className="absolute top-3 right-3 p-2 bg-white/70 rounded-full text-slate-700 hover:bg-indigo-500 hover:text-white transition-all scale-0 group-hover:scale-100 delay-150"
          title="Baixar material"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ImageGrid: React.FC<ImageGridProps> = ({ assets }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl">
      {assets.map((asset) => (
        <AssetCard key={asset.title} asset={asset} />
      ))}
    </div>
  );
};

export default ImageGrid;
