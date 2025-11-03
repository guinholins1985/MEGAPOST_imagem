import React from 'react';
import { GeneratedAsset, AssetCategory, AssetCategoryGroups } from '../types';
import { DownloadIcon } from './icons';

interface ImageGridProps {
  assets: GeneratedAsset[];
}

const AssetCard: React.FC<{ asset: GeneratedAsset }> = ({ asset }) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = `${asset.title.replace(/[^a-zA-Z0-9]/g, '_')}.${asset.type === 'video' ? 'mp4' : 'png'}`;
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
        <div className="p-4 text-white">
          <h3 className="font-bold text-lg">{asset.title}</h3>
        </div>
      </div>
       <button
          onClick={handleDownload}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-full text-slate-700 backdrop-blur-sm hover:bg-indigo-500 hover:text-white transition-all scale-0 group-hover:scale-100 delay-150"
          title="Baixar material"
        >
          <DownloadIcon className="w-5 h-5" />
        </button>
    </div>
  );
};

const ImageGrid: React.FC<ImageGridProps> = ({ assets }) => {
  const assetsByTitle = assets.reduce((acc, asset) => {
    acc[asset.title] = asset;
    return acc;
  }, {} as Record<string, GeneratedAsset>);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12">
      {Object.entries(AssetCategoryGroups).map(([groupName, categoriesInGroup]) => {
        const assetsInGroup = categoriesInGroup
          .map(category => assetsByTitle[category])
          .filter(Boolean);

        if (assetsInGroup.length === 0) {
          return null;
        }

        return (
          <section key={groupName} className="animate-fadeIn">
            <h2 className="text-3xl font-bold text-slate-800 border-b-2 border-indigo-300 pb-3 mb-8">
              {groupName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {assetsInGroup.map((asset) => (
                <AssetCard key={asset.title} asset={asset} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ImageGrid;