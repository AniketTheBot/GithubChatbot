import { useState, useRef, useEffect } from "react";
import { Send, Bot, FileCode, Sparkles, Plus, Coffee } from "lucide-react"; // Added Coffee icon
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";

// Types
type Message = {
  role: string;
  content: string;
  sources?: { file_path: string }[];
};

interface ChatBotProps {
  repoName: string | null;
  fileCount: number;
  messages: Message[];
  isTyping: boolean;
  onSend: (msg: string) => void;
  onNew: () => void;
}

export default function ChatBot({ repoName, fileCount, messages, isTyping, onSend, onNew }: ChatBotProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend(input);
        setInput("");
      }
    }
  };

  // --- STRIPE / DONATION LOGIC ---
  const handleDonate = () => {
    window.open("https://www.youtube.com/watch?v=xC_bXY36jaQ", "_blank"); 
  };

  return (
    <div className="relative h-screen w-screen flex flex-col bg-[#0a0a0a] text-white overflow-hidden">
      
      {/* 1. HEADER (Floating Glass) */}
      <motion.div 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
      >
        {/* Repo Info */}
        <div className="flex items-center gap-4 pointer-events-auto">
           <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
              <FileCode className="w-5 h-5 text-emerald-400" />
           </div>
           <div>
              <h2 className="text-lg font-semibold tracking-wide">{repoName?.replace("https://github.com/", "")}</h2>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> 
                {fileCount > 0 ? `${fileCount} files processed` : "Ready"}
              </p>
           </div>
        </div>

        {/* Right Side Buttons */}
        <div className="pointer-events-auto flex items-center gap-3">
            
            {/* DONATE BUTTON */}
            <button 
                onClick={handleDonate}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all duration-300 group"
            >
                <Coffee className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-amber-200 group-hover:text-amber-100">Buy me a Coffee</span>
            </button>

            {/* NEW REPO BUTTON */}
            <button 
                onClick={onNew}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/50 transition-all duration-300 group"
            >
                <Plus className="w-4 h-4 text-gray-400 group-hover:text-emerald-400" />
                <span className="text-sm font-medium text-gray-300 group-hover:text-white">New</span>
            </button>
        </div>
      </motion.div>

      {/* 2. CHAT AREA */}
      <div className="flex-1 overflow-y-auto px-4 pt-28 pb-40 scroll-smooth" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={idx} 
              className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI Avatar */}
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[80%] space-y-2 ${msg.role === 'user' ? 'order-1' : 'order-2'}`}>
                <div className={`p-6 rounded-2xl border backdrop-blur-sm ${
                  msg.role === 'user' 
                    ? 'bg-white/10 border-white/10 text-white rounded-tr-none' 
                    : 'bg-[#111] border-white/5 text-gray-200 rounded-tl-none shadow-xl'
                }`}>
                   {msg.role === 'user' ? (
                     <p className="text-lg">{msg.content}</p>
                   ) : (
                     <div className="prose prose-invert prose-p:leading-relaxed prose-pre:p-0 max-w-none">
                        <ReactMarkdown components={{
                            code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline && match ? (
                                    <div className="rounded-md overflow-hidden my-4 border border-white/10 shadow-2xl">
                                        <div className="bg-black/50 px-4 py-1 text-xs text-gray-500 border-b border-white/10 flex justify-between">
                                            <span>{match[1]}</span>
                                        </div>
                                        <SyntaxHighlighter {...props} style={dracula} language={match[1]} PreTag="div" customStyle={{margin: 0, background: '#000'}}>
                                            {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : (
                                    <code {...props} className="bg-white/10 text-emerald-300 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                                )
                            }
                        }}>
                            {msg.content}
                        </ReactMarkdown>

                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2">
                                {[...new Set(msg.sources.map(s => s.file_path))].map((path, i) => (
                                    <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/40 border border-white/5 text-xs text-gray-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors cursor-default">
                                        <FileCode className="w-3 h-3" />
                                        {path}
                                    </span>
                                ))}
                            </div>
                        )}
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex gap-6">
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-cyan-600 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-none bg-[#111] border border-white/5 flex items-center gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. INPUT AREA (Cleaned Up) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
        <div className="max-w-3xl mx-auto">
          <div className="relative group">
             <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
             
             <div className="relative flex flex-col bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your code..."
                    className="w-full bg-transparent text-white placeholder-gray-500 p-3 pl-4 text-lg outline-none resize-none h-14 max-h-32"
                />

                {/* Clean Toolbar */}
                <div className="flex items-center justify-end px-2 pb-1">
                    <button 
                        onClick={() => { if(input.trim()) { onSend(input); setInput(""); } }}
                        className={`p-2 rounded-xl transition-all duration-300 ${
                            input.trim() 
                            ? 'bg-emerald-500 text-black hover:scale-105 shadow-lg shadow-emerald-500/20' 
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
             </div>
          </div>
          <p className="text-center text-xs text-gray-600 mt-4">
            AI can make mistakes. Check specific files for accuracy.
          </p>
        </div>
      </div>

    </div>
  );
}