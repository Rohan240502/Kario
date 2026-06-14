import React, { useState, useEffect } from 'react';
import { 
  Home, Database, CheckSquare, Sparkles, User, 
  X, Calendar, AlertCircle, Eye, Trash2, CheckCircle, ArrowRight
} from 'lucide-react';

// Subcomponents
import DeviceWrapper from './components/DeviceWrapper';
import Onboarding from './components/Onboarding';
import HomeTab from './components/HomeTab';
import MemoryTab from './components/MemoryTab';
import TasksTab from './components/TasksTab';
import AssistantTab from './components/AssistantTab';
import ProfileTab from './components/ProfileTab';

// Utilities
import { 
  getMemories, saveMemories, 
  getTasks, saveTasks, 
  getConversations, saveConversations, 
  getUserSettings, saveUserSettings, 
  clearAllData,
  getCurrentUserSession, logoutUser
} from './utils/storage';
import { simulateOcr, generateDailyPlan } from './utils/ai';
import Auth from './components/Auth';

function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState(getCurrentUserSession());
  const [settings, setSettings] = useState(getUserSettings());
  const [memories, setMemories] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals States
  const [addModalType, setAddModalType] = useState(null); // 'note' | 'screenshot' | 'voice' | 'document' | 'task'
  const [detailMemory, setDetailMemory] = useState(null);
  const [dailyPlan, setDailyPlan] = useState(null);

  // Forms States
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: '' });
  const [screenshotForm, setScreenshotForm] = useState({ name: 'react_state_bug.png', file: null });
  const [documentForm, setDocumentForm] = useState({ title: '', content: '', tags: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: 'Today' });

  // Load Data on Mount or Session User Change
  useEffect(() => {
    if (currentUser) {
      setMemories(getMemories());
      setTasks(getTasks());
      setConversations(getConversations());
      setSettings(getUserSettings());
    }
  }, [currentUser]);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('home');
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
  };

  // Theme synchronization effect
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-body-bg');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-body-bg');
    }
    saveUserSettings(settings);
  }, [settings]);

  // Task check off handler
  const toggleTaskCompleted = (taskId) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    setTasks(updated);
    saveTasks(updated);
  };

  // Onboarding finished callback
  const handleOnboardingComplete = (permissions) => {
    const updatedSettings = {
      ...settings,
      completedOnboarding: true,
      permissions
    };
    setSettings(updatedSettings);
    saveUserSettings(updatedSettings);
  };

  // Add Item Modals Handlers
  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!noteForm.title || !noteForm.content) return;

    const newMemory = {
      id: `mem-${Date.now()}`,
      type: 'note',
      title: noteForm.title,
      content: noteForm.content,
      summary: noteForm.content.slice(0, 50) + (noteForm.content.length > 50 ? '...' : ''),
      tags: noteForm.tags ? noteForm.tags.split(',').map(t => t.trim().toLowerCase()) : ['personal'],
      date: 'Today, Just now',
      views: 1
    };

    const updated = [newMemory, ...memories];
    setMemories(updated);
    saveMemories(updated);
    setAddModalType(null);
    setNoteForm({ title: '', content: '', tags: '' });
  };

  const handleCreateDocument = (e) => {
    e.preventDefault();
    if (!documentForm.title || !documentForm.content) return;

    const newMemory = {
      id: `mem-${Date.now()}`,
      type: 'document',
      title: documentForm.title,
      content: documentForm.content,
      summary: `Document: ${documentForm.title}. Summarized successfully by AI.`,
      tags: documentForm.tags ? documentForm.tags.split(',').map(t => t.trim().toLowerCase()) : ['work', 'files'],
      date: 'Today, Just now',
      views: 1
    };

    const updated = [newMemory, ...memories];
    setMemories(updated);
    saveMemories(updated);
    setAddModalType(null);
    setDocumentForm({ title: '', content: '', tags: '' });
  };

  const handleImportScreenshot = (e) => {
    e.preventDefault();
    const result = simulateOcr(screenshotForm.name);
    
    const newMemory = {
      id: `mem-${Date.now()}`,
      type: 'screenshot',
      title: result.title,
      content: result.content,
      summary: result.summary,
      tags: result.tags,
      date: 'Today, Just now',
      views: 1,
      thumbnail: screenshotForm.file || '/assets/memoryos_tasks.jpg', // Use base64 upload if exists
      ocrText: result.content
    };

    const updated = [newMemory, ...memories];
    setMemories(updated);
    saveMemories(updated);
    setAddModalType(null);
    setScreenshotForm({ name: 'react_state_bug.png', file: null }); // Reset
    
    // Automatically open the new memory to show OCR results
    setTimeout(() => {
      setDetailMemory(newMemory);
    }, 200);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!taskForm.title) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate,
      completed: false,
      sourceType: 'Manual',
      subtasks: []
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setAddModalType(null);
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: 'Today' });
  };

  // Convert Memory into Task handler
  const handleConvertMemoryToTask = (memory) => {
    const newTask = {
      id: `task-${Date.now()}`,
      title: `Review ${memory.title}`,
      description: memory.summary,
      priority: 'medium',
      dueDate: 'Today',
      completed: false,
      sourceType: memory.type,
      sourceId: memory.id,
      subtasks: []
    };

    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
    setDetailMemory(null);
    setActiveTab('tasks');
  };

  // Memory detailed modal explanation trigger
  const handleAiExplain = (memory) => {
    setDetailMemory(null);
    setActiveTab('assistant');
    
    const explanationQuery = `Explain ${memory.title}`;
    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: "user",
      text: explanationQuery,
      time: "Just now"
    };

    const updatedConv = [...conversations, userMsg];
    setConversations(updatedConv);

    setTimeout(() => {
      const assistantMsg = {
        id: `msg-${Date.now()}-ai`,
        sender: "assistant",
        text: `Here is the AI analysis for **${memory.title}** (${memory.type.toUpperCase()}):

- **Description**: ${memory.summary}
- **Keywords**: ${memory.tags.map(t => `#${t}`).join(', ')}
- **Content Breakdown**:
\`\`\`text
${memory.content}
\`\`\`

Let me know if you would like me to convert this info into a checkbox task checklist!`,
        matchedMemories: [memory.id],
        time: "Just now"
      };
      const finalConv = [...updatedConv, assistantMsg];
      setConversations(finalConv);
      saveConversations(finalConv);
    }, 600);
  };

  // Delete Memory Handler
  const handleDeleteMemory = (memoryId) => {
    if (window.confirm("Delete this memory permanently?")) {
      const updated = memories.filter(m => m.id !== memoryId);
      setMemories(updated);
      saveMemories(updated);
      setDetailMemory(null);
    }
  };

  // Plan My Day Planner Trigger
  const triggerPlanDay = () => {
    const plan = generateDailyPlan(tasks, memories);
    setDailyPlan(plan);
  };

  const handleClipboardPaste = async () => {
    try {
      if (!navigator.clipboard) {
        alert("Clipboard API not supported in this browser.");
        return;
      }
      const text = await navigator.clipboard.readText();
      if (!text || !text.trim()) {
        alert("System clipboard is empty or does not contain text.");
        return;
      }

      const newMemory = {
        id: `mem-${Date.now()}`,
        type: 'clipboard',
        title: 'Pasted Clipboard Snippet',
        content: text,
        summary: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        tags: ['clipboard', 'pasted'],
        date: 'Today, Just now',
        views: 1
      };

      const updated = [newMemory, ...memories];
      setMemories(updated);
      saveMemories(updated);
      alert(`Successfully pasted from clipboard: "${newMemory.summary}"`);
    } catch (err) {
      console.error("Clipboard sync failure", err);
      alert("Failed to read system clipboard. Please ensure clipboard permissions are granted.");
    }
  };

  // Navigation tab renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeTab 
            userName={settings.userName}
            memories={memories}
            tasks={tasks}
            setTab={setActiveTab}
            setSearchQuery={setSearchQuery}
            toggleTaskCompleted={toggleTaskCompleted}
            openAddModal={setAddModalType}
            openDetailModal={(mem) => {
              // increment views when opening details
              const updated = memories.map(m => m.id === mem.id ? { ...m, views: (m.views || 0) + 1 } : m);
              setMemories(updated);
              saveMemories(updated);
              setDetailMemory(mem);
            }}
          />
        );
      case 'memory':
        return (
          <MemoryTab 
            memories={memories}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            openDetailModal={(mem) => {
              const updated = memories.map(m => m.id === mem.id ? { ...m, views: (m.views || 0) + 1 } : m);
              setMemories(updated);
              saveMemories(updated);
              setDetailMemory(mem);
            }}
            onClipboardPaste={handleClipboardPaste}
          />
        );
      case 'tasks':
        return (
          <TasksTab 
            tasks={tasks}
            memories={memories}
            toggleTaskCompleted={toggleTaskCompleted}
            openTaskDetailModal={(task) => {
              // Task detailed modal reuse form modal
              setTaskForm(task);
              setAddModalType('task_details');
            }}
            triggerPlanDay={triggerPlanDay}
          />
        );
      case 'assistant':
        return (
          <AssistantTab 
            memories={memories}
            tasks={tasks}
            conversations={conversations}
            setConversations={(conv) => {
              setConversations(conv);
              saveConversations(conv);
            }}
            openDetailModal={setDetailMemory}
          />
        );
      case 'profile':
        return (
          <ProfileTab 
            settings={settings}
            setSettings={setSettings}
            memories={memories}
            tasks={tasks}
            clearAllData={clearAllData}
            onLogout={handleLogout}
          />
        );
      default:
        return <div>Dashboard</div>;
    }
  };

  // Auth guard
  if (!currentUser) {
    return (
      <DeviceWrapper isDarkTheme={settings.theme === 'dark'} setIsDarkTheme={(val) => setSettings(prev => ({ ...prev, theme: val ? 'dark' : 'light' }))}>
        <Auth onLoginSuccess={handleLoginSuccess} />
      </DeviceWrapper>
    );
  }

  // Onboarding guard
  if (!settings.completedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <DeviceWrapper isDarkTheme={settings.theme === 'dark'} setIsDarkTheme={(val) => setSettings(prev => ({ ...prev, theme: val ? 'dark' : 'light' }))}>
      
      {/* Active Tab Screen Area */}
      <div className="tab-content">
        {renderTabContent()}
      </div>

      {/* Bottom Floating Navigation Bar (80px) */}
      <div className="bottom-navbar">
        <button 
          className={`nav-item ${activeTab === 'home' ? 'nav-item-active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home />
          <span>Home</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'memory' ? 'nav-item-active' : ''}`}
          onClick={() => setActiveTab('memory')}
        >
          <Database />
          <span>Memory</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'tasks' ? 'nav-item-active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare />
          <span>Tasks</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'assistant' ? 'nav-item-active' : ''}`}
          onClick={() => setActiveTab('assistant')}
        >
          <Sparkles />
          <span>Assistant</span>
        </button>
        <button 
          className={`nav-item ${activeTab === 'profile' ? 'nav-item-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User />
          <span>Profile</span>
        </button>
      </div>

      {/* ========================================================
          MODALS AREA
          ======================================================== */}
      
      {/* 1. Add Note Modal */}
      {addModalType === 'note' && (
        <div className="modal-overlay" onClick={() => setAddModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Note</h3>
              <button className="modal-close-btn" onClick={() => setAddModalType(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateNote}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  placeholder="Grocery List, Ideas..." 
                  className="form-control" 
                  required
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea 
                  placeholder="Jot down details here..." 
                  className="form-control" 
                  required
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="personal, shopping, code" 
                  className="form-control"
                  value={noteForm.tags}
                  onChange={(e) => setNoteForm({ ...noteForm, tags: e.target.value })}
                />
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Document Modal */}
      {addModalType === 'document' && (
        <div className="modal-overlay" onClick={() => setAddModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button className="modal-close-btn" onClick={() => setAddModalType(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateDocument}>
              <div className="form-group">
                <label>Document Title</label>
                <input 
                  type="text" 
                  placeholder="W2 Form, Flight Ticket, Invoice..." 
                  className="form-control" 
                  required
                  value={documentForm.title}
                  onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Document Content / Description</label>
                <textarea 
                  placeholder="Paste invoice text, booking codes, or descriptions..." 
                  className="form-control" 
                  required
                  value={documentForm.content}
                  onChange={(e) => setDocumentForm({ ...documentForm, content: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Tags (comma-separated)</label>
                <input 
                  type="text" 
                  placeholder="finance, travel, w2" 
                  className="form-control"
                  value={documentForm.tags}
                  onChange={(e) => setDocumentForm({ ...documentForm, tags: e.target.value })}
                />
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Document</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Screenshot OCR Modal */}
      {addModalType === 'screenshot' && (
        <div className="modal-overlay" onClick={() => setAddModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Import Screenshot (OCR)</h3>
              <button className="modal-close-btn" onClick={() => setAddModalType(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleImportScreenshot}>
              <div className="form-group" style={{ textAlign: 'center', border: '2px dashed var(--border-color)', padding: '24px', borderRadius: '16px', marginBottom: '16px', background: 'var(--bg-app)' }}>
                <span style={{ fontSize: '32px' }}>📷</span>
                <p style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>Select file or simulation screenshot</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px', width: '100%' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'left', color: 'var(--text-secondary)' }}>Upload actual image file:</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    className="form-control"
                    style={{ fontSize: '12px', padding: '6px' }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setScreenshotForm({
                            name: file.name,
                            file: reader.result
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label style={{ fontSize: '11px', fontWeight: 'bold', textAlign: 'left', color: 'var(--text-secondary)' }}>Or pick simulation file:</label>
                  <select 
                    className="form-control" 
                    style={{ textAlign: 'center' }}
                    value={screenshotForm.name}
                    onChange={(e) => setScreenshotForm(prev => ({ ...prev, name: e.target.value }))}
                  >
                    <option value="laptop_invoice.png">laptop_invoice.png (Receipt OCR)</option>
                    <option value="react_router_code.png">react_router_code.png (Code extraction)</option>
                    <option value="london_trip_flight.png">london_trip_flight.png (Travel tickets)</option>
                    <option value="random_note.png">random_note.png (General OCR)</option>
                  </select>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4, textAlign: 'center' }}>
                Kario will run background OCR text extraction and use simulated local AI models to auto-tag and summarize the image metadata.
              </p>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Import & Analyze</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Voice Note Modal */}
      {addModalType === 'voice' && (
        <div className="modal-overlay" onClick={() => setAddModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Record Voice Note</h3>
              <button className="modal-close-btn" onClick={() => setAddModalType(null)}><X size={18} /></button>
            </div>
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <div className="illustration-circle" style={{ margin: '0 auto 20px auto', width: '100px', height: '100px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
                <Mic size={36} style={{ animation: 'float-pulse 1.5s infinite' }} />
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Voice Recording Simulation</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', maxWidth: '280px', margin: '8px auto 0 auto', lineHeight: 1.4 }}>
                Click below to start a simulated recording. The app will capture standard brainstorm audio and save it as a text-transcribed voice memo.
              </p>
              <button 
                className="btn btn-primary" 
                style={{ marginTop: '24px', background: 'var(--danger)', width: '180px', margin: '24px auto 0 auto' }}
                onClick={() => {
                  setAddModalType(null);
                  setTimeout(() => {
                    const newVoiceMemory = {
                      id: `mem-${Date.now()}`,
                      type: 'voice',
                      title: 'Audio Idea Memo',
                      content: 'Voice Note: We should integrate client notifications inside Kario by checking calendar schedules. This triggers reminders 10 minutes prior to calls.',
                      summary: 'Audio transcription regarding client meeting notifications and task reminders.',
                      tags: ['voice', 'ideas', 'notifications'],
                      date: 'Today, Just now',
                      views: 1
                    };
                    const updated = [newVoiceMemory, ...memories];
                    setMemories(updated);
                    saveMemories(updated);
                    alert("Voice recorded and transcribed successfully: 'We should integrate client notifications inside Kario...'");
                  }, 1000);
                }}
              >
                Record 3s Memo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Create Task Modal */}
      {addModalType === 'task' && (
        <div className="modal-overlay" onClick={() => setAddModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Task</h3>
              <button className="modal-close-btn" onClick={() => setAddModalType(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  type="text" 
                  placeholder="Finish landing page layout..." 
                  className="form-control" 
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Task details..." 
                  className="form-control" 
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  className="form-control"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <select 
                  className="form-control"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                >
                  <option value="Today">Today</option>
                  <option value="Tomorrow">Tomorrow</option>
                  <option value="In 2 days">In 2 days</option>
                  <option value="Next week">Next week</option>
                </select>
              </div>
              <div className="btn-row">
                <button type="button" className="btn btn-secondary" onClick={() => setAddModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Task Details Subtasks Modal */}
      {addModalType === 'task_details' && (
        <div className="modal-overlay" onClick={() => setAddModalType(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Task Management</h3>
              <button className="modal-close-btn" onClick={() => setAddModalType(null)}><X size={18} /></button>
            </div>
            
            <div className="detail-sec">
              <span className={`priority-badge priority-${taskForm.priority}`} style={{ float: 'right' }}>
                {taskForm.priority}
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{taskForm.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{taskForm.description || "No description provided."}</p>
            </div>

            <div className="detail-sec" style={{ marginTop: '12px' }}>
              <h5>Due Date</h5>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>📅 {taskForm.dueDate}</p>
            </div>

            {taskForm.sourceType && (
              <div className="detail-sec">
                <h5>Generated From</h5>
                <span className="task-source-badge" style={{ display: 'inline-flex', padding: '4px 10px' }}>
                  {taskForm.sourceType}
                </span>
                {taskForm.sourceId && (
                  <button 
                    onClick={() => {
                      const origin = memories.find(m => m.id === taskForm.sourceId);
                      if (origin) {
                        setAddModalType(null);
                        setDetailMemory(origin);
                      } else {
                        alert("Linked memory was deleted.");
                      }
                    }}
                    style={{ marginLeft: '10px', background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    View Original Memory
                  </button>
                )}
              </div>
            )}

            {/* Checklist items */}
            <div className="detail-sec" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <h5>Subtasks Checklist</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                {taskForm.subtasks && taskForm.subtasks.map(sub => (
                  <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <input 
                      type="checkbox" 
                      checked={sub.completed}
                      onChange={() => {
                        const updatedTasks = tasks.map(t => {
                          if (t.id === taskForm.id) {
                            const updatedSub = t.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                            return { ...t, subtasks: updatedSub };
                          }
                          return t;
                        });
                        setTasks(updatedTasks);
                        saveTasks(updatedTasks);
                        // Update local form state
                        setTaskForm(prev => ({
                          ...prev,
                          subtasks: prev.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s)
                        }));
                      }}
                    />
                    <span style={{ textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                      {sub.text}
                    </span>
                  </label>
                ))}
                
                {/* Textbox to add subtask */}
                <input 
                  type="text" 
                  placeholder="+ Add new subtask..."
                  className="form-control"
                  style={{ minHeight: '38px', fontSize: '12px', padding: '6px 10px', marginTop: '4px' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.target.value.trim() !== '') {
                      const newSubText = e.target.value;
                      e.target.value = '';
                      const newSub = { id: `sub-${Date.now()}`, text: newSubText, completed: false };
                      const updatedTasks = tasks.map(t => {
                        if (t.id === taskForm.id) {
                          return { ...t, subtasks: [...(t.subtasks || []), newSub] };
                        }
                        return t;
                      });
                      setTasks(updatedTasks);
                      saveTasks(updatedTasks);
                      setTaskForm(prev => ({
                        ...prev,
                        subtasks: [...(prev.subtasks || []), newSub]
                      }));
                    }
                  }}
                />
              </div>
            </div>

            <div className="btn-row" style={{ marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setAddModalType(null)}>Close</button>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  toggleTaskCompleted(taskForm.id);
                  setAddModalType(null);
                }}
              >
                {taskForm.completed ? "Mark Uncompleted" : "Complete Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Memory Details / OCR Modal */}
      {detailMemory && (
        <div className="modal-overlay" onClick={() => setDetailMemory(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>
                  {detailMemory.type === 'note' ? '📝' : detailMemory.type === 'screenshot' ? '📷' : detailMemory.type === 'document' ? '📁' : detailMemory.type === 'link' ? '🔗' : detailMemory.type === 'voice' ? '🎙️' : detailMemory.type === 'clipboard' ? '📋' : '📅'}
                </span>
                <h3>{detailMemory.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setDetailMemory(null)}><X size={18} /></button>
            </div>

            <div className="detail-actions-grid">
              <div className="detail-action-card" onClick={() => handleAiExplain(detailMemory)}>
                <Sparkles size={16} />
                <span>Ask AI</span>
              </div>
              <div className="detail-action-card" onClick={() => handleConvertMemoryToTask(detailMemory)}>
                <CheckSquare size={16} />
                <span>Create Task</span>
              </div>
              <div className="detail-action-card detail-action-delete" onClick={() => handleDeleteMemory(detailMemory.id)}>
                <Trash2 size={16} />
                <span>Delete</span>
              </div>
            </div>

            <div className="detail-sec">
              <h5>Date Saved</h5>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>🕒 {detailMemory.date}</p>
            </div>

            <div className="detail-sec">
              <h5>AI Summary</h5>
              <p style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '10px 14px', borderRadius: '12px', borderLeft: '3px solid var(--primary)', fontSize: '13px', lineHeight: 1.4, fontStyle: 'italic' }}>
                {detailMemory.summary}
              </p>
            </div>

            <div className="detail-sec">
              <h5>Content Details</h5>
              <div className="detail-content-box">
                {detailMemory.content}
              </div>
            </div>

            {detailMemory.tags && detailMemory.tags.length > 0 && (
              <div className="detail-sec">
                <h5>Auto Generated Tags</h5>
                <div className="tag-list" style={{ marginTop: '4px' }}>
                  {detailMemory.tags.map(tag => (
                    <span key={tag} className="tag-chip" style={{ fontSize: '10px', padding: '4px 10px' }}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Related Memories list */}
            <div className="detail-sec" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <h5>Related Memories</h5>
              <div className="related-scroller">
                {memories
                  .filter(m => m.id !== detailMemory.id && m.tags.some(t => detailMemory.tags.includes(t)))
                  .slice(0, 3)
                  .map(rel => (
                    <div 
                      key={rel.id} 
                      className="related-mini-card"
                      onClick={() => {
                        setDetailMemory(rel);
                      }}
                    >
                      <h5>{rel.title}</h5>
                      <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{rel.type.toUpperCase()}</span>
                    </div>
                  ))}
                {memories.filter(m => m.id !== detailMemory.id && m.tags.some(t => detailMemory.tags.includes(t))).length === 0 && (
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No related documents indexed.</span>
                )}
              </div>
            </div>

            <div className="btn-row" style={{ marginTop: '16px' }}>
              <button className="btn btn-secondary" style={{ flex: 'none', width: '100%' }} onClick={() => setDetailMemory(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Plan My Day Daily Timeline Modal */}
      {dailyPlan && (
        <div className="modal-overlay" onClick={() => setDailyPlan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} className="pulse-danger" style={{ color: 'var(--primary)' }} />
                <h3>{dailyPlan.title}</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setDailyPlan(null)}><X size={18} /></button>
            </div>

            <div className="plan-summary-box">
              {dailyPlan.summary}
            </div>

            <div className="plan-timeline">
              {dailyPlan.agenda.map((item, idx) => (
                <div key={idx} className="plan-timeline-item">
                  <div className="plan-timeline-dot"></div>
                  <span className="plan-timeline-time">{item.time}</span>
                  <h4 className="plan-timeline-title">{item.activity}</h4>
                  <p className="plan-timeline-detail">{item.detail}</p>
                </div>
              ))}
            </div>

            <div className="btn-row">
              <button 
                className="btn btn-primary" 
                style={{ width: '100%' }} 
                onClick={() => {
                  setDailyPlan(null);
                  alert("Day plan synchronized! Added schedule reminders.");
                }}
              >
                Sync with Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </DeviceWrapper>
  );
}

export default App;
