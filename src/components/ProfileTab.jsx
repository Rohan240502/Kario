import React, { useState } from 'react';
import { 
  User, Database, Sparkles, Sun, Moon, 
  Bell, HelpCircle, RefreshCw, Trash2, ArrowRight, Shield,
  Eye, EyeOff
} from 'lucide-react';
import { getRegisteredUsers } from '../utils/storage';

const ProfileTab = ({ 
  settings, 
  setSettings, 
  memories, 
  tasks, 
  clearAllData,
  onLogout
}) => {
  const [showAccounts, setShowAccounts] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [showPasswords, setShowPasswords] = useState({});
  const usersList = getRegisteredUsers();

  const totalMemories = memories.length;
  const totalTasks = tasks.length;
  const totalScreenshots = memories.filter(m => m.type === 'screenshot').length;
  const totalDocuments = memories.filter(m => m.type === 'document').length;

  const handleModelChange = (e) => {
    setSettings(prev => ({
      ...prev,
      aiModel: e.target.value
    }));
  };

  const handleThemeChange = (e) => {
    setSettings(prev => ({
      ...prev,
      theme: e.target.value
    }));
  };

  const handleNotificationToggle = () => {
    setSettings(prev => ({
      ...prev,
      notifications: !prev.notifications
    }));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all Kario data to defaults? This will clear your custom notes, screenshots, and chat logs.")) {
      clearAllData();
      window.location.reload();
    }
  };

  return (
    <div style={{ height: '100%' }}>
      {/* Profile Header */}
      <div className="profile-user-card">
        <div className="profile-avatar-lg">
          {settings.userName.charAt(0)}
        </div>
        <h3>{settings.userName}</h3>
        <p>{settings.userEmail}</p>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{totalMemories}</div>
            <div className="stat-label">Total Memories</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalScreenshots}</div>
            <div className="stat-label">Screenshots</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{totalDocuments}</div>
            <div className="stat-label">Documents</div>
          </div>
        </div>

        {/* Storage Bar */}
        <div className="storage-progress-container">
          <div className="storage-label-row">
            <span>Local Storage Used</span>
            <span>{settings.storageUsedGB} GB / {settings.storageLimitGB} GB</span>
          </div>
          <div className="storage-progress-bar">
            <div 
              className="storage-progress-fill" 
              style={{ width: `${(settings.storageUsedGB / settings.storageLimitGB) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Settings Options List */}
      <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', paddingLeft: '4px' }}>Settings</h3>
      <div className="settings-list">
        
        {/* Theme Select */}
        <div className="settings-item">
          <div className="settings-left">
            {settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
            <span>App Theme</span>
          </div>
          <select 
            className="settings-select"
            value={settings.theme}
            onChange={handleThemeChange}
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
          </select>
        </div>

        {/* AI Model Select */}
        <div className="settings-item">
          <div className="settings-left">
            <Sparkles size={18} />
            <span>AI Model Engine</span>
          </div>
          <select 
            className="settings-select"
            value={settings.aiModel}
            onChange={handleModelChange}
          >
            <option value="Gemini 3.5 Flash (Default)">Gemini 3.5 Flash</option>
            <option value="Gemini 3.5 Pro (High Accuracy)">Gemini 3.5 Pro</option>
            <option value="Kario Local Engine (Offline)">Kario Offline</option>
          </select>
        </div>

        {/* Notifications Toggle */}
        <div className="settings-item">
          <div className="settings-left">
            <Bell size={18} />
            <span>Smart Notifications</span>
          </div>
          <label className="switch-control">
            <input 
              type="checkbox" 
              checked={settings.notifications}
              onChange={handleNotificationToggle}
            />
            <span className="slider-round"></span>
          </label>
        </div>

        {/* Backup Clickable */}
        <div 
          className="settings-item settings-item-clickable"
          onClick={() => alert("Mock database snapshot downloaded. Auto-sync is active.")}
        >
          <div className="settings-left">
            <Database size={18} />
            <span>Backup & Sync</span>
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {/* Security / Privacy */}
        <div 
          className="settings-item settings-item-clickable"
          onClick={() => alert("Kario runs 100% locally on your device. Your data is encrypted.")}
        >
          <div className="settings-left">
            <Shield size={18} />
            <span>Privacy Policy</span>
          </div>
          <ArrowRight size={14} style={{ color: 'var(--text-secondary)' }} />
        </div>

        {/* Log Out */}
        <div 
          className="settings-item settings-item-clickable" 
          onClick={onLogout}
          style={{ color: 'var(--primary)' }}
        >
          <div className="settings-left">
            <User size={18} style={{ color: 'var(--primary)' }} />
            <span>Log Out</span>
          </div>
          <ArrowRight size={14} style={{ color: 'var(--primary)' }} />
        </div>

        {/* Reset Database */}
        <div 
          className="settings-item settings-item-clickable" 
          onClick={handleReset}
          style={{ color: 'var(--danger)' }}
        >
          <div className="settings-left">
            <Trash2 size={18} style={{ color: 'var(--danger)' }} />
            <span>Clear Database</span>
          </div>
          <RefreshCw size={14} style={{ color: 'var(--danger)' }} />
        </div>

        {/* Local Accounts Directory (Debug Info) */}
        <div 
          className="settings-item settings-item-clickable"
          onClick={() => {
            if (!showAccounts && !unlocked) {
              const pass = window.prompt("For security, please enter your current account password to view the local accounts directory:");
              const currentUser = JSON.parse(localStorage.getItem("kario_current_user"));
              if (currentUser && pass === currentUser.password) {
                setUnlocked(true);
                setShowAccounts(true);
              } else if (pass !== null) {
                alert("Incorrect password. Access denied.");
              }
            } else {
              setShowAccounts(!showAccounts);
            }
          }}
        >
          <div className="settings-left">
            <User size={18} style={{ color: 'var(--text-primary)' }} />
            <span>Local Accounts ({usersList.length})</span>
          </div>
          <ArrowRight size={14} style={{ transform: showAccounts ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-secondary)' }} />
        </div>

        {showAccounts && unlocked && (
          <div style={{
            background: 'var(--bg-app)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginTop: '-12px',
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {usersList.map((usr, idx) => {
              const isVisible = showPasswords[usr.email];
              return (
                <div 
                  key={idx} 
                  style={{ 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-sm)', 
                    padding: '10px 12px',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>👤 {usr.name}</div>
                  <div style={{ color: 'var(--text-secondary)' }}>✉️ {usr.email}</div>
                  <div style={{ 
                    fontFamily: 'monospace', 
                    color: 'var(--primary)', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>🔑 Password: <span style={{ color: 'var(--text-primary)', fontFamily: isVisible ? 'monospace' : 'sans-serif' }}>{isVisible ? usr.password : '••••••••'}</span></span>
                    <button 
                      onClick={() => setShowPasswords(prev => ({ ...prev, [usr.email]: !prev[usr.email] }))}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        padding: '2px 4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '11px', margin: '20px 0 10px 0' }}>
        Kario v1.0.0 (Local Edition)<br />
        Designed with 💜 for mobile-first personal memory space
      </div>
    </div>
  );
};

export default ProfileTab;
