export const simulateOcr = (fileName, fileType) => {
  const nameLower = fileName.toLowerCase();
  
  if (nameLower.includes("invoice") || nameLower.includes("receipt") || nameLower.includes("bill")) {
    return {
      title: "Processed Invoice",
      content: `Invoice Number: INV-2026-${Math.floor(1000 + Math.random() * 9000)}\nSeller: Amazon Web Services\nItem: Monthly Cloud Storage & Compute Services\nTotal Amount: $148.50\nDate: June 10, 2026\nStatus: Paid`,
      summary: "Monthly AWS cloud hosting invoice for database backups and server hosting.",
      tags: ["finance", "invoice", "aws"],
      type: "document"
    };
  }
  
  if (nameLower.includes("code") || nameLower.includes("react") || nameLower.includes("screen") || nameLower.includes("bug")) {
    return {
      title: "React Bug Log / Snippet",
      content: "Error: Cannot update a component (`App`) while rendering a different component (`Navbar`). To locate the bad setState() call inside `Navbar`, follow the stack trace as described in...",
      summary: "React state render lifecycle warning. Indicates an illegal state change in Navbar component during the rendering phase.",
      tags: ["coding", "react", "bug-fix"],
      type: "screenshot"
    };
  }

  if (nameLower.includes("trip") || nameLower.includes("flight") || nameLower.includes("hotel") || nameLower.includes("travel")) {
    return {
      title: "Flight Confirmation",
      content: "Booking Reference: NY-LHR-98A\nPassenger: Rohan\nFlight: BA-178 New York (JFK) to London Heathrow (LHR)\nDeparture Date: July 15, 2026, 08:30 PM\nSeat: 14K (Window)\nClass: Premium Economy",
      summary: "British Airways flight details from New York JFK to London Heathrow for July 15.",
      tags: ["travel", "flight", "personal"],
      type: "document"
    };
  }

  // Generic fallback
  return {
    title: `Imported Note (${fileName.split('.')[0]})`,
    content: `Imported text content from ${fileName}. Processed successfully using Kario's background OCR scanner.`,
    summary: `Automatically parsed document from imported file ${fileName}.`,
    tags: ["imported", "general"],
    type: "note"
  };
};

export const getAssistantResponse = (query, memories, tasks) => {
  const queryLower = query.toLowerCase();
  
  // 1. Check for invoice/billing queries
  if (queryLower.includes("invoice") || queryLower.includes("receipt") || queryLower.includes("billing") || queryLower.includes("laptop")) {
    const invoiceMem = memories.find(m => m.tags.includes("invoice") || m.title.toLowerCase().includes("invoice"));
    if (invoiceMem) {
      return {
        text: `I found your MacBook Pro invoice from May 12, 2026. The total amount was **$2,499.00** from the Apple Retail Store, which includes 1 year of AppleCare+.

Here is the document details card:`,
        matchedMemories: [invoiceMem.id]
      };
    }
  }

  // 2. Check for coding or React queries
  if (queryLower.includes("react") || queryLower.includes("code") || queryLower.includes("screenshot")) {
    const matching = memories.filter(m => m.tags.includes("coding") || m.tags.includes("react") || m.type === "screenshot");
    if (matching.length > 0) {
      return {
        text: `I found **${matching.length} coding screenshots/notes** in your memory database. This includes your React Router configuration snippet and your API clipboard path.

Here are the items:`,
        matchedMemories: matching.map(m => m.id)
      };
    }
  }

  // 3. Check for travel or flights
  if (queryLower.includes("travel") || queryLower.includes("flight") || queryLower.includes("trip") || queryLower.includes("ticket")) {
    const travelMems = memories.filter(m => m.tags.includes("travel") || m.title.toLowerCase().includes("flight") || m.content.toLowerCase().includes("flight"));
    if (travelMems.length > 0) {
      return {
        text: `I found travel details in your database:`,
        matchedMemories: travelMems.map(m => m.id)
      };
    } else {
      return {
        text: "I see you're asking about travel, but I don't have any flight confirmations or trip plans saved yet. Try uploading a screenshot of your ticket or typing a flight note!",
        matchedMemories: []
      };
    }
  }

  // 4. Check for tasks queries
  if (queryLower.includes("task") || queryLower.includes("todo") || queryLower.includes("pending")) {
    const pending = tasks.filter(t => !t.completed);
    if (pending.length > 0) {
      const taskList = pending.map(t => `- **${t.title}** (Priority: ${t.priority.toUpperCase()}, Due: ${t.dueDate})`).join("\n");
      return {
        text: `You have **${pending.length} outstanding tasks** right now:\n\n${taskList}\n\nWould you like me to help you create an agenda or check any of them off?`,
        matchedMemories: []
      };
    } else {
      return {
        text: "Great news! You have completed all of your tasks. There are no outstanding items. Feel free to add new tasks or extract them from screenshots!",
        matchedMemories: []
      };
    }
  }

  // 5. Check for today's summary
  if (queryLower.includes("summarize") || queryLower.includes("today") || queryLower.includes("notes")) {
    const todayMems = memories.filter(m => m.date.toLowerCase().includes("today"));
    if (todayMems.length > 0) {
      const summaries = todayMems.map(m => `- **${m.title}** (${m.type.toUpperCase()}): ${m.summary}`).join("\n");
      return {
        text: `Here is a summary of what you have saved today, Rohan:\n\n${summaries}\n\nLet me know if you want to drill down into any specific item!`,
        matchedMemories: todayMems.map(m => m.id)
      };
    } else {
      return {
        text: "You haven't saved any new memories today. However, I can summarize your older notes or help you organize your outstanding tasks!",
        matchedMemories: []
      };
    }
  }

  // 6. Generic response based on keyword matching or general AI conversation
  return {
    text: `Based on your request, I searched your memory database.
    
I can search your screenshots for text, fetch invoices, explain coding blocks, or help plan your day. Try asking something specific, or feel free to type a reminder you'd like me to store!`,
    matchedMemories: []
  };
};

export const generateDailyPlan = (tasks, memories) => {
  const activeTasks = tasks.filter(t => !t.completed);
  
  if (activeTasks.length === 0) {
    return {
      title: "Relax & Recharge Plan ☀️",
      agenda: [
        { time: "09:00 AM", activity: "Morning review & inbox zero", detail: "Check notifications and quick clean logs" },
        { time: "11:00 AM", activity: "Coffee block & creative study", detail: "Read industry articles or design feeds" },
        { time: "02:00 PM", activity: "Health & Exercise", detail: "Go for a light jog or yoga stretch" },
        { time: "04:30 PM", activity: "Reflect & Journal", detail: "Jot down general notes for next week" }
      ],
      summary: "You have completed all scheduled tasks! Today's agenda focuses on learning, physical health, and relaxation."
    };
  }

  // Arrange agenda based on tasks priorities
  const sorted = [...activeTasks].sort((a, b) => {
    const pVal = { high: 3, medium: 2, low: 1 };
    return pVal[b.priority] - pVal[a.priority];
  });

  const agenda = [];
  let index = 0;

  // Morning focus
  if (sorted[index]) {
    agenda.push({
      time: "09:30 AM",
      activity: `Deep Work: ${sorted[index].title}`,
      detail: sorted[index].description || "High priority item focus block."
    });
    index++;
  }

  // Calendar meeting integration (simulating memory sync)
  const clientMeeting = memories.find(m => m.type === "calendar" && m.title.includes("Client"));
  if (clientMeeting) {
    agenda.push({
      time: "02:00 PM",
      activity: `Calendar: ${clientMeeting.title}`,
      detail: "Synced from calendar events details."
    });
  } else {
    agenda.push({
      time: "02:00 PM",
      activity: "Client sync / Admin hour",
      detail: "Clean up email replies, schedule reminders, update calendars"
    });
  }

  // Afternoon secondary task
  if (sorted[index]) {
    agenda.push({
      time: "03:30 PM",
      activity: `Secondary Focus: ${sorted[index].title}`,
      detail: sorted[index].description || "Work on subtasks and status reporting."
    });
    index++;
  }

  // Remaining tasks block
  if (index < sorted.length) {
    agenda.push({
      time: "05:00 PM",
      activity: "Catch-up checklist",
      detail: `Check off: ${sorted.slice(index).map(t => t.title).join(", ")}`
    });
  }

  return {
    title: "AI Optimized Focus Plan 🎯",
    agenda,
    summary: `I've prioritized your ${activeTasks.length} active tasks, placing high-priority development items in the morning peak hours and scheduling meetings in the afternoon.`
  };
};
export default {
  simulateOcr,
  getAssistantResponse,
  generateDailyPlan
};
