import React, { useState } from 'react';
import { Sparkles, Calendar, CheckSquare, Square, FileText, Image as ImageIcon } from 'lucide-react';

const TasksTab = ({ 
  tasks, 
  memories,
  toggleTaskCompleted, 
  openTaskDetailModal, 
  triggerPlanDay 
}) => {
  const [activeCategory, setActiveCategory] = useState('Today');

  const categories = ['Today', 'Upcoming', 'Completed', 'AI Suggested'];

  const getSourceIcon = (type) => {
    switch (type) {
      case 'note': return <FileText size={11} />;
      case 'screenshot': return <ImageIcon size={11} />;
      case 'calendar': return <Calendar size={11} />;
      default: return <Sparkles size={11} />;
    }
  };

  // Filter tasks based on active category
  const filteredTasks = tasks.filter(task => {
    if (activeCategory === 'Today') {
      return task.dueDate.toLowerCase() === 'today' && !task.completed;
    }
    if (activeCategory === 'Upcoming') {
      return task.dueDate.toLowerCase() !== 'today' && !task.completed;
    }
    if (activeCategory === 'Completed') {
      return task.completed;
    }
    if (activeCategory === 'AI Suggested') {
      // High priority or has a linked screenshot/document
      return !task.completed && (task.priority === 'high' || task.sourceType === 'screenshot' || task.sourceType === 'document');
    }
    return true;
  });

  return (
    <div style={{ height: '100%' }}>
      {/* Header with AI Plan Button */}
      <div className="tasks-header">
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Tasks</h2>
        <button className="plan-day-btn" onClick={triggerPlanDay}>
          <Sparkles size={14} /> Plan My Day
        </button>
      </div>

      {/* Filter Category Chips */}
      <div className="chips-container">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`chip ${activeCategory === cat ? 'chip-active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-card-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const completedSubtasks = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;
            const totalSubtasks = task.subtasks ? task.subtasks.length : 0;

            return (
              <div 
                key={task.id} 
                className={`task-list-card ${task.completed ? 'task-completed' : ''}`}
                onClick={() => openTaskDetailModal(task)}
              >
                <div 
                  className="task-checkbox-container" 
                  onClick={(e) => {
                    e.stopPropagation(); // prevent opening details modal
                    toggleTaskCompleted(task.id);
                  }}
                >
                  {task.completed ? (
                    <CheckSquare size={20} className="text-primary" fill="currentColor" style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Square size={20} style={{ color: 'var(--border-color)' }} />
                  )}
                </div>
                
                <div className="task-list-details">
                  <h4 className="task-list-title">{task.title}</h4>
                  
                  <div className="task-meta-row">
                    <span className={`priority-badge priority-${task.priority}`}>
                      {task.priority}
                    </span>
                    
                    <span className="task-due-date">
                      <Calendar size={11} /> {task.dueDate}
                    </span>
                    
                    {task.sourceType && (
                      <span className="task-source-badge">
                        {getSourceIcon(task.sourceType)}
                        {task.sourceType}
                      </span>
                    )}

                    {totalSubtasks > 0 && (
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        ☑️ {completedSubtasks}/{totalSubtasks} subtasks
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px 20px', 
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '36px' }}>🎉</span>
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>All clean!</h4>
            <p style={{ fontSize: '13px', maxWidth: '240px', lineHeight: 1.4 }}>
              No tasks found in "{activeCategory}". Add tasks manually or convert memories into tasks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksTab;
