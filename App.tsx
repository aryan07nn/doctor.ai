
import React, { useState, useEffect } from 'react';
import { AppTab } from './types';
import ChatLab from './components/ChatLab';
import MapsLab from './components/MapsLab';
import ImageLab from './components/ImageLab';
import VideoLab from './components/VideoLab';
import VoiceLab from './components/VoiceLab';
import GameLab from './components/GameLab';
import { 
  MessageSquare, 
  MapPin, 
  Image as ImageIcon, 
  Film, 
  Mic, 
  Activity,
  ChevronRight,
  Mail,
  Gamepad2,
  Moon
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigation = [
    { id: AppTab.CHAT, name: 'AI Consult', icon: MessageSquare, description: 'Medical-grade search & chat' },
    { id: AppTab.MAPS, name: 'Facility Finder', icon: MapPin, description: 'Locate nearby healthcare' },
    { id: AppTab.IMAGES, name: 'Imaging Lab', icon: ImageIcon, description: 'Generate & edit medical art' },
    { id: AppTab.VIDEO, name: 'Surgical Motion', icon: Film, description: 'Animate medical concepts' },
    { id: AppTab.VOICE, name: 'Voice Clinic', icon: Mic, description: 'Real-time oral interaction' },
    { id: AppTab.GAME_TIPS, name: 'FF Max Tips', icon: Gamepad2, description: 'Ultra Pro Player strategies' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans dark">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-80' : 'w-20'} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 ease-in-out z-20`}>
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-900/20">
            <Activity size={24} />
          </div>
          {isSidebarOpen && <span className="text-xl font-bold tracking-tight text-white">doctor.ai</span>}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
              {isSidebarOpen && (
                <div className="text-left">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-[10px] opacity-70 leading-tight">{item.description}</p>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            <ChevronRight className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-w-0 bg-slate-950 shadow-2xl">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-100 capitalize flex items-center gap-2">
            {navigation.find(n => n.id === activeTab)?.name}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Dark Mode Active
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {activeTab === AppTab.CHAT && <ChatLab />}
          {activeTab === AppTab.MAPS && <MapsLab />}
          {activeTab === AppTab.IMAGES && <ImageLab />}
          {activeTab === AppTab.VIDEO && <VideoLab />}
          {activeTab === AppTab.VOICE && <VoiceLab />}
          {activeTab === AppTab.GAME_TIPS && <GameLab />}
        </div>

        {/* Developer Credit Overlay */}
        <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
          <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700 shadow-2xl rounded-2xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" 
                alt="Aryan Yadav" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30 shadow-sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></div>
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-sm font-bold text-white leading-tight tracking-tight">Aryan Yadav</span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Mail size={10} className="text-blue-400" />
                <span className="text-[10px] font-medium text-slate-400">9453aryan@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
