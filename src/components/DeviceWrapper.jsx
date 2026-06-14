import React from 'react';

const DeviceWrapper = ({ children, isDarkTheme, setIsDarkTheme }) => {
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <div className="device-root">
      {/* Desktop Device Shell Wrapper */}
      <div className="device-desktop-shell">
        <div className={`device-outer ${isDarkTheme ? 'dark-device' : ''}`}>
          {/* Dynamic Physical Buttons */}
          <div className="device-btn-volume-up" onClick={() => alert("Volume Increased")}></div>
          <div className="device-btn-volume-down" onClick={() => alert("Volume Decreased")}></div>
          <div className="device-btn-power" onClick={toggleTheme} title="Toggle Light/Dark Theme"></div>
          
          {/* Notch elements */}
          <div className="device-notch-camera"></div>
          <div className="device-notch-speaker"></div>

          <div className="device-inner">
            {/* Real App Screen */}
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Screen Wrapper (for actual phones/emulators) */}
      <div className="device-mobile-fullscreen">
        {children}
      </div>
    </div>
  );
};

export default DeviceWrapper;

