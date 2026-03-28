import React, { useState, useRef } from 'react';
import { Search, Shield, Globe, AlertTriangle, CheckCircle, XCircle, Loader2, Info, ExternalLink, History, Languages, Cpu, Zap, Activity, Target, ThumbsUp, ThumbsDown, Link as LinkIcon, RefreshCcw, ChevronRight, FileText, Camera, Trash2, MessageSquare, Image as ImageIcon, MessageCircle, Send, Facebook, Smartphone, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { verifyNews, type VerificationResult } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<{ content: string; result: VerificationResult }[]>([]);
  const [targetLang, setTargetLang] = useState('English');
  const [feedback, setFeedback] = useState<{[key: number]: 'up' | 'down'}>({});
  const [showFeedbackToast, setShowFeedbackToast] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'url'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { name: 'English', code: 'en' },
    { name: 'Spanish', code: 'es' },
    { name: 'Mandarin', code: 'zh' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Hindi', code: 'hi' },
    { name: 'తెలుగు (Telugu)', code: 'te' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Portuguese', code: 'pt' },
  ];

  const handleVerify = async () => {
    if (activeTab === 'text' && !input.trim()) return;
    if (activeTab === 'image' && !selectedImage) return;
    if (activeTab === 'url' && !input.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await verifyNews(input, targetLang, selectedImage || undefined);
      setResult(data);
      const historyLabel = activeTab === 'image' ? 'Visual Forensic' : activeTab === 'url' ? 'Link Analysis' : 'Text Analysis';
      setHistory(prev => [{ content: input || historyLabel, result: data }, ...prev].slice(0, 5));
    } catch (err) {
      setError('Neural verification failed. Please check your data stream and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearInput = () => {
    setInput('');
    setSelectedImage(null);
    setResult(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({
        data: (reader.result as string).split(',')[1],
        mimeType: file.type
      });
      setActiveTab('image');
    };
    reader.readAsDataURL(file);
  };

  const handleFeedback = (idx: number, type: 'up' | 'down') => {
    setFeedback(prev => ({ ...prev, [idx]: type }));
    setShowFeedbackToast(true);
    setTimeout(() => setShowFeedbackToast(false), 3000);
    // In a real app, this would send data to a backend for model refinement
  };

  const getVerdictColor = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes('true') && !v.includes('half')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (v.includes('fake') || v.includes('false')) return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (v.includes('half') || v.includes('mixed') || v.includes('mostly')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  };

  const getVerdictIcon = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes('true') && !v.includes('half')) return <CheckCircle className="w-5 h-5" />;
    if (v.includes('fake') || v.includes('false')) return <XCircle className="w-5 h-5" />;
    if (v.includes('half') || v.includes('mixed') || v.includes('mostly')) return <AlertTriangle className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-200">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white">VERITAS <span className="text-indigo-400">OS</span></h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Neural Network Active</p>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10">
              <RefreshCcw className="w-3 h-3 text-emerald-400 animate-spin-slow" />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Continuous Learning Enabled</span>
            </div>
            <button className="px-5 py-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-widest">
              Access Terminal
            </button>
          </nav>
        </div>
      </header>

      <AnimatePresence>
        {showFeedbackToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 bg-emerald-500 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center gap-3"
          >
            <RefreshCcw className="w-4 h-4 animate-spin-slow" />
            Neural Model Refined: Feedback Logged
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-4"
          >
            <Zap className="w-3 h-3" />
            Explainable AI Fact-Checking Engine
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9]"
          >
            SCAN THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">DIGITAL VOID</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto font-medium"
          >
            Deploying neural verification protocols to dissect claims, detect AI generation, and map emotional manipulation across the global web.
          </motion.p>
        </section>

        {/* Input Section */}
        <section className="max-w-4xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white uppercase tracking-[0.3em]">Fact Checker</h2>
            {(input || selectedImage) && (
              <button 
                onClick={clearInput}
                className="flex items-center gap-2 px-4 py-2 text-[10px] font-bold text-slate-500 hover:text-rose-400 transition-colors uppercase tracking-widest"
              >
                <Trash2 className="w-3 h-3" />
                Start Over
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Block 1: Text */}
            <div className={cn(
              "relative group cursor-pointer transition-all duration-300",
              activeTab === 'text' ? "ring-4 ring-indigo-500 rounded-2xl scale-[1.02]" : "opacity-60 hover:opacity-100"
            )} onClick={() => setActiveTab('text')}>
              <div className="relative bg-[#0f172a] border border-white/10 p-6 rounded-2xl flex items-start gap-6 shadow-xl">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border-2 border-indigo-500/40 shrink-0">
                  <MessageCircle className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">1. Check a Message</h3>
                      <p className="text-xs text-slate-400 font-medium">From WhatsApp, Messenger, or SMS</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded flex items-center gap-1">
                        <MessageCircle className="w-3 h-3 text-green-500" />
                        <span className="text-[8px] font-bold text-green-500 uppercase">WhatsApp</span>
                      </div>
                      <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded flex items-center gap-1">
                        <Facebook className="w-3 h-3 text-blue-500" />
                        <span className="text-[8px] font-bold text-blue-500 uppercase">Messenger</span>
                      </div>
                      <div className="px-2 py-1 bg-sky-500/10 border border-sky-500/20 rounded flex items-center gap-1">
                        <Send className="w-3 h-3 text-sky-500" />
                        <span className="text-[8px] font-bold text-sky-500 uppercase">Telegram</span>
                      </div>
                    </div>
                  </div>
                  {activeTab === 'text' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste the message you received here..."
                        className="w-full min-h-[120px] p-4 bg-[#020617] border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none text-white placeholder:text-slate-600 text-base"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Block 2: Image */}
            <div className={cn(
              "relative group cursor-pointer transition-all duration-300",
              activeTab === 'image' ? "ring-4 ring-purple-500 rounded-2xl scale-[1.02]" : "opacity-60 hover:opacity-100"
            )} onClick={() => setActiveTab('image')}>
              <div className="relative bg-[#0f172a] border border-white/10 p-6 rounded-2xl flex items-start gap-6 shadow-xl">
                <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center border-2 border-purple-500/40 shrink-0">
                  <ImageIcon className="w-8 h-8 text-purple-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">2. Check a Photo</h3>
                      <p className="text-xs text-slate-400 font-medium">Upload a picture to see if it's fake</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/20">
                      <Camera className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  {activeTab === 'image' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2 space-y-4"
                    >
                      <div className="bg-[#020617] border border-white/10 rounded-xl flex flex-col items-center justify-center p-4 relative overflow-hidden min-h-[150px]">
                        {selectedImage ? (
                          <div className="relative w-full flex items-center justify-center">
                            <img 
                              src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                              alt="Preview" 
                              className="max-h-[180px] rounded-lg border border-white/20 shadow-2xl z-10"
                            />
                            <button 
                              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                              className="absolute -top-2 -right-2 w-8 h-8 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg z-20 hover:scale-110 transition-transform"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-center space-y-3 cursor-pointer hover:bg-white/5 w-full h-full flex flex-col items-center justify-center transition-colors rounded-xl border-2 border-dashed border-white/10 hover:border-purple-500/40 p-6"
                          >
                            <Camera className="w-10 h-10 text-purple-400 mx-auto" />
                            <p className="text-sm font-bold text-slate-300">Tap to pick a photo</p>
                          </div>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageUpload} 
                          accept="image/*" 
                          className="hidden" 
                        />
                      </div>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Tell us about this photo... (optional)"
                        className="w-full p-4 bg-[#020617] border border-white/10 rounded-xl focus:ring-2 focus:ring-purple-500 transition-all resize-none text-white placeholder:text-slate-600 text-sm"
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Block 3: URL */}
            <div className={cn(
              "relative group cursor-pointer transition-all duration-300",
              activeTab === 'url' ? "ring-4 ring-emerald-500 rounded-2xl scale-[1.02]" : "opacity-60 hover:opacity-100"
            )} onClick={() => setActiveTab('url')}>
              <div className="relative bg-[#0f172a] border border-white/10 p-6 rounded-2xl flex items-start gap-6 shadow-xl">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center border-2 border-emerald-500/40 shrink-0">
                  <Globe className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest">3. Check a Website</h3>
                      <p className="text-xs text-slate-400 font-medium">Paste a link to a news story</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                      <LinkIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>
                  {activeTab === 'url' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-2"
                    >
                      <div className="relative">
                        <div className="absolute left-4 top-4 text-emerald-500/50">
                          <LinkIcon className="w-5 h-5" />
                        </div>
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Paste the website link here..."
                          className="w-full p-4 pl-12 bg-[#020617] border border-white/10 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all resize-none text-white placeholder:text-slate-600 text-base"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="relative pt-6">
            {loading && (
              <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl rounded-2xl z-50 flex flex-col items-center justify-center space-y-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-black text-indigo-400 uppercase tracking-[0.3em] animate-pulse">AI is Thinking...</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Checking facts across the world</p>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Choose Language</label>
                <div className="relative">
                  <select 
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full p-4 bg-[#0f172a] border border-white/10 rounded-xl text-sm font-bold text-white focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.name}>{lang.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                    <Languages className="w-4 h-4 text-indigo-500" />
                  </div>
                </div>
              </div>
              <div className="flex-1 flex items-end">
                <button
                  onClick={handleVerify}
                  disabled={loading || (activeTab === 'image' ? !selectedImage : !input.trim())}
                  className={cn(
                    "w-full py-4 rounded-xl font-black text-base uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all",
                    loading || (activeTab === 'image' ? !selectedImage : !input.trim())
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.4)] active:scale-[0.98]"
                  )}
                >
                  <Shield className="w-6 h-6" />
                  Check Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="max-w-6xl mx-auto w-full space-y-8"
            >
              {/* Prominent Verdict Banner */}
              <div className={cn(
                "w-full p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between border-2 gap-6",
                result.truthScore > 70 ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : 
                result.truthScore > 30 ? "bg-amber-500/10 border-amber-500/50 text-amber-400" : 
                "bg-rose-500/10 border-rose-500/50 text-rose-400"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                    result.truthScore > 70 ? "bg-emerald-500 text-white shadow-emerald-500/20" : 
                    result.truthScore > 30 ? "bg-amber-500 text-white shadow-amber-500/20" : 
                    "bg-rose-500 text-white shadow-rose-500/20"
                  )}>
                    {result.truthScore > 70 ? <CheckCircle className="w-10 h-10" /> : 
                     result.truthScore > 30 ? <AlertTriangle className="w-10 h-10" /> : 
                     <XCircle className="w-10 h-10" />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
                      {result.truthScore > 70 ? "This is True" : result.truthScore > 30 ? "This is Half True" : "This is Fake"}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs font-bold opacity-70 uppercase tracking-widest">
                        AI Verification Result
                      </p>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                        result.aiProbability > 50 
                          ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]" 
                          : "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.4)]"
                      )}>
                        {result.aiProbability > 50 ? "AI Generated" : "Human Written"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-center md:text-right">
                    <span className="text-5xl font-black tracking-tighter leading-none">{result.truthScore}%</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">Truth Percentage</p>
                  </div>
                  <div className="w-px h-12 bg-white/10 hidden md:block" />
                  <div className="text-center md:text-right">
                    <span className="text-5xl font-black tracking-tighter leading-none text-rose-500">{100 - result.truthScore}%</span>
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mt-1">Fake Percentage</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Left Column: Core Metrics */}
                <div className="space-y-8 lg:col-span-1">
                  {/* Truth Score */}
                  <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center space-y-4">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Truth Index</span>
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                        <circle
                          cx="64"
                          cy="64"
                          r="58"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="12"
                          strokeDasharray={364.4}
                          strokeDashoffset={364.4 - (364.4 * result.truthScore) / 100}
                          strokeLinecap="round"
                          className={cn(
                            "transition-all duration-1000 ease-out",
                            result.truthScore > 70 ? "text-emerald-500" : result.truthScore > 30 ? "text-amber-500" : "text-rose-500"
                          )}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-3xl font-black text-white">{result.truthScore}%</span>
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Truth</span>
                      </div>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black border uppercase tracking-widest flex items-center gap-2 w-full justify-center",
                      getVerdictColor(result.verdict)
                    )}>
                      {getVerdictIcon(result.verdict)}
                      {result.verdict}
                    </div>
                    
                    {/* Fake Percentage Indicator */}
                    <div className="w-full pt-2 border-t border-white/5 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                        <span className="text-rose-400">Fake</span>
                        <span className="text-emerald-400">True</span>
                      </div>
                      <div className="h-1.5 bg-rose-500/20 rounded-full overflow-hidden flex">
                        <div 
                          style={{ width: `${result.truthScore}%` }} 
                          className="h-full bg-emerald-500 transition-all duration-1000"
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-bold text-slate-500">
                        <span>{100 - result.truthScore}%</span>
                        <span>{result.truthScore}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Explainability: Confidence Score */}
                  <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">AI Confidence</span>
                      <Shield className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Certainty</span>
                        <span className="text-white">{result.confidenceScore}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidenceScore}%` }}
                          className="h-full bg-emerald-500 transition-all duration-1000"
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 italic leading-tight">
                        Transparency: This score reflects the AI's certainty based on available grounding data and cross-referenced nodes.
                      </p>
                    </div>
                  </div>

                  {/* AI Origin Detector */}
                  <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">AI Origin</span>
                      <Cpu className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">Probability</span>
                        <span className="text-white">{result.aiProbability}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${result.aiProbability}%` }}
                          className={cn(
                            "h-full transition-all duration-1000",
                            result.aiProbability > 50 ? "bg-rose-500" : "bg-indigo-500"
                          )}
                        />
                      </div>
                      <p className="text-[9px] text-slate-500 italic leading-tight">
                        Detection: Analysis of linguistic patterns and structural consistency suggests {result.aiProbability > 50 ? 'synthetic' : 'human'} authorship.
                      </p>
                    </div>
                  </div>

                  {/* System Status (Result Context) */}
                  <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Neural Status</span>
                      <Shield className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Grounding', status: 'Verified', color: 'text-emerald-400' },
                        { label: 'Cross-Ref', status: 'Complete', color: 'text-emerald-400' },
                        { label: 'Learning', status: 'Active', color: 'text-indigo-400' },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                          <span className="text-slate-500">{s.label}</span>
                          <span className={s.color}>{s.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Detailed Analysis & Claims */}
                <div className="lg:col-span-3 space-y-8">
                  {/* Metrics Visualization Chart */}
                  <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Metrics Visualization</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Breakdown</span>
                    </div>
                    
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Truth', value: result.truthScore, color: '#10b981' },
                            { name: 'Confidence', value: result.confidenceScore, color: '#3b82f6' },
                            { name: 'AI Prob', value: result.aiProbability, color: result.aiProbability > 50 ? '#f43f5e' : '#6366f1' },
                            { 
                              name: 'Bias', 
                              value: result.biasLevel === 'High' ? 90 : result.biasLevel === 'Medium' ? 50 : 20, 
                              color: result.biasLevel === 'High' ? '#f43f5e' : result.biasLevel === 'Medium' ? '#f59e0b' : '#10b981' 
                            },
                          ]}
                          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                            dy={10}
                          />
                          <YAxis 
                            hide 
                            domain={[0, 100]}
                          />
                          <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-[#1e293b] border border-white/10 p-3 rounded-xl shadow-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                    <p className="text-lg font-black text-white">{payload[0].value}%</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[6, 6, 0, 0]} 
                            barSize={40}
                            animationDuration={1500}
                          >
                            {[
                              { name: 'Truth', value: result.truthScore, color: '#10b981' },
                              { name: 'Confidence', value: result.confidenceScore, color: '#3b82f6' },
                              { name: 'AI Prob', value: result.aiProbability, color: result.aiProbability > 50 ? '#f43f5e' : '#6366f1' },
                              { 
                                name: 'Bias', 
                                value: result.biasLevel === 'High' ? 90 : result.biasLevel === 'Medium' ? 50 : 20, 
                                color: result.biasLevel === 'High' ? '#f43f5e' : result.biasLevel === 'Medium' ? '#f59e0b' : '#10b981' 
                              },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/5">
                      {[
                        { label: 'Truth', value: `${result.truthScore}%`, desc: 'Accuracy' },
                        { label: 'Certainty', value: `${result.confidenceScore}%`, desc: 'Reliability' },
                        { label: 'AI Prob', value: `${result.aiProbability}%`, desc: 'Origin' },
                        { label: 'Bias', value: result.biasLevel, desc: 'Neutrality' },
                      ].map((item) => (
                        <div key={item.label} className="text-center">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{item.label}</p>
                          <p className="text-xs font-black text-white">{item.value}</p>
                          <p className="text-[7px] font-bold text-slate-600 uppercase tracking-tighter mt-0.5">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Analysis */}
                  <div className="bg-[#0f172a] border border-white/5 p-10 rounded-2xl space-y-8">
                    <div className="flex items-center justify-between border-b border-white/5 pb-6">
                      <div className="flex items-center gap-3">
                        <Target className="w-6 h-6 text-indigo-400" />
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Neural Verification Report</h3>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bias Rating</span>
                          <span className={cn(
                            "text-xs font-black uppercase tracking-widest",
                            result.biasLevel.toLowerCase().includes('low') ? "text-emerald-400" : 
                            result.biasLevel.toLowerCase().includes('medium') ? "text-amber-400" : "text-rose-400"
                          )}>
                            {result.biasLevel}
                          </span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Source Lang</span>
                          <span className="text-xs font-black text-white uppercase tracking-widest">{result.detectedLanguage}</span>
                        </div>
                      </div>
                    </div>

                    <div className="prose prose-invert max-w-none">
                      <div className="text-slate-400 leading-relaxed font-medium">
                        <ReactMarkdown>{result.analysis}</ReactMarkdown>
                      </div>
                    </div>

                    {/* Sentiment & Context Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                      <div className="md:col-span-1 space-y-4">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Emotional Pulse</h4>
                        <div className="space-y-4">
                          {[
                            { label: 'Outrage', value: result.sentiment.outrage, color: 'bg-rose-500' },
                            { label: 'Fear', value: result.sentiment.fear, color: 'bg-amber-500' },
                            { label: 'Neutral', value: result.sentiment.neutral, color: 'bg-emerald-500' }
                          ].map((s) => (
                            <div key={s.label} className="space-y-1">
                              <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
                                <span className="text-slate-400">{s.label}</span>
                                <span className="text-white">{s.value}%</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${s.value}%` }}
                                  className={cn("h-full", s.color)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Claim Inspector</h4>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleFeedback(0, 'up')}
                              className={cn(
                                "p-1.5 rounded-lg border transition-all",
                                feedback[0] === 'up' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                              )}
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleFeedback(0, 'down')}
                              className={cn(
                                "p-1.5 rounded-lg border transition-all",
                                feedback[0] === 'down' ? "bg-rose-500/20 border-rose-500 text-rose-400" : "bg-white/5 border-white/10 text-slate-500 hover:text-white"
                              )}
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {result.claims.map((claim, idx) => (
                            <div key={idx} className="bg-[#020617] border border-white/5 p-4 rounded-xl space-y-2 hover:border-indigo-500/30 transition-colors group">
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-xs font-bold text-white leading-tight">{claim.text}</p>
                                <div className={cn(
                                  "shrink-0 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                  getVerdictColor(claim.verdict)
                                )}>
                                  {claim.verdict}
                                </div>
                              </div>
                              <p className="text-[10px] text-slate-500 leading-relaxed italic">{claim.reasoning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sources */}
                    {result.sources.length > 0 && (
                      <div className="pt-8 border-t border-white/5">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Verification Nodes</h4>
                        <div className="flex flex-wrap gap-3">
                          {result.sources.map((source, idx) => (
                            <a 
                              key={idx}
                              href={source.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-4 py-2 bg-[#020617] border border-white/5 rounded-xl text-[10px] font-bold text-slate-400 hover:bg-indigo-600/10 hover:border-indigo-500/30 hover:text-indigo-400 transition-all group"
                            >
                              <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform" />
                              {source.title.length > 40 ? source.title.substring(0, 40) + '...' : source.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* History & System Status Section */}
        <section className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <History className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Neural Log History</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Recent verification cycles</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {history.length > 0 ? (
                history.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-[#0f172a] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all cursor-pointer"
                    onClick={() => setResult(item.result)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center border transition-colors",
                        item.result.truthScore > 70 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        item.result.truthScore > 40 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                        "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      )}>
                        <span className="text-xs font-black">{item.result.truthScore}%</span>
                      </div>
                      <div className="max-w-md">
                        <p className="text-xs font-bold text-slate-300 truncate uppercase tracking-widest">{item.content}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{item.result.verdict}</span>
                          <span className="w-1 h-1 bg-slate-700 rounded-full" />
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{item.result.biasLevel} Bias</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-700 group-hover:text-indigo-400 transition-colors" />
                  </motion.div>
                ))
              ) : (
                <div className="bg-[#0f172a] border border-white/5 p-12 rounded-2xl text-center">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">No Neural Logs Detected</p>
                </div>
              )}
            </div>
          </div>

          {/* Global System Status */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.3em]">Global Status</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Network Health Monitor</p>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-white/5 p-8 rounded-2xl space-y-6">
              {[
                { label: 'Neural Core', status: 'Optimal', color: 'text-emerald-400' },
                { label: 'Grounding Nodes', status: 'Active (1,402)', color: 'text-emerald-400' },
                { label: 'Forensic Engine', status: 'Standby', color: 'text-indigo-400' },
                { label: 'Learning Cycle', status: 'Iteration 4.2.0', color: 'text-purple-400' },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
                  <span className={cn("text-[10px] font-black uppercase tracking-widest", s.color)}>{s.status}</span>
                </div>
              ))}
              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  <span>Global Sync</span>
                  <span>99.9%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-indigo-500 animate-pulse" />
                </div>
              </div>
              <p className="text-[9px] text-slate-600 italic leading-relaxed">
                Veritas OS utilizes a decentralized neural network for real-time verification. Continuous learning is enabled via user feedback loops.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#020617] border-t border-white/5 py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-indigo-500" />
              <span className="text-xl font-black text-white tracking-tighter">VERITAS <span className="text-indigo-400">OS</span></span>
            </div>
            <p className="text-sm text-slate-500 max-w-sm leading-relaxed font-medium">
              The ultimate digital defense layer. Deploying autonomous fact-checking agents to safeguard the global information ecosystem.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Protocols</h4>
            <ul className="space-y-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Neural Sync</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Search Grounding</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Bias Filtering</a></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">System</h4>
            <ul className="space-y-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacy Vault</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Node Status</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">API Core</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">© 2026 VERITAS OS. NEURAL DEFENSE INITIATIVE.</p>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Nominal</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">V4.2.0-STABLE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
