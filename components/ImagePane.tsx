import React from 'react';
import type { Revision } from '../types';
import { Icon } from './Icon';

interface ImagePaneProps {
  title: string;
  revision: Revision | null;
  isLoading?: boolean;
  loadingMessage?: string;
}

export const ImagePane: React.FC<ImagePaneProps> = ({ title, revision, isLoading = false, loadingMessage = 'Processing...' }) => {
  return (
    <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-center p-4 border border-gray-700 shadow-lg relative aspect-square h-full">
      <h2 className="absolute top-4 left-4 text-lg font-semibold bg-gray-900/50 px-3 py-1 rounded-full">{title}</h2>
      {revision ? (
        <img src={revision.imageUrl} alt={revision.prompt} className="max-w-full max-h-full object-contain rounded-lg" />
      ) : (
        <div className="text-center text-gray-500 flex flex-col items-center">
          <Icon name="Image" className="w-16 h-16 mb-2" />
          <p>Your image will appear here</p>
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-lg font-semibold text-white">{loadingMessage}</p>
        </div>
      )}
    </div>
  );
};
