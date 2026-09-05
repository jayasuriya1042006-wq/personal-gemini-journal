import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Conversation } from '../types';
import { sendReflectiveChatMessage } from '../services/api';
import { saveConversation, getUserConversations } from '../services/journalService';
import { 
  MessageSquareHeart, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  User as UserIcon, 
  Bot, 
  RefreshCw, 
  BookOpen, 
  AlertCircle,
  Plus
} from 'lucide-react';

interface ReflectiveChatProps {
  userId: string;
  onConvertToJournal: (title: string, content: string) => void;
}

export const ReflectiveChat: React.FC<ReflectiveChatProps> = ({
  userId,
  onConvertToJournal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: "Welcome to your private reflective sanctuary. I am here to listen with non-judgmental presence and offer Socratic questions to help you explore your thoughts. What is on your mind today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const userMessageContent = inputText.trim();
    const newUserMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userMessageContent,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsSending(true);
    setError(null);

    try {
      const history = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const res = await sendReflectiveChatMessage({
        message: userMessageContent,
        history
      });

      if (res.reply) {
        const assistantMessage: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: res.timestamp || new Date().toISOString()
        };

        const updated = [...messages, newUserMessage, assistantMessage];
        setMessages(updated);

        // Persist conversation to isolated Firestore path
        await saveConversation(userId, {
          id: 'active_session',
          userId,
          title: 'Reflective Exploration',
          messages: updated,
          createdAt: messages[0].timestamp,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message to reflective companion.');
    } finally {
      setIsSending(false);
    }
  };

  const handleCreateJournalFromChat = () => {
    const summaryTitle = "Reflections from Conversation";
    const dialogueBody = messages
      .map(m => `${m.role === 'user' ? 'Me' : 'Companion'}: ${m.content}`)
      .join('\n\n');
    onConvertToJournal(summaryTitle, dialogueBody);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: "I have reset our conversation space. Whenever you are ready, share what you are experiencing.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Top Header */}
      <div className="pb-4 border-b border-stone-200 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-800 text-amber-50 flex items-center justify-center">
            <MessageSquareHeart className="w-4 h-4 text-amber-200" />
          </div>
          <div>
            <h2 className="text-base font-bold text-stone-900 font-serif-journal">
              Socratic Journaling Companion
            </h2>
            <p className="text-[11px] text-stone-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Private conversation • Sandboxed server proxy
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {messages.length > 2 && (
            <button
              onClick={handleCreateJournalFromChat}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs font-medium hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Save as Journal</span>
            </button>
          )}

          <button
            onClick={handleResetChat}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-medium ${
                  isUser
                    ? 'bg-stone-800 text-stone-50'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-amber-900 text-amber-50 rounded-tr-xs font-sans-ui shadow-2xs'
                    : 'bg-white text-stone-800 rounded-tl-xs border border-stone-200 font-serif-journal shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`mt-1.5 text-[10px] font-mono ${
                    isUser ? 'text-amber-200/70 text-right' : 'text-stone-400'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white p-4 rounded-2xl rounded-tl-xs border border-stone-200 shadow-2xs flex items-center space-x-2 text-xs text-stone-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-800" />
              <span>Contemplating your reflection...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="mb-2 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="pt-3 border-t border-stone-200 shrink-0">
        <div className="relative flex items-center">
          <input
            id="reflective-chat-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Share a feeling, a thought, or a dilemma you wish to unpack..."
            disabled={isSending}
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-800 focus:border-amber-800 shadow-xs"
          />
          <button
            type="submit"
            id="reflective-chat-send-btn"
            disabled={!inputText.trim() || isSending}
            className="absolute right-2 p-2 rounded-lg bg-amber-900 text-amber-50 hover:bg-amber-950 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-400">
          <span>Encapsulated with boundary delimiters</span>
          <span>Press Enter to send</span>
        </div>
      </form>

    </div>
  );
};
