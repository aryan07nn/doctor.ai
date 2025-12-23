
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, Waves, Radio, Activity, Loader2 } from 'lucide-react';
import { decode, encode, decodeAudioData, createBlob } from '../services/audioUtils';

const VoiceLab: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{text: string, type: 'user' | 'ai'}[]>([]);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    setTranscriptions([]);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
            if (message.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev, { text: message.serverContent!.outputTranscription!.text, type: 'ai' }]);
            } else if (message.serverContent?.inputTranscription) {
              setTranscriptions(prev => [...prev, { text: message.serverContent!.inputTranscription!.text, type: 'user' }]);
            }
          },
          onerror: (e) => { stopSession(); },
          onclose: () => { stopSession(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: "You are doctor.ai. Professional and concise voice interface."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    setIsActive(false);
    setIsConnecting(false);
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-950 relative overflow-hidden">
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${isActive ? 'opacity-10' : 'opacity-0'}`}>
        <div className="w-[600px] h-[600px] bg-blue-600 rounded-full animate-ping"></div>
      </div>

      <div className="z-10 w-full max-w-xl text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-bold text-slate-400 tracking-widest uppercase">
            <Radio size={14} className={isActive ? 'text-red-500 animate-pulse' : ''} />
            {isActive ? 'Session Active' : 'Voice Lab'}
          </div>
          <h2 className="text-4xl font-bold text-white">Direct Oral Link</h2>
        </div>

        <div className="relative h-48 flex items-center justify-center">
          {isActive ? (
            <div className="flex items-center gap-2 h-16">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="w-1 bg-blue-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 80 + 20}%`, animationDelay: `${i * 0.05}s` }}></div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-900 rounded-full shadow-2xl border border-slate-800">
              <Mic size={64} className="text-slate-800" />
            </div>
          )}
        </div>

        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`px-12 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-4 transition-all ${
            isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-600 text-white shadow-xl shadow-blue-900/40'
          }`}
        >
          {isActive ? <MicOff size={24} /> : <Mic size={24} />}
          {isActive ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
};

export default VoiceLab;
