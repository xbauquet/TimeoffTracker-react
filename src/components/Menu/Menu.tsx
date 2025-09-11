import React, { useState } from 'react';
import { GitHubSettings } from '../GitHubSettings';
import { ICalSettingsModal } from '../ICalSettingsModal';
import { GistService, ICalService, ICalSettings as ICalSettingsType } from '../../services';
import { GistSettings } from '../../services/gistService';
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
  onICalSettingsChange?: (settings: ICalSettingsType) => void;
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
  onGitHubSettingsChange,
  onICalSettingsChange
}) => {
  const [showGitHubSettings, setShowGitHubSettings] = useState(false);
  const [showICalSettings, setShowICalSettings] = useState(false);
  const [gitHubSettings, setGitHubSettings] = useState<GistSettings>(() => GistService.loadSettings());
  const [icalSettings, setICalSettings] = useState<ICalSettingsType>(() => ICalService.loadSettings());
  return (
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
      </div>
      
      <div className="menu-footer">
          <div className="menu-section">
            <label className="menu-status">Country</label>
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
            className="menu-section"
            onClick={() => setShowGitHubSettings(true)}
            title="GitHub Settings"
        >
          <div className="menu-status">
            <span className={`github-status ${GistService.getStatus(gitHubSettings).status}`}>
              {GistService.getStatus(gitHubSettings).message}
            </span>
          </div>
          <div>
            &gt;
          </div>
        </button>
        <button
            className="menu-section"
            onClick={() => setShowICalSettings(true)}
          title="iCal Settings"
        >
          <div className="menu-status">
            <span className={`integration-status ${icalSettings.url && icalSettings.url.trim() ? 'connected' : 'disconnected'}`}>
              {icalSettings.url && icalSettings.url.trim() ? 'Calendar ✅' : 'Calendar ❌'}
            </span>
          </div>
          <div>
            &gt;
          </div>
        </button>
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

      <ICalSettingsModal
        isOpen={showICalSettings}
        onClose={() => setShowICalSettings(false)}
        onSettingsChange={(settings) => {
          setICalSettings(settings);
          onICalSettingsChange?.(settings);
        }}
        currentSettings={icalSettings}
      />
    </nav>
  );
};

export default Menu;
