import React, { useState, useEffect } from 'react';
import { Calendar } from './components/calendar';
import { Menu } from './components/Menu';
import { GistService, GistSettings } from './services/gistService';
import './App.scss'

function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [country, setCountry] = useState('US');
  const [state, setState] = useState<string>('');
  const [gitHubSettings, setGitHubSettings] = useState<GistSettings>(() => GistService.loadSettings());
  const [personalHolidays, setPersonalHolidays] = useState<Set<string>>(new Set());
  const [workDaysPerYear, setWorkDaysPerYear] = useState(216);
  const [carryoverHolidays, setCarryoverHolidays] = useState(0);

  // Auto-save to GitHub when data changes
  useEffect(() => {
    if (gitHubSettings.token && gitHubSettings.gistId) {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await GistService.saveToGist(
            gitHubSettings.token!,
            gitHubSettings.gistId,
            year,
            Array.from(personalHolidays),
            workDaysPerYear,
            carryoverHolidays
          );
          
          if (result.success && result.gistId && result.gistId !== gitHubSettings.gistId) {
            setGitHubSettings(prev => ({ ...prev, gistId: result.gistId! }));
            GistService.saveSettings(gitHubSettings.token!, result.gistId);
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 2000); // 2 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [personalHolidays, workDaysPerYear, carryoverHolidays, year, gitHubSettings]);

  // Load data from GitHub when settings change
  useEffect(() => {
    if (gitHubSettings.token && gitHubSettings.gistId) {
      loadFromGitHub();
    }
  }, [gitHubSettings.gistId]);

  const loadFromGitHub = async () => {
    if (!gitHubSettings.token || !gitHubSettings.gistId) return;

    try {
      const result = await GistService.loadFromGist(gitHubSettings.token, gitHubSettings.gistId);
      if (result.success && result.data) {
        const yearData = result.data[year.toString()];
        if (yearData) {
          setPersonalHolidays(new Set(yearData.holidays));
          setWorkDaysPerYear(yearData.workDaysPerYear);
          setCarryoverHolidays(yearData.carryoverHolidays);
        }
      }
    } catch (error) {
      console.error('Failed to load from GitHub:', error);
    }
  };

  const handleGitHubSettingsChange = (settings: GistSettings) => {
    setGitHubSettings(settings);
  };

  return (
    <div className="app">
      <Menu 
        year={year}
        country={country}
        state={state}
        onYearChange={setYear}
        onCountryChange={setCountry}
        onStateChange={setState}
        onGitHubSettingsChange={handleGitHubSettingsChange}
      />
      
      <div className="app-content">
        <main className="app-main">
          <Calendar 
            year={year}
            country={country}
            state={state}
            personalHolidays={personalHolidays}
            onPersonalHolidayToggle={(dateKey) => {
              setPersonalHolidays(prev => {
                const newSet = new Set(prev);
                if (newSet.has(dateKey)) {
                  newSet.delete(dateKey);
                } else {
                  newSet.add(dateKey);
                }
                return newSet;
              });
            }}
          />
        </main>
      </div>
    </div>
  )
}

export default App
