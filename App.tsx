
import React, { useState, useRef, useEffect } from 'react';
import { translations } from './i18n';
import { Job, Language, AISearchResponse } from './types';
import { GeminiService } from './geminiService';
import { GoogleGenAI } from "@google/genai";

// --- Components ---

const JobCard: React.FC<{ job: Job; lang: Language; t: any }> = ({ job, lang, t }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    if (job.sourceUrl) {
      window.open(job.sourceUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert(lang === 'kn' ? "ಈ ಕೆಲಸಕ್ಕೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಲು ಯಾವುದೇ ಲಿಂಕ್ ಲಭ್ಯವಿಲ್ಲ." : "No application link available for this job.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${job.title} at ${job.company}`,
      text: `Check out this job opening for ${job.title} at ${job.company} in ${job.location}.`,
      url: job.sourceUrl || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share failed', err);
        setShowShareMenu(!showShareMenu);
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(job.sourceUrl || window.location.href);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${job.title} at ${job.company}: ${job.sourceUrl || window.location.href}`)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(job.sourceUrl || window.location.href)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this job: ${job.title} at ${job.company}`)}&url=${encodeURIComponent(job.sourceUrl || window.location.href)}`
  };

  const isUserPosted = job.id.startsWith('user-');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow group relative overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      {isUserPosted && (
        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-2 py-1 font-bold rounded-bl-lg uppercase tracking-wider">
          User Posted
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{job.title}</h3>
          <p className="text-blue-600 dark:text-blue-400 font-medium">{job.company}</p>
        </div>
        <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded uppercase">
          {job.type}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
          {job.location}
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7"/></svg>
          {job.salary}
        </div>
      </div>
      <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed">{job.description}</p>
      
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 relative">
        <span className="text-xs text-slate-400 dark:text-slate-500 italic">{t.posted}: {job.postedAt}</span>
        
        <div className="flex items-center gap-2" ref={shareRef}>
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
            {t.share}
          </button>
          
          <button 
            onClick={handleApply} 
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {t.applyNow}
          </button>

          {showShareMenu && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-700 py-2 z-20 animate-in fade-in zoom-in duration-200">
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors">
                 <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.41 0 .01 5.403.01 12.039c0 2.12.556 4.189 1.613 6.036L0 24l6.102-1.601a11.811 11.811 0 005.94 1.603h.005c6.64 0 12.039-5.403 12.04-12.04a11.802 11.802 0 00-3.417-8.467z"/></svg>
                 WhatsApp
              </a>
              <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors">
                 <svg className="w-5 h-5 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                 LinkedIn
              </a>
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors">
                 <svg className="w-5 h-5 text-slate-900 dark:text-slate-100" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                 X
              </a>
              <button 
                onClick={copyToClipboard}
                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors border-t border-slate-100 dark:border-slate-700 mt-1"
              >
                 <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                 {copied ? t.copied : t.copyLink}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PostJobForm: React.FC<{ t: any; onPost: (job: Job) => void }> = ({ t, onPost }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    type: 'Full-time',
    description: '',
    sourceUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Job = {
      ...formData,
      id: `user-${crypto.randomUUID()}`,
      postedAt: new Date().toLocaleDateString(),
    };
    onPost(newJob);
    setFormData({ title: '', company: '', location: '', salary: '', type: 'Full-time', description: '', sourceUrl: '' });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 max-w-2xl mx-auto">
      <div className="mb-8 border-b border-slate-100 dark:border-slate-700 pb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.postJobTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.postJobDesc}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.jobUrlLabel}</label>
            <input 
              type="url" 
              value={formData.sourceUrl} 
              onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})} 
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              placeholder="https://example.com/apply" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.jobTitleLabel}</label>
            <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Senior Developer" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.companyLabel}</label>
            <input required value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.location}</label>
            <input required value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. Bangalore, KA" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.salary}</label>
            <input required value={formData.salary} onChange={(e) => setFormData({...formData, salary: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="e.g. ₹10 LPA" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.type}</label>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all">
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.keywordsLabel} (Description)</label>
          <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none" placeholder="Write details about the job..." />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg active:scale-95">
          {t.publishBtn}
        </button>
      </form>
    </div>
  );
};

const PhotoStudio: React.FC<{ t: any }> = ({ t }) => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAIEdit = async () => {
    if (!image) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = image.split(',')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: aiPrompt || "Enhance this for a professional LinkedIn profile picture with a clean background." }
          ]
        }
      });
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setProcessedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error("AI Edit Error:", error);
      alert("AI processing failed. Check your connection.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualResize = () => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      ctx?.drawImage(img, 0, 0, dimensions.width, dimensions.height);
      setProcessedImage(canvas.toDataURL());
    };
    img.src = image;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{t.studioTitle}</h2>
        <p className="text-slate-500 dark:text-slate-400">{t.studioDesc}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-10 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group">
            <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} accept="image/*" />
            {image ? <img src={image} className="max-h-64 mx-auto rounded-lg shadow-md" alt="Source" /> : 
              <div className="text-slate-400 dark:text-slate-500 py-10">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <p className="font-bold">{t.uploadPhoto}</p>
              </div>
            }
          </div>

          {image && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-4">{t.cropResize}</h4>
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">{t.width}</label>
                    <input type="number" value={dimensions.width} onChange={(e) => setDimensions({...dimensions, width: parseInt(e.target.value)})} className="w-full px-3 py-2 border dark:border-slate-600 dark:bg-slate-800 rounded-lg" />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase">{t.height}</label>
                    <input type="number" value={dimensions.height} onChange={(e) => setDimensions({...dimensions, height: parseInt(e.target.value)})} className="w-full px-3 py-2 border dark:border-slate-600 dark:bg-slate-800 rounded-lg" />
                  </div>
                </div>
                <button onClick={handleManualResize} className="w-full bg-slate-800 dark:bg-slate-700 text-white py-2 rounded-lg font-medium">{t.processBtn}</button>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> {t.aiEdit}</h4>
                <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="w-full px-4 py-2 border dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 rounded-lg h-24 mb-4" placeholder={t.aiEditPlaceholder} />
                <button disabled={isProcessing} onClick={handleAIEdit} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold shadow-md disabled:opacity-50">{isProcessing ? 'AI processing...' : t.aiEdit}</button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl flex items-center justify-center min-h-[400px] border dark:border-slate-700 relative overflow-hidden">
          <canvas ref={canvasRef} hidden />
          {processedImage ? (
            <div className="p-6 text-center">
              <img src={processedImage} className="max-w-full rounded-lg shadow-2xl mx-auto mb-6 bg-white dark:bg-slate-800" alt="Final" />
              <a href={processedImage} download="resume-photo.png" className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 mx-auto w-fit">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg> {t.downloadBtn}
              </a>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 font-medium">Preview will appear here</p>
          )}
          {isProcessing && <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<'jobs' | 'studio' | 'post'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AISearchResponse | null>(null);
  const [userJobs, setUserJobs] = useState<Job[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('yoursjob_theme') === 'dark';
  });
  
  const t = translations[lang];

  useEffect(() => {
    const saved = localStorage.getItem('namma_user_jobs');
    if (saved) setUserJobs(JSON.parse(saved));
    
    // Auto-load recent jobs using AI on mount
    loadDefaultJobs();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('yoursjob_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('yoursjob_theme', 'light');
    }
  }, [isDarkMode]);

  const loadDefaultJobs = async () => {
    setIsLoading(true);
    try {
      const gemini = new GeminiService();
      const response = await gemini.searchJobs("Latest job openings in Karnataka 2024", lang);
      setAiResponse(response);
    } catch (error) {
      console.error("Auto-load failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string = searchQuery, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setAiResponse(null);
    try {
      const gemini = new GeminiService();
      const response = await gemini.searchJobs(query, lang);
      setAiResponse(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostJob = (job: Job) => {
    const updated = [job, ...userJobs];
    setUserJobs(updated);
    localStorage.setItem('namma_user_jobs', JSON.stringify(updated));
    setActiveTab('jobs');
    alert(t.successMsg);
  };

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setActiveTab('jobs'); setAiResponse(null); loadDefaultJobs();}}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">Y</div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{t.title}</h1>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {['jobs', 'post', 'studio'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                {tab === 'jobs' ? t.tabJobs : tab === 'post' ? t.tabPost : tab === 'studio' ? t.tabStudio : ''}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900 shadow-sm"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              )}
            </button>
            <button onClick={() => setLang(l => l === 'en' ? 'kn' : 'en')} className="px-4 py-2 rounded-full border border-slate-300 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all bg-white dark:bg-slate-900 shadow-sm">
              {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
            </button>
          </div>
        </div>
      </nav>

      {activeTab === 'jobs' && (
        <>
          <section className="bg-slate-900 dark:bg-slate-950 py-24 px-6 text-center relative overflow-hidden transition-colors duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-slate-900/10 dark:from-blue-900/40 dark:to-slate-950/20"></div>
            <div className="max-w-4xl mx-auto relative z-10">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight">{t.subtitle}</h2>
              <form onSubmit={(e) => handleSearch(searchQuery, e)} className="relative max-w-2xl mx-auto mb-8 group">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-14 pr-32 py-6 rounded-2xl shadow-2xl text-lg outline-none focus:ring-4 focus:ring-blue-500 dark:bg-slate-800 dark:text-white dark:border-slate-700 transition-all" placeholder={t.searchPlaceholder} />
                <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <button type="submit" disabled={isLoading} className="absolute right-3 top-3 bottom-3 bg-blue-600 text-white px-8 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50">{isLoading ? '...' : t.searchBtn}</button>
              </form>
              <div className="flex flex-wrap justify-center gap-3">
                {Object.entries(t.categories).map(([k, v]) => (
                  <button key={k} onClick={() => {setSearchQuery(v); handleSearch(v);}} className="px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 text-white text-sm font-medium hover:bg-white/20 border border-white/20 transition-all">
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </section>
          <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {userJobs.length > 0 && !searchQuery && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                    {t.userJobsTitle}
                  </h2>
                  <div className="space-y-6">
                    {userJobs.map(j => <JobCard key={j.id} job={j} lang={lang} t={t} />)}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{searchQuery ? 'Search Results' : t.recentJobs}</h2>
                 {(searchQuery || aiResponse) && <button onClick={() => {setAiResponse(null); setSearchQuery(''); loadDefaultJobs();}} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Reset</button>}
              </div>

              {isLoading ? (
                <div className="space-y-6 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700"></div>)}
                </div>
              ) : (
                <div className="space-y-6">
                  {aiResponse?.jobs.length ? 
                    aiResponse.jobs.map(j => <JobCard key={j.id} job={j} lang={lang} t={t} />) : 
                    (!isLoading && <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500">{t.noJobs}</div>)
                  }
                </div>
              )}
            </div>
            <div className="space-y-8">
              {aiResponse?.summary && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border-l-4 border-blue-600 shadow-lg animate-in slide-in-from-right transition-colors">
                  <h3 className="flex items-center gap-2 mb-4 text-blue-700 dark:text-blue-400 font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> 
                    {t.aiAssistant}
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{aiResponse.summary}</p>
                </div>
              )}
              <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-8 text-white transition-colors">
                <h3 className="text-xl font-bold mb-4">Newsletter</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mb-6">Get weekly job alerts directly in your mail.</p>
                <button onClick={() => alert("Alert Saved!")} className="w-full bg-blue-600 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95">
                  {t.setAlert}
                </button>
              </div>
            </div>
          </main>
        </>
      )}

      {activeTab === 'post' && <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full animate-in slide-in-from-bottom duration-500"><PostJobForm t={t} onPost={handlePostJob} /></main>}
      {activeTab === 'studio' && <main className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full animate-in zoom-in duration-500"><PhotoStudio t={t} /></main>}

      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-12 px-6 mt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-slate-500 dark:text-slate-400 text-sm">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-lg shadow-sm">Y</div>
            {t.title}
          </div>
          <p>© 2025 YoursJob - Building Karnataka's Future.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
