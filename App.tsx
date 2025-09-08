import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImagePane } from './components/ImagePane';
import { ControlPanel } from './components/ControlPanel';
import { RevisionHistory } from './components/RevisionHistory';
import { PresetEdits } from './components/PresetEdits';
import { generateInitialImage, editImage } from './services/geminiService';
import type { Revision } from './types';
import { PRESET_PROMPTS } from './constants';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<Revision | null>(null);
  const [currentImage, setCurrentImage] = useState<Revision | null>(null);
  const [revisionHistory, setRevisionHistory] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const initialRevision: Revision = {
        id: Date.now(),
        imageUrl: base64String,
        prompt: 'Original Image',
        mimeType: file.type,
      };
      setOriginalImage(initialRevision);
      setCurrentImage(initialRevision);
      setRevisionHistory([initialRevision]);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read the uploaded file.');
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateImage = useCallback(async (prompt: string) => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Generating your vision... ✨');
    setError(null);
    try {
      const { base64, mimeType } = await generateInitialImage(prompt);
      const imageUrl = `data:${mimeType};base64,${base64}`;
      const newRevision: Revision = {
        id: Date.now(),
        imageUrl,
        prompt: `Generated: "${prompt}"`,
        mimeType,
      };
      setOriginalImage(newRevision);
      setCurrentImage(newRevision);
      setRevisionHistory([newRevision]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReviseImage = useCallback(async (prompt: string) => {
    if (!currentImage) {
      setError('Please upload or generate an image first.');
      return;
    }
    if (!prompt) {
      setError('Please enter a revision command.');
      return;
    }
    setIsLoading(true);
    setLoadingMessage('Applying AI magic... 🪄');
    setError(null);
    try {
      // Extract base64 data from data URL
      const base64Data = currentImage.imageUrl.split(',')[1];
      const { base64, mimeType } = await editImage(base64Data, currentImage.mimeType, prompt);
      const imageUrl = `data:${mimeType};base64,${base64}`;
      const newRevision: Revision = {
        id: Date.now(),
        imageUrl,
        prompt,
        mimeType,
      };
      setCurrentImage(newRevision);
      setRevisionHistory(prev => [...prev, newRevision]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image revision.');
    } finally {
      setIsLoading(false);
    }
  }, [currentImage]);
  
  const handlePresetEdit = (presetKey: keyof typeof PRESET_PROMPTS) => {
    handleReviseImage(PRESET_PROMPTS[presetKey].prompt);
  };

  const handleRevert = (revisionId: number) => {
    const revisionIndex = revisionHistory.findIndex(r => r.id === revisionId);
    if (revisionIndex !== -1) {
      const targetRevision = revisionHistory[revisionIndex];
      setCurrentImage(targetRevision);
      // Prune history to the point of reversion
      setRevisionHistory(prev => prev.slice(0, revisionIndex + 1));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-1/5 flex flex-col gap-6">
          <PresetEdits onPresetSelect={handlePresetEdit} disabled={!currentImage || isLoading} />
          <RevisionHistory history={revisionHistory} onRevert={handleRevert} currentRevisionId={currentImage?.id} />
        </aside>
        
        <div className="flex-grow lg:w-3/5 flex flex-col gap-6">
          {error && (
            <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <ImagePane title="Before" revision={originalImage} />
            <ImagePane title="After" revision={currentImage} isLoading={isLoading} loadingMessage={loadingMessage} />
          </div>
        </div>

        <aside className="w-full lg:w-1/5">
          <ControlPanel 
            onImageUpload={handleImageUpload}
            onGenerate={handleGenerateImage}
            onRevise={handleReviseImage}
            isImageLoaded={!!currentImage}
            isLoading={isLoading}
          />
        </aside>
      </main>
    </div>
  );
};

export default App;
