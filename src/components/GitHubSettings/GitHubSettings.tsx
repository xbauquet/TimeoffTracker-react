import React, { useState, useEffect } from 'react';
import { GistService, GistSettings } from '../../services/gistService';
import './GitHubSettings.scss';

interface GitHubSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: GistSettings) => void;
  currentSettings: GistSettings;
}

export const GitHubSettings: React.FC<GitHubSettingsProps> = ({
  isOpen,
  onClose,
  onSettingsChange,
  currentSettings
}) => {
  const [token, setToken] = useState(currentSettings.token || '');
  const [gistId, setGistId] = useState(currentSettings.gistId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setToken(currentSettings.token || '');
      setGistId(currentSettings.gistId || '');
      setTestResult(null);
    }
  }, [isOpen, currentSettings]);

  const handleTestToken = async () => {
    if (!token.trim()) {
      setTestResult({ success: false, message: 'Please enter a token' });
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await GistService.testToken(token);
      if (result.success) {
        setTestResult({ success: true, message: `✅ Valid token! Connected as ${result.user?.login}` });
      } else {
        setTestResult({ success: false, message: `❌ ${result.error}` });
      }
    } catch (error) {
      setTestResult({ success: false, message: '❌ Connection error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!token.trim()) {
      setTestResult({ success: false, message: 'GitHub token is required' });
      return;
    }

    if (!gistId.trim()) {
      setTestResult({ success: false, message: 'Gist ID is required' });
      return;
    }

    const newSettings: GistSettings = {
      token: token.trim(),
      gistId: gistId.trim()
    };

    GistService.saveSettings(newSettings.token!, newSettings.gistId!);
    onSettingsChange(newSettings);
    onClose();
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all GitHub data? This action is irreversible.')) {
      GistService.clearSettings();
      onSettingsChange({ token: null, gistId: null });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="github-settings-overlay" onClick={onClose}>
      <div className="github-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="github-settings-header">
          <h3>GitHub Configuration Required</h3>
          <button className="github-settings-close" onClick={onClose}>×</button>
        </div>

        <div className="github-settings-content">
          <p className="github-settings-description">
            This application uses GitHub to store your holiday data securely and access it anywhere:
          </p>
          
          <ol className="github-settings-steps">
            <li>Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">GitHub Settings &gt; Personal Access Tokens</a></li>
            <li>Click "Generate new token (classic)"</li>
            <li>Check only "gist" in the permissions</li>
            <li>Copy the generated token</li>
            <li>Create a new gist on <a href="https://gist.github.com" target="_blank" rel="noopener noreferrer">gist.github.com</a> with any content</li>
            <li>Copy the gist ID from the URL (the long string after /gist/)</li>
          </ol>
          
          <div className="github-settings-form">
            <div className="github-settings-field">
              <label>GitHub Token (required):</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxx"
                className="github-settings-input"
              />
            </div>
            
            <div className="github-settings-field">
              <label>Gist ID (required):</label>
              <input
                type="text"
                value={gistId}
                onChange={(e) => setGistId(e.target.value)}
                placeholder="1234567890abcdef"
                className="github-settings-input"
                required
              />
            </div>

            {testResult && (
              <div className={`github-settings-test-result ${testResult.success ? 'success' : 'error'}`}>
                {testResult.message}
              </div>
            )}
          </div>
        </div>

        <div className="github-settings-footer">
          <button 
            className="github-settings-btn github-settings-btn-secondary"
            onClick={handleClear}
          >
            Clear All
          </button>
          <button 
            className="github-settings-btn github-settings-btn-secondary"
            onClick={handleTestToken}
            disabled={isLoading || !token.trim()}
          >
            {isLoading ? 'Testing...' : 'Test'}
          </button>
          <button 
            className="github-settings-btn github-settings-btn-primary"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitHubSettings;
