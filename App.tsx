
import React, { useState, useEffect, useRef } from 'react';
import { AppView, Player, Message } from './types';
import { GeminiService } from './services/geminiService';
import Sidebar from './components/Sidebar';
import PlayerPanel from './components/PlayerPanel';
import ChatInterface from './components/ChatInterface';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import LiveVoice from './components/LiveVoice';
import AnalysisHub from './components/AnalysisHub';
import MapsGrounding from './components/MapsGrounding';

const PLAYERS: Player[] = [
  { id: '1', name: 'Doctor साहब', ability: 'Master Strategist & Tactical Combat Analysis', avatar: 'https://picsum.photos/seed/doc/200', level: 69, voice: 'Kore' },
  { id: '2', name: 'Shivansh', ability: 'Apex Reflexes & High-Speed Frame Processing', avatar: 'https://picsum.photos/seed/shiv/200', level: 70, voice: 'Puck' },
  { id: '3', name: 'Ankit', ability: 'World-Builder & Cinematic Visual Synthesis', avatar: 'https://picsum.photos/seed/ankit/200', level: 67, voice: 'Zephyr' }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.CHAT);
  const [gemini, setGemini] = useState<GeminiService | null>(null);
  const [isVeoAuthorized, setIsVeoAuthorized] = useState(false);

  useEffect(() => {
    const service = new GeminiService();
    setGemini(service);
    
    // Check for Veo authorization status
    if ((window as any).aistudio) {
        (window as any).aistudio.hasSelectedApiKey().then((has: boolean) => {
            setIsVeoAuthorized(has);
        });
    }
  }, []);

  const handlePlayerClick = async (player: Player) => {
    if (!gemini) return;
    const greeting = `Hello, I am ${player.name}, I will help you with ${player.ability}`;
    await gemini.speak(greeting, player.voice);
  };

  const handleVeoAuth = async () => {
    if ((window as any).aistudio) {
        await (window as any).aistudio.openSelectKey();
        setIsVeoAuthorized(true);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-white font-sans">
      {/* Left Navigation */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 border-x border-zinc-800">
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold italic shadow-lg shadow-blue-500/20">D.AI</div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight leading-none">Doctor.AI</h1>
              <span className="text-[9px] text-blue-500 uppercase tracking-widest font-bold">Gaming & Entertainment Edition</span>
            </div>
          </div>
          {!isVeoAuthorized && (
            <button 
              onClick={handleVeoAuth}
              className="bg-zinc-800 hover:bg-zinc-700 text-xs px-4 py-2 rounded-full border border-zinc-700 transition-all"
            >
              Authorize Pro Engine
            </button>
          )}
        </header>

        <div className="flex-1 overflow-hidden relative">
          {gemini ? (
            <>
              {activeView === AppView.CHAT && <ChatInterface gemini={gemini} />}
              {activeView === AppView.IMAGE_STUDIO && <ImageStudio gemini={gemini} />}
              {activeView === AppView.VIDEO_STUDIO && <VideoStudio gemini={gemini} isAuthorized={isVeoAuthorized} onAuth={handleVeoAuth} />}
              {activeView === AppView.LIVE_VOICE && <LiveVoice gemini={gemini} />}
              {activeView === AppView.ANALYSIS && <AnalysisHub gemini={gemini} />}
              {activeView === AppView.MAPS_SEARCH && <MapsGrounding gemini={gemini} />}
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </main>

      {/* Right Player Panel */}
      <PlayerPanel players={PLAYERS} onPlayerClick={handlePlayerClick} />
    </div>
  );
};

export default App;
