import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Sparkles, X, Eye, FileText, Image as ImageIcon, Calendar } from 'lucide-react';
import { getAssistantResponse } from '../utils/ai';

const AssistantTab = ({ 
  memories, 
  tasks, 
  conversations, 
  setConversations,
  openDetailModal 
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  const suggestions = [
    "Where is my invoice?",
    "Find React screenshots",
    "What tasks are pending?",
    "Summarize today's notes"
  ];

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversations, typing]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: text,
      time: "Just now"
    };

    const updatedConv = [...conversations, userMsg];
    setConversations(updatedConv);
    setInput('');
    setTyping(true);

    // 2. Simulate AI thinking delay
    setTimeout(() => {
      const response = getAssistantResponse(text, memories, tasks);
      const assistantMsg = {
        id: `msg-${Date.now()}-ai`,
        sender: "assistant",
        text: response.text,
        matchedMemories: response.matchedMemories || [],
        time: "Just now"
      };
      
      setConversations([...updatedConv, assistantMsg]);
      setTyping(false);
    }, 800);
  };

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const isSpeechSupported = !!SpeechRecognition;
  const recognitionRef = useRef(null);
  const [transcript, setTranscript] = useState('');

  // Simulate microphone voice capture or trigger browser Speech Recognition
  const startRecording = () => {
    setTranscript('Say something...');
    setIsRecording(true);

    if (isSpeechSupported) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          rec.finalText = text;
        };

        rec.onerror = (e) => {
          console.error("Speech Recognition Error", e);
          fallbackRecording();
        };

        rec.onend = () => {
          setIsRecording(false);
          if (rec.finalText) {
            handleSend(rec.finalText);
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error(err);
        fallbackRecording();
      }
    } else {
      fallbackRecording();
    }
  };

  const fallbackRecording = () => {
    setTranscript('Listening... (Speech API not supported in browser)');
    setTimeout(() => {
      setIsRecording(false);
      const spokenPhrases = [
        "Where is my invoice?",
        "Find React screenshots",
        "What tasks are pending?",
        "Summarize today's notes"
      ];
      const transcribedText = spokenPhrases[Math.floor(Math.random() * spokenPhrases.length)];
      handleSend(transcribedText);
    }, 3000);
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  const getMemoryIcon = (type) => {
    switch (type) {
      case 'note': return '📝';
      case 'screenshot': return '📷';
      case 'document': return '📁';
      case 'link': return '🔗';
      case 'voice': return '🎙️';
      case 'clipboard': return '📋';
      case 'calendar': return '📅';
      default: return '🧠';
    }
  };

  return (
    <div className="chat-container">
      {/* Messages Window */}
      <div className="chat-messages-pane" ref={scrollRef}>
        {conversations.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            <div 
              className={`chat-bubble ${
                msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'
              }`}
            >
              {msg.text}
            </div>

            {/* Render matched memory attachment cards inside Assistant responses */}
            {msg.sender === 'assistant' && msg.matchedMemories && msg.matchedMemories.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0 10px 0', alignSelf: 'flex-start', width: '90%' }}>
                {msg.matchedMemories.map(memId => {
                  const item = memories.find(m => m.id === memId);
                  if (!item) return null;
                  return (
                    <div 
                      key={item.id} 
                      className="task-list-card"
                      style={{ padding: '10px', marginTop: '4px' }}
                      onClick={() => openDetailModal(item)}
                    >
                      <div className="memory-type-badge" style={{ padding: '6px' }}>
                        {getMemoryIcon(item.type)}
                      </div>
                      <div style={{ flex: 1, marginLeft: '4px' }}>
                        <h5 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.title}</h5>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.summary}</p>
                      </div>
                      <button className="chat-action-btn" style={{ width: '28px', height: '28px', background: 'var(--accent)', color: 'var(--primary)' }}>
                        <Eye size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div className="chat-bubble chat-bubble-assistant" style={{ padding: '12px 20px', fontStyle: 'italic', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Sparkles size={14} className="pulse-danger" style={{ animation: 'float-pulse 1s infinite' }} /> Kario is searching memories...
          </div>
        )}
      </div>

      {/* Suggested Prompts (only visible when chat history is short or user hasn't typed) */}
      {conversations.length < 4 && !typing && (
        <div className="chat-suggestions-grid">
          {suggestions.map((sug) => (
            <button 
              key={sug} 
              className="suggestion-chip"
              onClick={() => handleSend(sug)}
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input panel */}
      <div className="chat-input-bar">
        <button 
          className={`chat-action-btn chat-mic-btn ${isRecording ? 'chat-mic-btn-active' : ''}`}
          onClick={startRecording}
          disabled={isRecording || typing}
          title="Voice Command Sync"
        >
          <Mic size={18} />
        </button>
        <input 
          type="text" 
          placeholder="Ask Kario anything..."
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
          disabled={isRecording || typing}
        />
        <button 
          className="chat-action-btn"
          onClick={() => handleSend(input)}
          disabled={!input.trim() || isRecording || typing}
        >
          <Send size={16} />
        </button>
      </div>

      {/* Recording Soundwave overlay */}
      {isRecording && (
        <div className="voice-wave-modal">
          <div className="voice-wave-container">
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
            <div className="voice-wave-bar"></div>
          </div>
          <p style={{ fontWeight: 600, fontSize: '15px', padding: '0 20px', textAlign: 'center', lineHeight: 1.4 }}>{transcript}</p>
          <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '8px' }}>Speak clearly. Kario Speech Recognition is active.</p>
          <button 
            onClick={stopRecording} 
            style={{ 
              marginTop: '30px', 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              padding: '8px 16px', 
              color: '#fff', 
              borderRadius: '20px',
              fontFamily: 'var(--font-family)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AssistantTab;
