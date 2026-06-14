import React, { useState } from 'react';
import { 
  Plus, Search, FileText, Image as ImageIcon, Mic, 
  FileCheck, Calendar, Sparkles, TrendingUp, ChevronRight 
} from 'lucide-react';

const HomeTab = ({ 
  userName, 
  memories, 
  tasks, 
  setTab, 
  setSearchQuery, 
  toggleTaskCompleted,
  openAddModal,
  openDetailModal 
}) => {
  const [fabOpen, setFabOpen] = useState(false);

  // Dynamic greeting based on current local hours
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good Morning";
    if (hrs < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Filter today's tasks
  const todayTasks = tasks.filter(t => t.dueDate.toLowerCase() === 'today');
  const highPriorityToday = todayTasks.filter(t => t.priority === 'high' || t.priority === 'medium').slice(0, 3);
  const completedToday = todayTasks.filter(t => t.completed).length;
  const totalToday = todayTasks.length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Circular progress math
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  // Last 4 memories
  const recentMemories = [...memories].slice(0, 4);

  // Next upcoming events (calendar memories)
  const calendarEvents = memories.filter(m => m.type === 'calendar').slice(0, 2);

  const handleSearchFocus = () => {
    setTab('memory');
    // Focus search input on memory tab
    setTimeout(() => {
      const searchInput = document.querySelector('.search-input');
      if (searchInput) searchInput.focus();
    }, 100);
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
    <div style={{ position: 'relative', height: '100%' }}>
      {/* Header Greeting */}
      <div className="header-area">
        <div className="header-greeting">
          <h3>{getGreeting()},</h3>
          <h2>{userName} 👋</h2>
        </div>
        <div className="avatar" onClick={() => setTab('profile')} style={{ cursor: 'pointer' }}>
          {userName.charAt(0)}
        </div>
      </div>

      {/* Global Search Focus Input */}
      <div className="search-container" onClick={handleSearchFocus}>
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search everything..." 
          className="search-input"
          readOnly
          style={{ cursor: 'pointer' }}
        />
      </div>

      {/* Quick Actions Scroll bar */}
      <div className="quick-actions-scroll">
        <button className="quick-action-btn" onClick={() => openAddModal('note')}>
          <FileText size={15} /> Note
        </button>
        <button className="quick-action-btn" onClick={() => openAddModal('screenshot')}>
          <ImageIcon size={15} /> Screenshot
        </button>
        <button className="quick-action-btn" onClick={() => openAddModal('voice')}>
          <Mic size={15} /> Voice Note
        </button>
        <button className="quick-action-btn" onClick={() => openAddModal('document')}>
          <FileCheck size={15} /> Document
        </button>
        <button className="quick-action-btn" onClick={() => openAddModal('task')}>
          <Plus size={15} /> Task
        </button>
      </div>

      {/* Today's Focus Card */}
      <div className="notion-card">
        <div className="focus-card-header">
          <h3>Today's Focus</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {completedToday}/{totalToday} Tasks
          </span>
        </div>
        <div className="focus-card-content">
          {totalToday > 0 ? (
            <>
              <div className="progress-ring-container">
                <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                  <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    stroke="var(--border-color)"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    stroke="var(--primary)"
                    strokeWidth="5"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.35s' }}
                  />
                </svg>
                <div className="progress-ring-text">{completionPercentage}%</div>
              </div>
              <div className="focus-tasks-list">
                {highPriorityToday.map(task => (
                  <label key={task.id} className="focus-task-item">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => toggleTaskCompleted(task.id)}
                    />
                    <span className={task.completed ? 'focus-task-item-completed' : ''}>
                      {task.title}
                    </span>
                  </label>
                ))}
                {highPriorityToday.length === 0 && todayTasks.slice(0, 3).map(task => (
                  <label key={task.id} className="focus-task-item">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => toggleTaskCompleted(task.id)}
                    />
                    <span className={task.completed ? 'focus-task-item-completed' : ''}>
                      {task.title}
                    </span>
                  </label>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', width: '100%', padding: '10px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
              No tasks scheduled for today. Click + to add one!
            </div>
          )}
        </div>
      </div>

      {/* AI Insights Section */}
      <div className="insights-banner">
        <Sparkles size={20} className="insights-icon" style={{ flexShrink: 0 }} />
        <div className="insights-text">
          <h4>Smart Insights</h4>
          <p>
            {tasks.filter(t => !t.completed).length > 0 
              ? `You have ${tasks.filter(t => !t.completed).length} pending tasks to finish. Your Macbook Pro warranty document was stored recently.` 
              : "All tasks completed! Try scanning an invoice or recording a voice note to add new memories."}
          </p>
        </div>
      </div>

      {/* Recent Memories Section */}
      <div className="section-header-title">
        <span>Recent Memories</span>
        <span className="section-header-link" onClick={() => setTab('memory')}>
          See all <ChevronRight size={14} style={{ verticalAlign: 'middle' }} />
        </span>
      </div>
      
      {recentMemories.length > 0 ? (
        <div className="memories-grid">
          {recentMemories.map(mem => (
            <div key={mem.id} className="memory-card" onClick={() => openDetailModal(mem)}>
              <div className="memory-card-top">
                <span className="memory-type-badge">{getMemoryIcon(mem.type)}</span>
                <span className="memory-card-date">{mem.date.split(',')[0]}</span>
              </div>
              <div className="memory-card-body">
                {mem.type === 'screenshot' && mem.thumbnail && (
                  <div style={{
                    width: '100%',
                    height: '80px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginBottom: '8px',
                    border: '1px solid var(--border-color)',
                    background: '#f1f5f9'
                  }}>
                    <img 
                      src={mem.thumbnail} 
                      alt={mem.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <h4>{mem.title}</h4>
                <p>{mem.summary}</p>
                <div className="tag-list">
                  {mem.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="tag-chip">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '30px 0', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px' }}>
          No memories saved. Use quick actions to add one!
        </div>
      )}

      {/* Upcoming Events Section */}
      <div className="section-header-title">
        <span>Calendar Events</span>
      </div>
      <div className="calendar-list">
        {calendarEvents.map(evt => (
          <div key={evt.id} className="calendar-item" onClick={() => openDetailModal(evt)} style={{ cursor: 'pointer' }}>
            <div className="calendar-time">{evt.date.split(',')[1] || 'All Day'}</div>
            <div className="calendar-info">
              <h4>{evt.title}</h4>
              <p>{evt.summary}</p>
            </div>
          </div>
        ))}
        {calendarEvents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '14px', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            No calendar events sync'd for today.
          </div>
        )}
      </div>

      {/* Floating Action Button Overlay & Menu */}
      {fabOpen && <div className="fab-overlay" onClick={() => setFabOpen(false)}></div>}
      <div className="fab-container">
        {fabOpen && (
          <div className="fab-menu">
            <button className="fab-menu-item" onClick={() => { openAddModal('note'); setFabOpen(false); }}>
              📝 New Note
            </button>
            <button className="fab-menu-item" onClick={() => { openAddModal('screenshot'); setFabOpen(false); }}>
              📷 OCR Screenshot
            </button>
            <button className="fab-menu-item" onClick={() => { openAddModal('voice'); setFabOpen(false); }}>
              🎙️ Record Voice
            </button>
            <button className="fab-menu-item" onClick={() => { openAddModal('task'); setFabOpen(false); }}>
              ✔️ Add Task
            </button>
          </div>
        )}
        <button 
          className="fab-btn" 
          onClick={() => setFabOpen(!fabOpen)}
          style={{ transform: fabOpen ? 'rotate(135deg)' : 'none' }}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
};

export default HomeTab;
