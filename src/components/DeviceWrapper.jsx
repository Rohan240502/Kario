import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

const DeviceWrapper = ({ children, isDarkTheme, setIsDarkTheme }) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className={`device-outer ${isDarkTheme ? 'dark-device' : ''}`}>
      {/* Dynamic Physical Buttons */}
      <div className="device-btn-volume-up" onClick={() => alert("Volume Increased")}></div>
      <div className="device-btn-volume-down" onClick={() => alert("Volume Decreased")}></div>
      <div className="device-btn-power" onClick={toggleTheme} title="Toggle Light/Dark Theme"></div>
      
      {/* Notch elements */}
      <div className="device-notch-camera"></div>
      <div className="device-notch-speaker"></div>

      <div className="device-inner">
        {/* Status Bar */}
        <div className="status-bar">
          <span className="status-bar-time">{time}</span>
          <div className="status-bar-icons">
            <Signal size={13} fill="currentColor" strokeWidth={2.5} />
            <Wifi size={13} strokeWidth={2.5} />
            <Battery size={16} fill="currentColor" strokeWidth={2} style={{ transform: 'rotate(0deg)', verticalAlign: 'middle' }} />
          </div>
        </div>

        {/* Real App Screen */}
        {children}
      </div>
    </div>
  );
};

export default DeviceWrapper;
