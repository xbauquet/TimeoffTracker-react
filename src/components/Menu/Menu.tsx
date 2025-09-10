import React, { useState } from 'react';
import { GitHubSettings } from '../GitHubSettings';
import { GistService, GistSettings } from '../../services/gistService';
import './Menu.scss';

interface MenuProps {
  className?: string;
  year: number;
  country: string;
  state: string;
  workDaysPerYear: number;
  carryoverHolidays: number;
  remainingHolidays: number;
  onYearChange: (year: number) => void;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onWorkDaysChange: (workDays: number) => void;
  onCarryoverChange: (carryover: number) => void;
  onGitHubSettingsChange?: (settings: GistSettings) => void;
}

export const Menu: React.FC<MenuProps> = ({ 
  className = '',
  year,
  country,
  state,
  workDaysPerYear,
  carryoverHolidays,
  remainingHolidays,
  onYearChange,
  onCountryChange,
  onStateChange,
  onWorkDaysChange,
  onCarryoverChange,
  onGitHubSettingsChange
}) => {
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [gitHubSettings, setGitHubSettings] = useState<GistSettings>(() => GistService.loadSettings());
  return (
    <nav className={`menu ${className}`}>
      <div className="menu-header">
        <h2 className="menu-title">Timeoff Tracker</h2>
      </div>
      
      <div className="menu-controls">
        <div className="menu-control-group">
          <label className="menu-control-label">Year:</label>
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
        
        <div className="menu-control-group">
          <label className="menu-control-label">Country:</label>
          <select 
            value={country} 
            onChange={(e) => onCountryChange(e.target.value)}
            className="menu-control-select"
          >
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
            <option value="FR">France</option>
            <option value="DE">Germany</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>
      
      <div className="menu-work-settings">
        <div className="menu-control-group">
          <label className="menu-control-label">Jours de travail:</label>
          <input 
            type="number" 
            value={workDaysPerYear} 
            onChange={(e) => onWorkDaysChange(parseInt(e.target.value) || 216)}
            className="menu-control-input"
            min="200"
            max="260"
          />
        </div>
        
        <div className="menu-control-group">
          <label className="menu-control-label">Congés N-1:</label>
          <input 
            type="number" 
            value={carryoverHolidays} 
            onChange={(e) => onCarryoverChange(parseInt(e.target.value) || 0)}
            className="menu-control-input"
            min="0"
            max="50"
          />
        </div>
      </div>
      
      <div className="menu-holiday-counter">
        <div className="holiday-counter-item">
          <div className="holiday-counter-value">{remainingHolidays}</div>
          <div className="holiday-counter-label">Congés restants</div>
        </div>
      </div>
      
      <div className="menu-footer">
        <div className="menu-github-section">
          <div className="menu-github-status">
            <span className={`github-status ${GistService.getStatus(gitHubSettings).status}`}>
              {GistService.getStatus(gitHubSettings).message}
            </span>
          </div>
          <button 
            className="menu-github-btn"
            onClick={() => setShowGitHubSettings(true)}
            title="GitHub Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      <GitHubSettings
        isOpen={showGitHubSettings}
        onClose={() => setShowGitHubSettings(false)}
        onSettingsChange={(settings) => {
          setGitHubSettings(settings);
          onGitHubSettingsChange?.(settings);
        }}
        currentSettings={gitHubSettings}
      />
    </nav>
  );
};

export default Menu;
