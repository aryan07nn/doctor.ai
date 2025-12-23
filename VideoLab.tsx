
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Film, Upload, Play, Loader2, Info, AlertTriangle } from 'lucide-react';

const VideoLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "9:16">("16:9");
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !image) return;
    setStatus('processing');
    setError(null);

    try {
      if (typeof window !== 'undefined' && !(await (window as any).aistudio?.hasSelectedApiKey())) {
        await (window as any).aistudio?.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: base64Data,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (pollError: any) {
          if (pollError.message?.includes("Requested entity was not found")) {
            setStatus('idle');
            await (window as any).aistudio?.openSelectKey();
            throw new Error("Session expired.");
          }
          throw pollError;
        }
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('done');
      }
    } catch (err: any) {
      console.error("Video Generation Error:", err);
      setError(err.message || "An unexpected error occurred.");
      setStatus('idle');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="flex-1 flex flex-col md:flex-row p-6 gap-6 overflow-y-auto">
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-800">
            <h3 className="font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Film size={18} className="text-blue-400" />
              Motion Suite
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Frame Source</label>
                <div className="relative group cursor-pointer border-2 border-dashed border-slate-800 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all aspect-video flex items-center justify-center bg-slate-950">
                  {image ? (
                    <img src={image} className="w-full h-full object-cover" alt="Source" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload size={24} className="mx-auto mb-2 text-slate-600" />
                      <span className="text-xs text-slate-500">Upload Frame</span>
                    </div>
                  )}
                  <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Aspect Ratio</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["16:9", "9:16"] as const).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                        aspectRatio === ratio ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={status === 'processing' || !prompt || !image}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 shadow-lg shadow-blue-900/20 transition-all"
              >
                {status === 'processing' ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                Animate
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-slate-900 rounded-2xl shadow-sm border border-slate-800 overflow-hidden flex flex-col items-center justify-center p-8 relative min-h-[400px]">
          {status === 'processing' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="font-bold text-slate-100">Rendering Sequence...</p>
            </div>
          ) : videoUrl ? (
            <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-xl shadow-2xl" />
          ) : (
            <Film size={80} className="text-slate-800 opacity-20" />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLab;
