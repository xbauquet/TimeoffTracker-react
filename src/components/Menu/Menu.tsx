import React, { useState } from 'react';
import { GitHubSettings } from '../GitHubSettings';
import { GistService, GistSettings } from '../../services/gistService';
import './Menu.scss';

interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  onClick?: () => void;
}

interface MenuProps {
  items?: MenuItem[];
  className?: string;
  year: number;
  country: string;
  state: string;
  onYearChange: (year: number) => void;
  onCountryChange: (country: string) => void;
  onStateChange: (state: string) => void;
  onGitHubSettingsChange?: (settings: GistSettings) => void;
}

const defaultMenuItems: MenuItem[] = [
  {
    id: 'calendar',
    label: 'Calendar',
    icon: '📅',
    onClick: () => console.log('Navigate to Calendar')
  },
  {
    id: 'holidays',
    label: 'Holidays',
    icon: '🎉',
    onClick: () => console.log('Navigate to Holidays')
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    onClick: () => console.log('Navigate to Settings')
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📊',
    onClick: () => console.log('Navigate to Reports')
  }
];

export const Menu: React.FC<MenuProps> = ({ 
  items = defaultMenuItems, 
  className = '',
  year,
  country,
  state,
  onYearChange,
  onCountryChange,
  onStateChange,
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
      
      <ul className="menu-list">
        {items.map((item) => (
          <li key={item.id} className="menu-item">
            <button 
              className="menu-button"
              onClick={item.onClick}
              type="button"
            >
              {item.icon && (
                <span className="menu-icon">{item.icon}</span>
              )}
              <span className="menu-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
      
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
        
        <div className="menu-user">
          <span className="user-avatar">👤</span>
          <span className="user-name">User</span>
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
