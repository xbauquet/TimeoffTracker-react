import React, { useState, useEffect } from 'react';
import { ICalSettings, ICalService } from '../../services';
import './ICalSettingsModal.scss';

interface ICalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: ICalSettings) => void;
  currentSettings: ICalSettings;
}

interface TestResult {
  success: boolean;
  message: string;
}

const ICalSettingsModal: React.FC<ICalSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}) => {
  const [url, setUrl] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUrl(currentSettings.url);
      setEnabled(currentSettings.enabled);
      setRefreshInterval(currentSettings.refreshInterval);
      setTestResult(null);
    }
  }, [isOpen, currentSettings]);

  const handleSave = () => {
    if (enabled && !url.trim()) {
      setTestResult({ success: false, message: 'iCal URL is required when enabled' });
      return;
    }

    const newSettings: ICalSettings = {
      url: url.trim(),
      enabled,
      refreshInterval
    };

    ICalService.saveSettings(newSettings);
    onSettingsChange(newSettings);
    onClose();
  };

  const handleTest = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: 'Please enter an iCal URL' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await ICalService.fetchEvents(url.trim());
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

  const handleClearCache = () => {
    ICalService.clearCache();
    setTestResult({ success: true, message: 'Cache cleared successfully' });
  };

  const handleClear = () => {
    setUrl('');
    setEnabled(false);
    setRefreshInterval(30);
    setTestResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">iCal Integration Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="setting-group">
            <label className="setting-label">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              Enable iCal integration
            </label>
            <p className="setting-description">
              Display events from your iCal calendar alongside holidays
            </p>
          </div>

          {enabled && (
            <>
              <div className="setting-group">
                <label className="setting-label">
                  iCal URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/ical/... or webcal://..."
                  className="url-input"
                />
                <p className="setting-description">
                  Enter the public iCal URL of your calendar. Supports both https:// and webcal:// URLs. This is stored locally and not synced.
                </p>
                <div className="url-examples">
                  <p className="example-title">Popular calendar URLs:</p>
                  <ul className="example-list">
                    <li><strong>Google Calendar:</strong> https://calendar.google.com/calendar/ical/...</li>
                    <li><strong>Outlook:</strong> https://outlook.live.com/calendar/0/...</li>
                    <li><strong>iCloud:</strong> webcal://p126-caldav.icloud.com/...</li>
                  </ul>
                </div>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  Refresh Interval
                </label>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  className="refresh-select"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={240}>4 hours</option>
                </select>
                <p className="setting-description">
                  How often to refresh events from the iCal URL
                </p>
              </div>

              <div className="setting-group">
                <div className="button-group">
                  <button
                    onClick={handleTest}
                    disabled={isTesting || !url.trim()}
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
                </div>
                
                {testResult && (
                  <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                    {testResult.message}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="modal-button secondary" onClick={handleClear}>
            Clear
          </button>
          <div className="modal-button-group">
            <button className="modal-button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="modal-button primary" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ICalSettingsModal;
