
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Loader2, Plus, Edit3, Download, RefreshCw, Layers } from 'lucide-react';

const ImageLab: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [generatedImages, setGeneratedImages] = useState<{url: string, prompt: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    try {
      if (typeof window !== 'undefined' && !(await (window as any).aistudio?.hasSelectedApiKey())) {
        await (window as any).aistudio?.openSelectKey();
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: { parts: [{ text: prompt }] },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: imageSize
          }
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          setGeneratedImages(prev => [{ url: imageUrl, prompt }, ...prev]);
          break;
        }
      }
    } catch (error) {
      console.error("Image Generation Error:", error);
      alert("Failed to generate image. Ensure you have selected a valid API key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt.trim()) return;
    setIsEditing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = selectedImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: `Apply this edit to the image: ${prompt}` }
          ]
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          setGeneratedImages(prev => [{ url: imageUrl, prompt: `Edit: ${prompt}` }, ...prev]);
          setSelectedImage(imageUrl);
          break;
        }
      }
    } catch (error) {
      console.error("Image Edit Error:", error);
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-950 overflow-hidden">
      {/* Control Panel */}
      <div className="w-full md:w-80 border-r border-slate-800 bg-slate-900 p-6 overflow-y-auto">
        <h3 className="text-sm font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-blue-400" />
          Generation Settings
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Resolution</label>
            <div className="grid grid-cols-3 gap-2">
              {(["1K", "2K", "4K"] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    imageSize === size 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={selectedImage ? "Describe edits..." : "Describe visualization..."}
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <div className="space-y-2">
            {!selectedImage ? (
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                Generate
              </button>
            ) : (
              <>
                <button
                  onClick={handleEdit}
                  disabled={isEditing || !prompt.trim()}
                  className="w-full bg-slate-100 text-slate-950 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-white disabled:opacity-50 transition-all"
                >
                  {isEditing ? <Loader2 className="animate-spin" size={18} /> : <Edit3 size={18} />}
                  Apply Edits
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="w-full bg-slate-800 text-slate-400 py-2 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-4 uppercase tracking-widest">
            <Layers size={14} />
            History
          </div>
          <div className="grid grid-cols-2 gap-2">
            {generatedImages.map((img, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(img.url)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img.url ? 'border-blue-500' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {selectedImage || generatedImages[0]?.url ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 p-2 rounded-2xl shadow-2xl border border-slate-800">
              <img 
                src={selectedImage || generatedImages[0].url} 
                alt="Visualization" 
                className="w-full rounded-xl shadow-inner"
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-700">
            <Plus size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">Imaging Core Ready</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageLab;
