import React, { useState } from 'react';
import { Search } from 'lucide-react';

const MemoryTab = ({ 
  memories, 
  searchQuery, 
  setSearchQuery, 
  openDetailModal,
  onClipboardPaste
}) => {
  const [activeChip, setActiveChip] = useState('All');
  const [sortBy, setSortBy] = useState('Recent');

  const chips = [
    'All', 'Screenshots', 'Notes', 'Documents', 
    'Links', 'Voice Notes', 'Clipboard', 'Calendar'
  ];

  // Map chip names to memory types in storage.js
  const mapChipToType = (chip) => {
    switch (chip) {
      case 'Screenshots': return 'screenshot';
      case 'Notes': return 'note';
      case 'Documents': return 'document';
      case 'Links': return 'link';
      case 'Voice Notes': return 'voice';
      case 'Clipboard': return 'clipboard';
      case 'Calendar': return 'calendar';
      default: return 'all';
    }
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

  // Filter memories
  let filteredMemories = memories.filter(mem => {
    // 1. Filter by category chip
    const typeFilter = mapChipToType(activeChip);
    if (typeFilter !== 'all' && mem.type !== typeFilter) return false;

    // 2. Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const titleMatch = mem.title.toLowerCase().includes(q);
      const summaryMatch = mem.summary.toLowerCase().includes(q);
      const contentMatch = mem.content.toLowerCase().includes(q);
      const tagsMatch = mem.tags.some(tag => tag.toLowerCase().includes(q));
      
      return titleMatch || summaryMatch || contentMatch || tagsMatch;
    }

    return true;
  });

  // Sort memories
  filteredMemories.sort((a, b) => {
    if (sortBy === 'Recent') {
      // Assuming ID structure mem-1, mem-2 (higher = newer)
      const idA = parseInt(a.id.replace('mem-', '')) || 0;
      const idB = parseInt(b.id.replace('mem-', '')) || 0;
      return idB - idA;
    }
    if (sortBy === 'Oldest') {
      const idA = parseInt(a.id.replace('mem-', '')) || 0;
      const idB = parseInt(b.id.replace('mem-', '')) || 0;
      return idA - idB;
    }
    if (sortBy === 'Most Viewed') {
      return (b.views || 0) - (a.views || 0);
    }
    if (sortBy === 'AI Recommended') {
      // Just arbitrary sorting favoring screenshots/notes
      const score = (m) => (m.type === 'screenshot' ? 10 : m.type === 'note' ? 8 : 5) + (m.views || 0);
      return score(b) - score(a);
    }
    return 0;
  });

  return (
    <div style={{ height: '100%' }}>
      {/* Search Input */}
      <div className="search-container">
        <Search size={18} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search memories, screenshots, files..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Chips */}
      <div className="chips-container">
        {chips.map(chip => (
          <button 
            key={chip} 
            className={`chip ${activeChip === chip ? 'chip-active' : ''}`}
            onClick={() => setActiveChip(chip)}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Sort Options Bar */}
      <div className="sort-bar">
        <span>Showing {filteredMemories.length} items</span>
        <button 
          onClick={onClipboardPaste}
          style={{
            background: 'var(--accent)',
            color: 'var(--primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '4px 12px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--font-family)',
            transition: 'var(--transition-smooth)'
          }}
          title="Paste from system clipboard"
        >
          📋 Paste Clipboard
        </button>
        <div>
          Sort by:{' '}
          <select 
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Recent">Recent</option>
            <option value="Oldest">Oldest</option>
            <option value="Most Viewed">Most Viewed</option>
            <option value="AI Recommended">AI Recommended</option>
          </select>
        </div>
      </div>

      {/* Memories Grid */}
      {filteredMemories.length > 0 ? (
        <div className="memories-grid">
          {filteredMemories.map(mem => (
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
                  {mem.tags.map(tag => (
                    <span key={tag} className="tag-chip">#{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px', 
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '36px' }}>🔍</span>
          <h4 style={{ fontWeight: 700, color: 'var(--text-primary)' }}>No search results</h4>
          <p style={{ fontSize: '13px', maxWidth: '240px', lineHeight: 1.4 }}>
            Nothing found matching "{searchQuery}". Try another keyword or check category filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default MemoryTab;
