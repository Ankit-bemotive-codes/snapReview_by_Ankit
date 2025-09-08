import React from 'react';
import { PRESET_PROMPTS } from '../constants';
import { Icon, type IconName } from './Icon';

interface PresetEditsProps {
  onPresetSelect: (presetKey: keyof typeof PRESET_PROMPTS) => void;
  disabled: boolean;
}

type PresetKey = keyof typeof PRESET_PROMPTS;

export const PresetEdits: React.FC<PresetEditsProps> = ({ onPresetSelect, disabled }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
        <Icon name="Wand" className="w-5 h-5 mr-2" />
        Quick Edits
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(PRESET_PROMPTS) as PresetKey[]).map((key) => {
          const preset = PRESET_PROMPTS[key];
          return (
            <button
              key={key}
              onClick={() => onPresetSelect(key)}
              disabled={disabled}
              className="flex flex-col items-center justify-center p-2 text-center bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:bg-gray-700/50 disabled:cursor-not-allowed disabled:text-gray-500"
              title={preset.prompt}
            >
              <Icon name={preset.icon as IconName} className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
