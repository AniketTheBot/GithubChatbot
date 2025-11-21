import { useState, useEffect } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import { ArrowRight, Github, Sparkles, Loader2 } from "lucide-react"; // Added Loader2

interface LandingPageProps {
  value: string;
  onChange: (value: string) => void;
  onStart: (repoUrl: string) => void;
  loading: boolean; // <--- NEW PROP
}

export default function LandingPage({ value, onChange, onStart, loading }: LandingPageProps) {
  const [isHovered, setIsHovered] = useState(false);

  // --- FIREFLY MOUSE EFFECT ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 150 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 150); 
      mouseY.set(e.clientY - 150);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // --- TYPEWRITER EFFECT ---
  const text = "Talk to your Codebase.";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 100); 
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !loading) onStart(value); // Prevent double click
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-sans text-white">
      
      {/* 1. BACKGROUND IMAGE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transform scale-105"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      {/* 2. FIREFLY */}
      <motion.div
        className="pointer-events-none absolute z-10 h-[300px] w-[300px] rounded-full opacity-60 blur-[80px]"
        style={{
          x: springX,
          y: springY,
          background: "radial-gradient(circle, rgba(100,255,218,0.3) 0%, rgba(0,0,0,0) 70%)",
          mixBlendMode: "screen" 
        }}
      />

      {/* 3. MAIN CONTENT */}
      <div className="relative z-20 flex h-full flex-col items-center justify-center px-4">
        
        <div className="mb-12 h-20 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block ml-1 w-1 h-12 align-middle bg-emerald-400"
            />
            </h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.5, duration: 1 }}
                className="mt-4 text-lg text-gray-400"
            >
                Stop searching. Start asking.
            </motion.p>
        </div>

        {/* INPUT BAR */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="relative w-full max-w-3xl group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-20 blur transition duration-500 ${isHovered ? 'opacity-50' : 'opacity-20'}`}></div>
            
            <div className="relative flex items-center rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl p-2 shadow-2xl transition-all duration-300 focus-within:border-emerald-500/50 focus-within:bg-black/60">
                <div className="pl-4 pr-2">
                    <Github className="w-6 h-6 text-gray-400 group-focus-within:text-emerald-400 transition-colors" />
                </div>
                
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Paste GitHub Repository URL..."
                    disabled={loading} // Lock input while checking
                    className="flex-1 bg-transparent px-4 py-6 text-xl md:text-2xl text-white placeholder-gray-500 focus:outline-none font-light tracking-wide disabled:opacity-50"
                    autoFocus
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="mr-2 rounded-xl bg-white/10 p-4 text-white hover:bg-emerald-500 hover:text-black transition-all duration-300 ease-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowRight className="w-6 h-6" />}
                </button>
            </div>
        </motion.form>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            className="absolute bottom-8 flex gap-4 text-xs text-gray-500"
        >
            <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                <span>Powered by RAG</span>
            </div>
            <div className="w-px h-4 bg-gray-800"></div>
            <div>GPT-4o Mini</div>
        </motion.div>

      </div>
    </div>
  );
}