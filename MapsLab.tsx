
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message } from '../types';
import { Send, Map, Loader2, Navigation, Star } from 'lucide-react';

const MapsLab: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'I can help you find medical facilities, pharmacies, and specialist clinics. Please share your location or specify an area.', 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearch = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let latLng = undefined;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        latLng = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
      } catch (e) {
        console.warn("Geolocation denied or failed, proceeding without location data.");
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: input,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: latLng ? { latLng } : undefined
          }
        },
      });

      const assistantMsg: Message = {
        role: 'assistant',
        content: response.text || "I found some results but couldn't format the response properly.",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Maps Error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "There was an error accessing the mapping service. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-5 ${
              msg.role === 'user' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-slate-900 text-slate-100 shadow-sm border border-slate-800'
            }`}>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-800 flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-400" size={18} />
              <span className="text-sm text-slate-400">Scanning local infrastructure...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search for facilities..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !input.trim()}
            className="bg-slate-100 text-slate-950 p-3 rounded-xl hover:bg-white disabled:opacity-50 transition-colors shadow-lg"
          >
            <Navigation size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapsLab;
