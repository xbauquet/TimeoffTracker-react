import React, { useState, useEffect } from 'react';
import { ColorPicker } from '../ColorPicker';
import { GistService, ICalService, ICalSettings } from '../../services';
import { LegendColorService, LegendColorSettings } from '../../services/legendColorService';
import { GistSettings } from '../../services/gistService';
import './SettingsModal.scss';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: AllSettings) => void;
  currentSettings: AllSettings;
}

export interface AllSettings {
  country: string;
  gitHub: GistSettings;
  ical: ICalSettings;
  colors: LegendColorSettings;
}

interface TestResult {
  success: boolean;
  message: string;
}

const COUNTRY_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'IT', label: 'Italy' },
  { value: 'ES', label: 'Spain' },
  { value: 'NL', label: 'Netherlands' },
  { value: 'BE', label: 'Belgium' }
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'github' | 'ical' | 'colors'>('general');
  const [settings, setSettings] = useState<AllSettings>(currentSettings);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
      setTestResult(null);
    }
  }, [isOpen, currentSettings]);

  const handleSave = () => {
    // Save all settings
    GistService.saveSettings(settings.gitHub.token!, settings.gitHub.gistId!);
    ICalService.saveSettings(settings.ical);
    LegendColorService.saveSettings(settings.colors);
    
    onSettingsChange(settings);
    onClose();
  };

  const handleTestGitHub = async () => {
    if (!settings.gitHub.token?.trim()) {
      setTestResult({ success: false, message: 'Please enter a GitHub token' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await GistService.testToken(settings.gitHub.token);
      if (result.success) {
        setTestResult({ success: true, message: `✅ Valid token! Connected as ${result.user?.login}` });
      } else {
        setTestResult({ success: false, message: `❌ ${result.error}` });
      }
    } catch (error) {
      setTestResult({ success: false, message: '❌ Connection error' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestICal = async () => {
    if (!settings.ical.url?.trim()) {
      setTestResult({ success: false, message: 'Please enter an iCal URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await ICalService.fetchEvents(settings.ical.url);
      if (result.success) {
        const eventCount = result.events?.length || 0;
        setTestResult({ 
          success: true, 
          message: `✅ Successfully connected! Found ${eventCount} events.` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: `❌ Connection failed: ${result.error || 'Unknown error'}` 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearGitHub = () => {
    if (window.confirm('Are you sure you want to clear all GitHub data? This action is irreversible.')) {
      GistService.clearSettings();
      setSettings(prev => ({
        ...prev,
        gitHub: { token: null, gistId: null }
      }));
    }
  };

  const handleClearICal = () => {
    setSettings(prev => ({
      ...prev,
      ical: { url: '' }
    }));
    setTestResult(null);
  };

  const handleClearCache = () => {
    ICalService.clearCache();
    setTestResult({ success: true, message: 'Cache cleared successfully' });
  };

  const updateSetting = <K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateColorSetting = (key: keyof LegendColorSettings, color: string) => {
    setSettings(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: color }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`settings-tab ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
          >
            GitHub
          </button>
          <button
            className={`settings-tab ${activeTab === 'ical' ? 'active' : ''}`}
            onClick={() => setActiveTab('ical')}
          >
            Calendar
          </button>
          <button
            className={`settings-tab ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            Colors
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="setting-group">
                <label className="setting-label">Country</label>
                <select
                  value={settings.country}
                  onChange={(e) => updateSetting('country', e.target.value)}
                  className="setting-select"
                >
                  {COUNTRY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="setting-description">
                  Select your country to automatically load national holidays.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="settings-section">
              <div className="setting-group">
                <label className="setting-label">GitHub Token (required)</label>
                <input
                  type="password"
                  value={settings.gitHub.token || ''}
                  onChange={(e) => updateSetting('gitHub', { ...settings.gitHub, token: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxx"
                  className="setting-input"
                />
                <p className="setting-description">
                  Your GitHub personal access token with gist permissions.
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">Gist ID (required)</label>
                <input
                  type="text"
                  value={settings.gitHub.gistId || ''}
                  onChange={(e) => updateSetting('gitHub', { ...settings.gitHub, gistId: e.target.value })}
                  placeholder="1234567890abcdef"
                  className="setting-input"
                />
                <p className="setting-description">
                  The ID of the gist where your data will be stored.
                </p>
              </div>

              <div className="setting-group">
                <div className="button-group">
                  <button
                    onClick={handleTestGitHub}
                    disabled={isTesting || !settings.gitHub.token?.trim()}
                    className="test-button"
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={handleClearGitHub}
                    className="clear-button"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="github-help">
                <h4>How to set up GitHub integration:</h4>
                <ol>
                  <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Settings &gt; Personal Access Tokens</a></li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Check only "gist" in the permissions</li>
                  <li>Copy the generated token</li>
                  <li>Create a new gist on <a href="https://gist.github.com" target="_blank" rel="noopener noreferrer">gist.github.com</a> with any content</li>
                  <li>Copy the gist ID from the URL (the long string after /gist/)</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'ical' && (
            <div className="settings-section">
              <div className="setting-group">
                <label className="setting-label">iCal URL</label>
                <input
                  type="url"
                  value={settings.ical.url || ''}
                  onChange={(e) => updateSetting('ical', { ...settings.ical, url: e.target.value })}
                  placeholder="https://calendar.google.com/calendar/ical/... or webcal://..."
                  className="setting-input"
                />
                <p className="setting-description">
                  Enter the public iCal URL of your calendar. Events will be automatically loaded when a URL is provided.
                </p>
              </div>

              <div className="setting-group">
                <div className="button-group">
                  <button
                    onClick={handleTestICal}
                    disabled={isTesting || !settings.ical.url?.trim()}
                    className="test-button"
                  >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="clear-cache-button"
                  >
                    Clear Cache
                  </button>
                  <button
                    onClick={handleClearICal}
                    className="clear-button"
                  >
                    Clear URL
                  </button>
                </div>
              </div>

              <div className="url-examples">
                <h4>Popular calendar URLs:</h4>
                <ul>
                  <li><strong>Google Calendar:</strong> https://calendar.google.com/calendar/ical/...</li>
                  <li><strong>Outlook:</strong> https://outlook.live.com/calendar/0/...</li>
                  <li><strong>iCloud:</strong> webcal://p126-caldav.icloud.com/...</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="settings-section">
              <div className="color-settings">
                {Object.entries(settings.colors).map(([key, color]) => (
                  <div key={key} className="color-setting">
                    <label className="color-label">
                      {key === 'normal' && 'Normal Day'}
                      {key === 'weekend' && 'Weekend'}
                      {key === 'holiday' && 'Holiday'}
                      {key === 'holidayWeekend' && 'Holiday (Weekend)'}
                      {key === 'personalHoliday' && 'Personal Holiday'}
                      {key === 'icalEvents' && 'iCal Events'}
                    </label>
                    <ColorPicker
                      selectedColor={color}
                      onColorChange={(newColor) => updateColorSetting(key as keyof LegendColorSettings, newColor)}
                      colors={LegendColorService.getColorOptions()}
                      className="color-picker-inline"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="modal-button primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
