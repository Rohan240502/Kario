import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Sparkles, X, Eye, FileText, Image as ImageIcon, Calendar } from 'lucide-react';
import { getAssistantResponse, generateDailyPlan } from '../utils/ai';

const AssistantTab = ({ 
  memories, 
  tasks, 
  setMemories,
  setTasks,
  saveMemories,
  saveTasks,
  conversations,
  setConversations,
  openDetailModal 
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [typing, setTyping] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState([]);
  const scrollRef = useRef(null);

  const slashCommands = [
    { cmd: '/todo', desc: 'Create a new task directly', example: '/todo [Task title]' },
    { cmd: '/note', desc: 'Add a new memory note directly', example: '/note [Note content]' },
    { cmd: '/search', desc: 'Search all memories', example: '/search [Keyword]' },
    { cmd: '/plan', desc: 'Generate daily focus plan', example: '/plan' }
  ];

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

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInput(val);

    if (val.startsWith('/')) {
      const matchText = val.toLowerCase();
      const filtered = slashCommands.filter(c => c.cmd.startsWith(matchText));
      setFilteredCommands(filtered);
      setShowCommandMenu(filtered.length > 0);
    } else {
      setShowCommandMenu(false);
    }
  };

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
    setShowCommandMenu(false);

    // 2. Check for slash command
    if (text.trim().startsWith('/')) {
      setTyping(true);
      setTimeout(() => {
        const parts = text.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ').trim();

        let replyText = '';
        let matched = [];

        try {
          if (cmd === '/todo') {
            if (!arg) {
              throw new Error("Please specify a task title, e.g., `/todo Review MacBook invoice`.");
            }
            const newTask = {
              id: `task-${Date.now()}`,
              title: arg,
              description: "Quick task added via chat slash command.",
              priority: 'medium',
              dueDate: 'Today',
              completed: false,
              sourceType: 'Chat Command',
              subtasks: []
            };
            const updatedTasks = [newTask, ...tasks];
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
            replyText = `📝 **Task Created successfully!**\n\nI have added **"${arg}"** to your tasks list for Today.`;
          } else if (cmd === '/note') {
            if (!arg) {
              throw new Error("Please specify note details, e.g., `/note Call Rohan at 3 PM`.");
            }
            const newNote = {
              id: `mem-${Date.now()}`,
              type: 'note',
              title: 'Quick Chat Note',
              content: arg,
              summary: arg.slice(0, 50) + (arg.length > 50 ? '...' : ''),
              tags: ['chat-command', 'note'],
              date: 'Today, Just now',
              views: 1
            };
            const updatedMems = [newNote, ...memories];
            setMemories(updatedMems);
            saveMemories(updatedMems);
            replyText = `💾 **Memory Note Saved!**\n\nI've stored this in your memory database:\n\n_"${newNote.summary}"_`;
            matched = [newNote.id];
          } else if (cmd === '/search') {
            if (!arg) {
              throw new Error("Please specify a search keyword, e.g., `/search React`.");
            }
            const hits = memories.filter(m => 
              m.title.toLowerCase().includes(arg.toLowerCase()) || 
              m.content.toLowerCase().includes(arg.toLowerCase()) ||
              m.tags.some(t => t.toLowerCase().includes(arg.toLowerCase()))
            );

            if (hits.length > 0) {
              replyText = `🔍 **Search Results**\n\nI found **${hits.length} memory item(s)** matching your query **"${arg}"**:`;
              matched = hits.map(h => h.id);
            } else {
              replyText = `🔍 **Search Results**\n\nNo memories found matching your query **"${arg}"**. Try another keyword!`;
            }
          } else if (cmd === '/plan') {
            const plan = generateDailyPlan(tasks, memories);
            const agendaStr = plan.agenda.map(a => `- **${a.time}**: ${a.activity} (${a.detail})`).join('\n');
            replyText = `📅 **Your Daily Focus Plan**\n\n${plan.summary}\n\n${agendaStr}`;
          } else {
            throw new Error(`Unknown slash command: \`${cmd}\`. Try \`/todo\`, \`/note\`, \`/search\`, or \`/plan\`.`);
          }
        } catch (err) {
          replyText = `❌ **Error**: ${err.message}`;
        }

        const assistantMsg = {
          id: `msg-${Date.now()}-ai`,
          sender: "assistant",
          text: replyText,
          matchedMemories: matched,
          time: "Just now"
        };
        setConversations([...updatedConv, assistantMsg]);
        setTyping(false);
      }, 850);
      return;
    }

    // Standard AI chatbot logic
    setTyping(true);
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

      {/* Slash command suggestions menu */}
      {showCommandMenu && filteredCommands.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '16px',
          right: '16px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {filteredCommands.map(c => (
            <div 
              key={c.cmd}
              onClick={() => {
                setInput(c.cmd + ' ');
                setShowCommandMenu(false);
                setTimeout(() => {
                  const inputEl = document.querySelector('.chat-input');
                  if (inputEl) inputEl.focus();
                }, 50);
              }}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid var(--border-color)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-card)',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-app)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div>
                <strong style={{ color: 'var(--primary)', fontSize: '13px' }}>{c.cmd}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>- {c.desc}</span>
              </div>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', opacity: 0.6 }}>{c.example}</span>
            </div>
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
          placeholder="Ask Kario anything... (Type / for commands)"
          className="chat-input"
          value={input}
          onChange={handleInputChange}
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
