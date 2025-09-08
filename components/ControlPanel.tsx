import React, { useState, useCallback, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { Icon } from './Icon';

interface ControlPanelProps {
  onImageUpload: (file: File) => void;
  onGenerate: (prompt: string) => void;
  onRevise: (prompt: string) => void;
  isImageLoaded: boolean;
  isLoading: boolean;
}

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => (
  <button
    className={`w-full flex items-center justify-center px-4 py-3 text-base font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${className}`}
    {...props}
  >
    {children}
  </button>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ onImageUpload, onGenerate, onRevise, isImageLoaded, isLoading }) => {
  const [generatePrompt, setGeneratePrompt] = useState<string>('');
  const [revisePrompt, setRevisePrompt] = useState<string>('');
  const { transcript, isListening, startListening, stopListening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setRevisePrompt(transcript);
    }
  }, [transcript]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleGenerateClick = () => {
    onGenerate(generatePrompt);
  };
  
  const handleReviseClick = () => {
    onRevise(revisePrompt);
    setRevisePrompt('');
  };
  
  const handleVoiceClick = () => {
    if(isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col gap-6 h-full">
      {/* Uploader Section */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-cyan-400">Start Here</h3>
        <label htmlFor="file-upload" className="w-full flex items-center justify-center px-4 py-3 bg-gray-700 text-gray-300 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors duration-200">
          <Icon name="Upload" className="w-5 h-5 mr-2" />
          <span>Upload Image</span>
        </label>
        <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
        
        <div className="relative flex items-center">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>

        <textarea
          value={generatePrompt}
          onChange={(e) => setGeneratePrompt(e.target.value)}
          placeholder="Generate an image, e.g., 'a cat astronaut'"
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
          rows={2}
          disabled={isLoading}
        />
        <ActionButton 
          onClick={handleGenerateClick}
          disabled={isLoading || !generatePrompt}
          className="bg-cyan-600 text-white hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
           <Icon name="Sparkles" className="w-5 h-5 mr-2" />
          Generate
        </ActionButton>
      </div>

      {/* Revise Section */}
      <div className="space-y-3 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-cyan-400">Revise Your Image</h3>
        <div className="relative flex-grow flex flex-col">
          <textarea
            value={revisePrompt}
            onChange={(e) => setRevisePrompt(e.target.value)}
            placeholder={isImageLoaded ? "Describe your changes..." : "Upload an image first"}
            className="w-full h-full p-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors flex-grow"
            rows={4}
            disabled={!isImageLoaded || isLoading}
          />
          {browserSupportsSpeechRecognition && (
            <button
              onClick={handleVoiceClick}
              disabled={!isImageLoaded || isLoading}
              className={`absolute bottom-3 right-3 p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600'} disabled:bg-gray-600 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
            >
              <Icon name="Mic" className="w-5 h-5" />
            </button>
          )}
        </div>
        <ActionButton 
          onClick={handleReviseClick}
          disabled={!isImageLoaded || isLoading || !revisePrompt}
          className="bg-purple-600 text-white hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
           <Icon name="Wand" className="w-5 h-5 mr-2" />
          Revise
        </ActionButton>
      </div>
    </div>
  );
};
