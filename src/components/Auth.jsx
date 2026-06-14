import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';
import { loginUser, registerUser } from '../utils/storage';

const Auth = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    if (isSignUp && !name) {
      setError("Please enter your name.");
      return;
    }

    try {
      if (isSignUp) {
        // Register User
        registerUser(name, email, password);
        // Automatically log in after registration
        const loggedIn = loginUser(email, password);
        onLoginSuccess(loggedIn);
      } else {
        // Log in User
        const loggedIn = loginUser(email, password);
        onLoginSuccess(loggedIn);
      }
    } catch (err) {
      setError(err.message || "An authentication error occurred.");
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      background: 'var(--bg-app)',
      overflowY: 'auto'
    }}>
      {/* Brand logo & tagline */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="illustration-circle" style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 16px auto',
          background: 'linear-gradient(135deg, var(--primary) 0%, #06b6d4 100%)',
          color: '#fff',
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.25)'
        }}>
          <Sparkles size={32} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>Kario</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Your Personal AI Assistant for Everything</p>
      </div>

      {/* Auth Card */}
      <div className="notion-card" style={{ padding: '24px', backdropFilter: 'blur(10px)', background: 'var(--bg-card)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px', textAlign: 'center' }}>
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {/* Error Alert */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--danger)',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '12px',
            marginBottom: '16px',
            lineHeight: 1.4
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name Field (Sign Up Only) */}
          {isSignUp && (
            <div className="form-group" style={{ position: 'relative' }}>
              <label>Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="form-control"
                style={{ paddingLeft: '40px' }}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                className="form-control"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="onboarding-btn" style={{ height: '48px', width: '100%', fontSize: '15px' }}>
            {isSignUp ? "Sign Up & Start" : "Sign In"}
          </button>
        </form>

        {/* Toggle Mode */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button 
            type="button"
            onClick={toggleAuthMode}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-family)',
              fontSize: '13px'
            }}
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>

      {/* Guest notice */}
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '24px', lineHeight: 1.4 }}>
        Kario runs local partitioned databases. No servers are contacted.<br />
        To simulate multiple users, register with different emails.
      </div>
    </div>
  );
};

export default Auth;
