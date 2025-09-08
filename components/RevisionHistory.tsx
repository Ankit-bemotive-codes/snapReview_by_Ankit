import React from 'react';
import type { Revision } from '../types';
import { Icon } from './Icon';

interface RevisionHistoryProps {
  history: Revision[];
  onRevert: (revisionId: number) => void;
  currentRevisionId?: number;
}

export const RevisionHistory: React.FC<RevisionHistoryProps> = ({ history, onRevert, currentRevisionId }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
        <Icon name="Clock" className="w-5 h-5 mr-2" />
        History
      </h3>
      <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
        {history.map((revision) => (
          <div
            key={revision.id}
            onClick={() => onRevert(revision.id)}
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
              currentRevisionId === revision.id ? 'bg-cyan-500/20 ring-2 ring-cyan-500' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <img src={revision.imageUrl} alt={revision.prompt} className="w-12 h-12 object-cover rounded-md mr-3" />
            <p className="text-sm font-medium text-gray-300 flex-1 truncate">{revision.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
