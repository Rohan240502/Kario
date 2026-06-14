import React, { useState } from 'react';
import { Database, Brain, Search, ShieldCheck, ArrowRight, Check } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState({
    photos: true,
    files: true,
    notifications: false,
    microphone: false
  });

  const steps = [
    {
      title: "Store Everything",
      description: "Save notes, links, files, calendar entries, and screenshots into one central assistant memory space.",
      icon: <Database size={48} className="text-primary" />
    },
    {
      title: "AI Understands",
      description: "Our offline OCR and summarizer automatically tags, summarizes, and indexes everything you import.",
      icon: <Brain size={48} className="text-primary" />
    },
    {
      title: "Find Instantly",
      description: "Ask questions in plain English. Kario parses your memories to retrieve exact files, receipts, or notes.",
      icon: <Search size={48} className="text-primary" />
    },
    {
      title: "Set Permissions",
      description: "Enable features to get the most out of Kario on your device.",
      icon: <ShieldCheck size={48} className="text-primary" />
    }
  ];

  const handleToggle = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(permissions);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-illustrations">
        <div className="illustration-circle">
          {steps[currentStep].icon}
        </div>
      </div>

      <div className="onboarding-info">
        <h2 className="onboarding-title">{steps[currentStep].title}</h2>
        <p className="onboarding-desc">{steps[currentStep].description}</p>
        
        {currentStep === 3 && (
          <div className="permission-list">
            <div className="permission-item">
              <div className="permission-info">
                <div className="permission-details">
                  <h4>Photos & Screenshots</h4>
                  <p>Auto-import screenshots & analyze text</p>
                </div>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={permissions.photos} 
                  onChange={() => handleToggle('photos')} 
                />
                <span className="slider-round"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-info">
                <div className="permission-details">
                  <h4>File Storage</h4>
                  <p>Read invoices, PDF bills, and notes</p>
                </div>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={permissions.files} 
                  onChange={() => handleToggle('files')} 
                />
                <span className="slider-round"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-info">
                <div className="permission-details">
                  <h4>Voice Microphone</h4>
                  <p>Record voice memos and transcribe tags</p>
                </div>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={permissions.microphone} 
                  onChange={() => handleToggle('microphone')} 
                />
                <span className="slider-round"></span>
              </label>
            </div>

            <div className="permission-item">
              <div className="permission-info">
                <div className="permission-details">
                  <h4>Smart Notifications</h4>
                  <p>Get calendar summaries and reminders</p>
                </div>
              </div>
              <label className="switch-control">
                <input 
                  type="checkbox" 
                  checked={permissions.notifications} 
                  onChange={() => handleToggle('notifications')} 
                />
                <span className="slider-round"></span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="onboarding-dots">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`onboarding-dot ${index === currentStep ? 'onboarding-dot-active' : ''}`}
            ></div>
          ))}
        </div>

        <button className="onboarding-btn" onClick={handleNext}>
          {currentStep === steps.length - 1 ? (
            <>
              Get Started <Check size={18} />
            </>
          ) : (
            <>
              Next <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
