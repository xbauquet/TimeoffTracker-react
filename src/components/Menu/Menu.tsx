import React, { useState, useEffect } from 'react';
import { SettingsModal, AllSettings } from '../SettingsModal';
import { Legend } from '../Legend';
import { SettingsService } from '../../services';
import './Menu.scss';

interface MenuProps {
  className?: string;
  year: number;
  workDaysPerYear: number;
  carryoverHolidays: number;
  remainingHolidays: number;
  legendColorSettings?: any;
  onYearChange: (year: number) => void;
  onWorkDaysChange: (workDays: number) => void;
  onCarryoverChange: (carryover: number) => void;
  onSettingsChange: (settings: AllSettings) => void;
}

export const Menu: React.FC<MenuProps> = ({ 
  className = '',
  year,
  workDaysPerYear,
  carryoverHolidays,
  remainingHolidays,
  legendColorSettings,
  onYearChange,
  onWorkDaysChange,
  onCarryoverChange,
  onSettingsChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<AllSettings>(() => SettingsService.loadSettings());

  // Reload settings from gist when modal opens
  useEffect(() => {
    if (showSettings) {
      const reloadSettings = async () => {
        const freshSettings = await SettingsService.loadSettingsWithGist();
        setSettings(freshSettings);
      };
      reloadSettings();
    }
  }, [showSettings]);
  return (
    <>
      <nav className={`menu ${className}`}>
        <div className="menu-header">
          <h2 className="menu-title">Timeoff Tracker</h2>
        </div>
        
        <div className="menu-controls">
          <div className="menu-control-group">
            <div className="year-control">
              <button 
                className="year-button"
                onClick={() => onYearChange(year - 1)}
                type="button"
                aria-label="Previous year"
              >
                ‹
              </button>
              <span className="year-display">{year}</span>
              <button
                className="year-button"
                onClick={() => onYearChange(year + 1)}
                type="button"
                aria-label="Next year"
              >
                ›
              </button>
            </div>
          </div>
          
          <div className="menu-holiday-counter">
            <div className="holiday-counter-item">
              <div className="holiday-counter-value">{remainingHolidays}</div>
              <div className="holiday-counter-label">Congés restants</div>
            </div>
          </div>
          
          {/* Legend */}
          {legendColorSettings && (
            <div className="menu-legend">
              <Legend colorSettings={legendColorSettings} />
            </div>
          )}
        </div>
        
        <div className="menu-footer">
            <div className="menu-section">
              <label className="menu-status">Jours de travail</label>
              <input
                  type="number"
                  value={workDaysPerYear}
                  onChange={(e) => onWorkDaysChange(parseInt(e.target.value) || 216)}
                  className="menu-control-input"
                  min="200"
                  max="260"
              />
            </div>

            <div className="menu-section">
              <label className="menu-status">Congés N-1</label>
              <input
                  type="number"
                  value={carryoverHolidays}
                  onChange={(e) => onCarryoverChange(parseInt(e.target.value) || 0)}
                  className="menu-control-input"
                  min="0"
                  max="50"
              />
            </div>

          <button
              className="menu-section settings-button"
              onClick={() => setShowSettings(true)}
              title="Settings"
          >
            <div className="menu-status">
              <span className="settings-status">Settings</span>
            </div>
            <div>
              &gt;
            </div>
          </button>
        </div>
      </nav>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChange={(newSettings) => {
          setSettings(newSettings);
          onSettingsChange(newSettings);
        }}
        currentSettings={settings}
      />
    </>
  );
};

export default Menu;
