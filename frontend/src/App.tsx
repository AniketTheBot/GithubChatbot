import { useState } from "react";
import { motion } from "framer-motion";
import LandingPage from "./LandingPage";
import ChatBot from "./ChatBot";

const API_URL = "http://127.0.0.1:8004";

export default function App() {
  const [viewIndex, setViewIndex] = useState(0);
  const [repoUrl, setRepoUrl] = useState("");
  const [fileCount, setFileCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);

  // Two loading states: one for ingestion (Landing) and one for chatting
  const [isIngesting, setIsIngesting] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // 1. Handle "Ingest" from Landing Page
  const handleStart = async (url: string) => {
    if (!url) return;

    // Start Loading on Landing Page (Don't scroll yet!)
    setIsIngesting(true);

    try {
      await fetch(`${API_URL}/delete`, { method: "DELETE" });

      const response = await fetch(`${API_URL}/ingest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        // ERROR HANDLING
        // We alert the user and STOP. We do NOT scroll down.
        alert(data.detail || "Invalid Repository URL");
        setIsIngesting(false); // Stop spinner
        return;
      }

      // SUCCESS HANDLING
      setFileCount(data.files_processed);
      setMessages([
        {
          role: "ai",
          content: `Success! I've processed **${data.files_processed} files** from the repository. \n\nAsk me about architecture, bugs, or specific functions.`,
        },
      ]);
      setRepoUrl(url);

      // NOW we scroll down because we know it worked
      setViewIndex(1);
      setIsIngesting(false);
    } catch (error) {
      console.error(error);
      alert("Failed to connect to server. Check if backend is running.");
      setIsIngesting(false);
    }
  };

  const handleNew = async () => {
    setViewIndex(0);
    setTimeout(async () => {
      setRepoUrl("");
      setFileCount(0);
      setMessages([]);
      try {
        await fetch(`${API_URL}/delete`, { method: "DELETE" });
      } catch (e) {}
    }, 800);
  };

  const handleSend = async (userMessage: string) => {
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          history: messages.slice(-10),
        }),
      });
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.answer,
          sources: data.sources,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Something went wrong." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white">
      <motion.div
        className="flex flex-col h-[200vh]"
        animate={{ y: viewIndex === 0 ? 0 : "-100vh" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* TOP: Landing Page */}
        <div className="h-screen w-full relative">
          <LandingPage
            onStart={handleStart}
            value={repoUrl}
            onChange={setRepoUrl}
            loading={isIngesting} // Pass the loading state
          />
        </div>

        {/* BOTTOM: Chat Page */}
        <div className="h-screen w-full relative">
          <ChatBot
            repoName={repoUrl}
            fileCount={fileCount}
            messages={messages}
            isTyping={isTyping}
            onSend={handleSend}
            onNew={handleNew}
          />
        </div>
      </motion.div>
    </div>
  );
}
