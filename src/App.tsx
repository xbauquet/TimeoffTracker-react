import { useState, useEffect } from 'react';
import { Calendar } from './components/calendar';
import { Menu } from './components/Menu';
import { SettingsService, ICalEvent, EventColorService, GistService, ThemeService } from './services';
import { ICalService } from './services/icalService';
import { AllSettings } from './components/SettingsModal';
import { HolidayCalculationService } from './services/holidayCalculationService';
import './App.scss'

function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [settings, setSettings] = useState<AllSettings>(() => SettingsService.loadSettings());
  const [icalEvents, setICalEvents] = useState<ICalEvent[]>([]);
  const [personalHolidays, setPersonalHolidays] = useState<Set<string>>(new Set());
  const [workDaysPerYear, setWorkDaysPerYear] = useState(216);
  const [carryoverHolidays, setCarryoverHolidays] = useState(0);

  // Load settings with gist configuration on mount
  useEffect(() => {
    const loadSettingsWithGist = async () => {
      const settingsWithGist = await SettingsService.loadSettingsWithGist();
      setSettings(settingsWithGist);
      // Apply the theme immediately after loading settings
      ThemeService.applyTheme(settingsWithGist.theme);
    };
    
    loadSettingsWithGist();
  }, []);

  // Initialize theme on app start
  useEffect(() => {
    ThemeService.initializeTheme();
  }, []);

  // Calculate remaining holidays using the service
  const remainingHolidays = HolidayCalculationService.calculateRemainingHolidays({
    year,
    country: settings.country,
    state: '',
    workDaysPerYear,
    carryoverHolidays,
    personalHolidays
  }).remainingHolidays;

  // Auto-save to GitHub when data changes
  useEffect(() => {
    if (settings.gitHub.token && settings.gitHub.gistId) {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await GistService.saveToGist(
            settings.gitHub.token!,
            settings.gitHub.gistId!,
            year,
            Array.from(personalHolidays),
            workDaysPerYear,
            carryoverHolidays
          );
          
          if (!result.success) {
            console.error('Auto-save failed:', result.error);
          }
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 2000); // 2 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [personalHolidays, workDaysPerYear, carryoverHolidays, year, settings.gitHub.token, settings.gitHub.gistId]);


  // Load data from GitHub when settings change or on initial load
  useEffect(() => {
    if (settings.gitHub.token && settings.gitHub.gistId) {
      loadFromGitHub();
    }
  }, [settings.gitHub.token, settings.gitHub.gistId]);

  // Load iCal events when settings change
  useEffect(() => {
    if (settings.ical.url && settings.ical.url.trim()) {
      loadICalEvents();
    } else {
      setICalEvents([]);
    }
  }, [settings.ical.url]);


  const loadFromGitHub = async () => {
    if (!settings.gitHub.token || !settings.gitHub.gistId) {
      return;
    }

    try {
      const result = await GistService.loadFromGist(settings.gitHub.token, settings.gitHub.gistId);
      
      if (result.success && result.data) {
        let yearData = result.data[year.toString()];
        
        // If no data for current year, try to find the most recent year's data
        if (!yearData) {
          const availableYears = Object.keys(result.data).sort((a, b) => parseInt(b) - parseInt(a));
          if (availableYears.length > 0) {
            const mostRecentYear = availableYears[0];
            yearData = result.data[mostRecentYear];
            setYear(parseInt(mostRecentYear));
          }
        }
        
        if (yearData && 'holidays' in yearData) {
          setPersonalHolidays(new Set(yearData.holidays));
          setWorkDaysPerYear(yearData.workDaysPerYear);
          setCarryoverHolidays(yearData.carryoverHolidays);
        }
      } else {
        console.error('Failed to load gist data:', result.error);
      }
    } catch (error) {
      console.error('Failed to load from GitHub:', error);
    }
  };



  const loadICalEvents = async () => {
    if (!settings.ical.url || !settings.ical.url.trim()) {
      return;
    }

    try {
      const result = await ICalService.fetchEvents(settings.ical.url);
      if (result.success && result.events) {
        // Filter events for current year
        const yearEvents = result.events.filter((event: ICalEvent) => {
          const eventYear = new Date(event.startDate).getFullYear();
          return eventYear === year;
        });
        setICalEvents(yearEvents);
      } else {
        console.error('Failed to load iCal events:', result.error);
        setICalEvents([]);
      }
    } catch (error) {
      console.error('Failed to load iCal events:', error);
      setICalEvents([]);
    }
  };

  const handleSettingsChange = async (newSettings: AllSettings) => {
    setSettings(newSettings);
    await SettingsService.saveSettings(newSettings);
  };

  // Use actual iCal events with assigned colors
  const eventsToDisplay = EventColorService.assignColorsToEvents(icalEvents);

  return (
    <div className="app">
      <Menu 
        year={year}
        workDaysPerYear={workDaysPerYear}
        carryoverHolidays={carryoverHolidays}
        remainingHolidays={remainingHolidays}
        legendColorSettings={settings.colors}
        onYearChange={setYear}
        onWorkDaysChange={setWorkDaysPerYear}
        onCarryoverChange={setCarryoverHolidays}
        onSettingsChange={handleSettingsChange}
      />
      
      <div className="app-content">
        <main className="app-main">
          <Calendar 
            year={year}
            country={settings.country}
            state=""
            personalHolidays={personalHolidays}
            icalEvents={eventsToDisplay}
            legendColorSettings={settings.colors}
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
