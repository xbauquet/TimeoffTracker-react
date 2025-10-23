import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ColorPicker } from '../ColorPicker';
import { GistService, ICalService, ICalSettings, ThemeService, Language } from '../../services';
import { Theme } from '../../services/themeService';
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
  theme: Theme;
  language: Language;
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
  const { t, i18n } = useTranslation();
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

  // Update i18n language when settings change
  useEffect(() => {
    if (settings.language !== i18n.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  const handleSave = () => {
    // Save all settings
    GistService.saveSettings(settings.gitHub.token!, settings.gitHub.gistId!);
    ICalService.saveSettings(settings.ical);
    LegendColorService.saveSettings(settings.colors);
    ThemeService.applyTheme(settings.theme);
    
    onSettingsChange(settings);
    onClose();
  };

  const handleTestGitHub = async () => {
    if (!settings.gitHub.token?.trim()) {
      setTestResult({ success: false, message: t('pleaseEnterGitHubToken') });
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
      setTestResult({ success: false, message: t('pleaseEnterICalUrl') });
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
          message: `✅ ${t('connectionSuccess')} ${eventCount} ${t('events')}.` 
        });
      } else {
        setTestResult({ 
          success: false, 
          message: `❌ ${t('connectionFailed')}: ${result.error || t('unknownError')}` 
        });
      }
    } catch (error) {
      setTestResult({ 
        success: false, 
        message: `❌ ${t('connectionFailed')}: ${error instanceof Error ? error.message : t('unknownError')}` 
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearGitHub = () => {
    if (window.confirm(t('clearGitHubConfirm'))) {
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
    setTestResult({ success: true, message: t('cacheCleared') });
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

  const handleThemeChange = (theme: Theme) => {
    setSettings(prev => ({ ...prev, theme }));
    // Apply theme immediately for preview
    ThemeService.applyTheme(theme);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay theme-${settings.theme}`} onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{t('settingsTitle')}</h2>
          <button className="modal-close" onClick={onClose} aria-label={t('close')}>
            ×
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            {t('general')}
          </button>
          <button
            className={`settings-tab ${activeTab === 'github' ? 'active' : ''}`}
            onClick={() => setActiveTab('github')}
          >
            {t('github')}
          </button>
          <button
            className={`settings-tab ${activeTab === 'ical' ? 'active' : ''}`}
            onClick={() => setActiveTab('ical')}
          >
            {t('calendar')}
          </button>
          <button
            className={`settings-tab ${activeTab === 'colors' ? 'active' : ''}`}
            onClick={() => setActiveTab('colors')}
          >
            {t('colors')}
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'general' && (
            <div className="settings-section">
              <div className="setting-group">
                <label className="setting-label">{t('language')}</label>
                <select
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value as Language)}
                  className="setting-select"
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                </select>
                <p className="setting-description">
                  {t('languageDescription')}
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">{t('country')}</label>
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
                  {t('countryDescription')}
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">{t('theme')}</label>
                <div className="theme-toggle">
                  <button
                    className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <span className="theme-icon">☀️</span>
                    {t('light')}
                  </button>
                  <button
                    className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <span className="theme-icon">🌙</span>
                    {t('dark')}
                  </button>
                </div>
                <p className="setting-description">
                  {t('themeDescription')}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="settings-section">
              <div className="setting-group">
                <label className="setting-label">{t('githubToken')}</label>
                <input
                  type="password"
                  value={settings.gitHub.token || ''}
                  onChange={(e) => updateSetting('gitHub', { ...settings.gitHub, token: e.target.value })}
                  placeholder="ghp_xxxxxxxxxxxxxxxx"
                  className="setting-input"
                />
                <p className="setting-description">
                  {t('githubTokenDescription')}
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">{t('gistId')}</label>
                <input
                  type="text"
                  value={settings.gitHub.gistId || ''}
                  onChange={(e) => updateSetting('gitHub', { ...settings.gitHub, gistId: e.target.value })}
                  placeholder="1234567890abcdef"
                  className="setting-input"
                />
                <p className="setting-description">
                  {t('gistIdDescription')}
                </p>
              </div>

              <div className="setting-group">
                <div className="button-group">
                  <button
                    onClick={handleTestGitHub}
                    disabled={isTesting || !settings.gitHub.token?.trim()}
                    className="test-button"
                  >
                    {isTesting ? t('testing') : t('testConnection')}
                  </button>
                  <button
                    onClick={handleClearGitHub}
                    className="clear-button"
                  >
                    {t('clearAll')}
                  </button>
                </div>
              </div>

              <div className="github-help">
                <h4>{t('githubHelpTitle')}</h4>
                <ol>
                  {(t('githubHelpSteps', { returnObjects: true }) as string[]).map((step: string, index: number) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: step }} />
                  ))}
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'ical' && (
            <div className="settings-section">
              <div className="setting-group">
                <label className="setting-label">{t('icalUrl')}</label>
                <input
                  type="url"
                  value={settings.ical.url || ''}
                  onChange={(e) => updateSetting('ical', { ...settings.ical, url: e.target.value })}
                  placeholder="https://calendar.google.com/calendar/ical/... or webcal://..."
                  className="setting-input"
                />
                <p className="setting-description">
                  {t('icalUrlDescription')}
                </p>
              </div>

              <div className="setting-group">
                <div className="button-group">
                  <button
                    onClick={handleTestICal}
                    disabled={isTesting || !settings.ical.url?.trim()}
                    className="test-button"
                  >
                    {isTesting ? t('testing') : t('testICalConnection')}
                  </button>
                  <button
                    onClick={handleClearCache}
                    className="clear-cache-button"
                  >
                    {t('clearCache')}
                  </button>
                  <button
                    onClick={handleClearICal}
                    className="clear-button"
                  >
                    {t('clearUrl')}
                  </button>
                </div>
              </div>

              <div className="url-examples">
                <h4>{t('icalExamplesTitle')}</h4>
                <ul>
                  <li><strong>{t('googleCalendar')}:</strong> https://calendar.google.com/calendar/ical/...</li>
                  <li><strong>{t('outlook')}:</strong> https://outlook.live.com/calendar/0/...</li>
                  <li><strong>{t('iCloud')}:</strong> webcal://p126-caldav.icloud.com/...</li>
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
                      {key === 'normal' && t('normalDayColor')}
                      {key === 'weekend' && t('weekendColor')}
                      {key === 'holiday' && t('holidayColor')}
                      {key === 'holidayWeekend' && t('holidayWeekendColor')}
                      {key === 'personalHoliday' && t('personalHolidayColor')}
                      {key === 'icalEvents' && t('icalEventsColor')}
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
            {t('cancel')}
          </button>
          <button className="modal-button primary" onClick={handleSave}>
            {t('saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
