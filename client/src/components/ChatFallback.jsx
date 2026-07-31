import React, { useState, useEffect } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { translations } from '../services/translations';

export default function ChatFallback() {
  const [lang, setLang] = useState(window.__selectedLang || 'en');
  const t = translations[lang] || translations.en;

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: t.welcomeChat
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleLang = (e) => {
      const newLang = e.detail || 'en';
      setLang(newLang);
      // Translate the initial greeting dynamically
      setMessages([{
        sender: 'bot',
        text: translations[newLang]?.welcomeChat || translations.en.welcomeChat
      }]);
    };
    window.addEventListener('langChanged', handleLang);
    return () => window.removeEventListener('langChanged', handleLang);
  }, []);

  const quickPrompts = [
    "How much did I earn today?",
    "Which zone has highest rate?",
    "Should I take a break?"
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Backend chat call (will trigger LLM with the custom rules / details)
      const res = await api.sendChatMessage(query);
      
      // If lang is not English, translate the reply dynamically through our translation API
      let finalReply = res.answer;
      if (lang !== 'en') {
        finalReply = await api.translateText(res.answer, lang);
      }

      setMessages(prev => [...prev, { sender: 'bot', text: finalReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'GigPilot AI recommends staying near Koramangala corridor for orders with >35% profit margin.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-panel p-4 sm:p-5 flex flex-col h-[400px]">
      <div className="flex items-center gap-2.5 mb-3 pb-3 border-b border-[#272A31]">
        <div className="p-2 rounded bg-[#111318] border border-[#272A31] text-[#79DB8D]">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-heading font-semibold text-sm text-[#F4F4F5] flex items-center gap-2">
            {t.chatTitle}
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#111318] text-[#A1A1AA] border border-[#272A31]">
              ASSISTANT
            </span>
          </h4>
          <p className="text-xs text-[#A1A1AA]">{t.chatDesc}</p>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`p-1.5 rounded shrink-0 text-xs ${
              msg.sender === 'user' ? 'bg-[#15803D] text-[#F4F4F5] font-bold' : 'bg-[#111318] text-[#79DB8D] border border-[#272A31]'
            }`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div className={`max-w-[80%] rounded p-3 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-[#15803D]/10 border border-[#15803D]/30 text-[#F4F4F5]'
                : 'bg-[#111318] border border-[#272A31] text-[#E4E4E7]'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA] italic">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#79DB8D]" /> {t.thinking}
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="whitespace-nowrap px-2.5 py-1 rounded bg-[#111318] hover:bg-[#272A31] border border-[#272A31] text-[11px] text-[#A1A1AA] transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 pt-2 border-t border-[#272A31]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t.askQuestion}
          className="flex-1 bg-[#111318] border border-[#272A31] rounded px-3 py-2 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#15803D]"
        />
        <button
          type="submit"
          className="p-2 rounded bg-[#15803D] hover:bg-[#166534] text-[#F4F4F5] font-semibold transition-all active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
