import React, { useState } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function ChatFallback() {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello Rajesh! I am watching live order density & your GigDNA scores. Ask me anything about earnings, zones, or fatigue.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
      const res = await api.sendChatMessage(query);
      setMessages(prev => [...prev, { sender: 'bot', text: res.answer }]);
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
            Copilot Q&A Assistant
            <span className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#111318] text-[#A1A1AA] border border-[#272A31]">
              ASSISTANT
            </span>
          </h4>
          <p className="text-xs text-[#A1A1AA]">Ask natural language questions about your shift</p>
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
            <Sparkles className="w-3.5 h-3.5 animate-spin text-[#79DB8D]" /> Thinking...
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
          placeholder="Ask Copilot a question..."
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
