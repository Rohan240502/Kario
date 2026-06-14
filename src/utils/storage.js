const SEED_MEMORIES = [
  {
    id: "mem-1",
    type: "note",
    title: "Weekly Shopping List",
    content: "Milk, Eggs, Whole wheat bread, Salmon, Spinach, Avocados, Coffee beans, Toilet paper, Olive oil, Blueberries.",
    summary: "List of fresh groceries and household items for the weekly run.",
    tags: ["shopping", "personal", "groceries"],
    date: "Today, 10:30 AM",
    views: 5
  },
  {
    id: "mem-2",
    type: "screenshot",
    title: "React Router Config",
    content: "Code snippet: import { BrowserRouter, Routes, Route } from 'react-router-dom'; <Routes><Route path='/' element={<Layout />}><Route index element={<Home />} /><Route path='profile' element={<Profile />} /></Route></Routes>",
    summary: "Code structure for react-router-dom v6 nested routes and layout page configuration.",
    tags: ["coding", "react", "web-dev"],
    date: "Yesterday, 4:15 PM",
    views: 12,
    thumbnail: "/assets/memoryos_memory.jpg",
    ocrText: "import { BrowserRouter, Routes, Route } from 'react-router-dom';\nimport Layout from './components/Layout';\nimport Home from './pages/Home';\nimport Profile from './pages/Profile';\n\nfunction App() {\n  return (\n    <BrowserRouter>\n      <Routes>\n        <Route path=\"/\" element={<Layout />}>\n          <Route index element={<Home />} />\n          <Route path=\"profile\" element={<Profile />} />\n        </Route>\n      </Routes>\n    </BrowserRouter>\n  );\n}"
  },
  {
    id: "mem-3",
    type: "document",
    title: "Laptop Purchase Invoice",
    content: "Invoice Number: INV-2026-9821\nSeller: Apple Retail Store\nItem: MacBook Pro 16-inch M3 Pro (36GB RAM, 1TB SSD)\nTotal Amount: $2,499.00\nDate: May 12, 2026\nWarranty: 1 Year AppleCare+ included",
    summary: "Invoice and warranty specification sheet for Rohan's MacBook Pro M3.",
    tags: ["finance", "invoice", "work"],
    date: "Last month, May 12",
    views: 8,
    thumbnail: "/assets/memoryos_home.jpg"
  },
  {
    id: "mem-4",
    type: "link",
    title: "Aesthetic Web Design Inspiration",
    content: "https://awwwards.com/websites/clean/",
    summary: "Curated collection of minimalist, sleek, and high-contrast award-winning websites for design and layout reference.",
    tags: ["design", "inspiration", "bookmarks"],
    date: "3 days ago",
    views: 15
  },
  {
    id: "mem-5",
    type: "voice",
    title: "App Idea Pitch - Kario",
    content: "Audio Note: I should build Kario with a search-first interface. A central search bar at the top, horizontal scrolling quick capture options, Notion style card grids, and a smart chat prompt screen. It needs to automatically index documents and pictures and generate actions directly.",
    summary: "Audio brainstorming memo detailing Kario's search-first UX design, OCR scanner, and automatic task conversion system.",
    tags: ["ideas", "voice", "kario"],
    date: "4 days ago",
    views: 3
  },
  {
    id: "mem-6",
    type: "clipboard",
    title: "API Endpoint Snippet",
    content: "const FETCH_URL = 'https://api.kario.ai/v1/memories/sync';",
    summary: "Copied fetch code snippet containing Kario's database sync endpoint.",
    tags: ["coding", "clipboard"],
    date: "1 hour ago",
    views: 1
  },
  {
    id: "mem-7",
    type: "calendar",
    title: "Client Kickoff Meeting",
    content: "Kickoff call with Sarah & Michael. Scope: Discuss design requirements, layout milestones, local development setup, and API integration schedule. Time: 2:00 PM - 3:00 PM.",
    summary: "Calendar meeting card detailing the project layout deliverables and review meeting with Sarah & Michael.",
    tags: ["calendar", "work", "meetings"],
    date: "Today, 2:00 PM",
    views: 4
  }
];

const SEED_TASKS = [
  {
    id: "task-1",
    title: "Review laptop purchase invoice",
    description: "Check warranty status and details on Apple invoice #INV-2026-9821.",
    priority: "medium",
    dueDate: "Today",
    completed: false,
    sourceType: "document",
    sourceId: "mem-3",
    subtasks: [
      { id: "sub-1-1", text: "Confirm AppleCare details", completed: false },
      { id: "sub-1-2", text: "Download PDF to local system", completed: false }
    ]
  },
  {
    id: "task-2",
    title: "Implement React Router Config",
    description: "Translate the screenshot code from your memory into the repository's App module.",
    priority: "high",
    dueDate: "Tomorrow",
    completed: false,
    sourceType: "screenshot",
    sourceId: "mem-2",
    subtasks: [
      { id: "sub-2-1", text: "Install react-router-dom package", completed: true },
      { id: "sub-2-2", text: "Set up nested index routes", completed: false }
    ]
  },
  {
    id: "task-3",
    title: "Weekly grocery shopping",
    description: "Pick up fresh ingredients listed in the Shopping List note.",
    priority: "low",
    dueDate: "In 2 days",
    completed: false,
    sourceType: "note",
    sourceId: "mem-1",
    subtasks: []
  },
  {
    id: "task-4",
    title: "Sync client design deliverables",
    description: "Action items from Client Kickoff Meeting. Send designs to Michael.",
    priority: "high",
    dueDate: "Today",
    completed: true,
    sourceType: "calendar",
    sourceId: "mem-7",
    subtasks: [
      { id: "sub-4-1", text: "Create draft layout prototype", completed: true },
      { id: "sub-4-2", text: "Send preview links via Slack", completed: true }
    ]
  }
];

// ========================================================
// AUTHENTICATION UTILITIES
// ========================================================

export const getRegisteredUsers = () => {
  const data = localStorage.getItem("kario_users");
  return data ? JSON.parse(data) : [];
};

export const registerUser = (name, email, password) => {
  const users = getRegisteredUsers();
  const emailLower = email.toLowerCase().trim();
  
  if (users.some(u => u.email === emailLower)) {
    throw new Error("An account with this email already exists.");
  }
  
  const newUser = { name, email: emailLower, password };
  users.push(newUser);
  localStorage.setItem("kario_users", JSON.stringify(users));
  return newUser;
};

export const loginUser = (email, password) => {
  const users = getRegisteredUsers();
  const emailLower = email.toLowerCase().trim();
  const user = users.find(u => u.email === emailLower && u.password === password);
  
  if (!user) {
    throw new Error("Incorrect email or password.");
  }
  
  localStorage.setItem("kario_current_user", JSON.stringify(user));
  return user;
};

export const getCurrentUserSession = () => {
  const data = localStorage.getItem("kario_current_user");
  return data ? JSON.parse(data) : null;
};

export const logoutUser = () => {
  localStorage.removeItem("kario_current_user");
};

// ========================================================
// USER-SCOPED STORAGE ACCESSORS
// ========================================================

const getScopedKey = (baseKey) => {
  const user = getCurrentUserSession();
  const email = user ? user.email.replace(/[^a-zA-Z0-9]/g, "_") : "guest";
  return `kario_${email}_${baseKey}`;
};

export const getMemories = () => {
  const key = getScopedKey("memories");
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(SEED_MEMORIES));
    return SEED_MEMORIES;
  }
  return JSON.parse(data);
};

export const saveMemories = (memories) => {
  const key = getScopedKey("memories");
  localStorage.setItem(key, JSON.stringify(memories));
};

export const getTasks = () => {
  const key = getScopedKey("tasks");
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(SEED_TASKS));
    return SEED_TASKS;
  }
  return JSON.parse(data);
};

export const saveTasks = (tasks) => {
  const key = getScopedKey("tasks");
  localStorage.setItem(key, JSON.stringify(tasks));
};

export const getConversations = () => {
  const key = getScopedKey("conversations");
  const data = localStorage.getItem(key);
  if (!data) {
    const user = getCurrentUserSession();
    const userName = user ? user.name : "Rohan";
    const initialConv = [
      {
        id: "msg-1",
        sender: "assistant",
        text: `Hi ${userName}! I'm Kario, your personal AI assistant. I have processed 7 of your memories (notes, links, documents, calendar entries) and generated 4 tasks. You can ask me any question or tell me to search your items! Try: 'Where is my invoice?' or 'Show my coding screenshots'.`,
        time: "Just now"
      }
    ];
    localStorage.setItem(key, JSON.stringify(initialConv));
    return initialConv;
  }
  return JSON.parse(data);
};

export const saveConversations = (conversations) => {
  const key = getScopedKey("conversations");
  localStorage.setItem(key, JSON.stringify(conversations));
};

export const getUserSettings = () => {
  const user = getCurrentUserSession();
  const defaultSettings = {
    userName: user ? user.name : "Rohan",
    userEmail: user ? user.email : "rohan@kario.ai",
    theme: "light",
    aiModel: "Gemini 3.5 Flash (Default)",
    notifications: true,
    storageUsedGB: 12.4,
    storageLimitGB: 100,
    completedOnboarding: false
  };
  
  const key = getScopedKey("settings");
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
  return JSON.parse(data);
};

export const saveUserSettings = (settings) => {
  const key = getScopedKey("settings");
  localStorage.setItem(key, JSON.stringify(settings));
};

export const clearAllData = () => {
  const memoriesKey = getScopedKey("memories");
  const tasksKey = getScopedKey("tasks");
  const conversationsKey = getScopedKey("conversations");
  const settingsKey = getScopedKey("settings");
  
  // Save empty arrays to prevent re-seeding default data
  localStorage.setItem(memoriesKey, JSON.stringify([]));
  localStorage.setItem(tasksKey, JSON.stringify([]));
  
  // Clear chat logs but keep a fresh, empty-db welcome greeting
  const user = getCurrentUserSession();
  const userName = user ? user.name : "Rohan";
  const initialConv = [
    {
      id: "msg-fresh",
      sender: "assistant",
      text: `Hi ${userName}! I have cleared your database and all records have been reset. You're starting completely fresh with zero tasks and memories! What can I help you with today?`,
      time: "Just now"
    }
  ];
  localStorage.setItem(conversationsKey, JSON.stringify(initialConv));

  // Reset storage stats but preserve user settings & onboarding flag!
  const currentSettings = getUserSettings();
  const updatedSettings = {
    ...currentSettings,
    storageUsedGB: 0.0,
    completedOnboarding: true // Keep user on home screen!
  };
  localStorage.setItem(settingsKey, JSON.stringify(updatedSettings));
};
