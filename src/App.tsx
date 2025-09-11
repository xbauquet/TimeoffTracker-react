import { useState, useEffect } from 'react';
import { Calendar } from './components/calendar';
import { Menu } from './components/Menu';
import { Legend } from './components/Legend';
import { GistService, ICalService, ICalSettings, ICalEvent, EventColorService } from './services';
import { LegendColorService, LegendColorSettings } from './services/legendColorService';
import { GistSettings } from './services/gistService';
import { HolidayCalculationService } from './services/holidayCalculationService';
import './App.scss'

function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [country, setCountry] = useState('US');
  const [state, setState] = useState<string>('');
  const [gitHubSettings, setGitHubSettings] = useState<GistSettings>(() => GistService.loadSettings());
  const [icalSettings, setICalSettings] = useState<ICalSettings>(() => ICalService.loadSettings());
  const [icalEvents, setICalEvents] = useState<ICalEvent[]>([]);
  const [personalHolidays, setPersonalHolidays] = useState<Set<string>>(new Set());
  const [workDaysPerYear, setWorkDaysPerYear] = useState(216);
  const [carryoverHolidays, setCarryoverHolidays] = useState(0);
  const [legendColorSettings, setLegendColorSettings] = useState<LegendColorSettings>(() => LegendColorService.loadSettings());

  // Calculate remaining holidays using the service
  const remainingHolidays = HolidayCalculationService.calculateRemainingHolidays({
    year,
    country,
    state,
    workDaysPerYear,
    carryoverHolidays,
    personalHolidays
  }).remainingHolidays;

  // Auto-save to GitHub when data changes
  useEffect(() => {
    if (gitHubSettings.token && gitHubSettings.gistId) {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await GistService.saveToGist(
            gitHubSettings.token!,
            gitHubSettings.gistId!,
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
  }, [personalHolidays, workDaysPerYear, carryoverHolidays, year, gitHubSettings.token, gitHubSettings.gistId]);


  // Load data from GitHub when settings change or on initial load
  useEffect(() => {
    if (gitHubSettings.token && gitHubSettings.gistId) {
      loadFromGitHub();
      loadConfigurationFromGitHub();
    }
  }, [gitHubSettings.token, gitHubSettings.gistId]);

  // Load iCal events when settings change
  useEffect(() => {
    if (icalSettings.url && icalSettings.url.trim()) {
      loadICalEvents();
    } else {
      setICalEvents([]);
    }
  }, [icalSettings.url]);


  const loadFromGitHub = async () => {
    if (!gitHubSettings.token || !gitHubSettings.gistId) {
      return;
    }

    try {
      const result = await GistService.loadFromGist(gitHubSettings.token, gitHubSettings.gistId);
      
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

  const loadConfigurationFromGitHub = async () => {
    if (!gitHubSettings.token || !gitHubSettings.gistId) {
      return;
    }

    try {
      const result = await GistService.loadConfigurationFromGist(gitHubSettings.token, gitHubSettings.gistId);
      
      if (result.success && result.configuration) {
        // Load country from configuration
        if (result.configuration.country) {
          setCountry(result.configuration.country);
        }
        
        // Load legend colors from configuration
        if (result.configuration.legendColors) {
          setLegendColorSettings(result.configuration.legendColors);
        }
      } else {
        // If no configuration exists, just log it
        console.log('No configuration found in gist');
      }
    } catch (error) {
      console.error('Failed to load configuration from GitHub:', error);
    }
  };


  const loadICalEvents = async () => {
    if (!icalSettings.url || !icalSettings.url.trim()) {
      return;
    }

    try {
      const result = await ICalService.fetchEvents(icalSettings.url);
      if (result.success && result.events) {
        // Filter events for current year
        const yearEvents = result.events.filter(event => {
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

  const handleGitHubSettingsChange = (settings: GistSettings) => {
    setGitHubSettings(settings);
  };

  const handleICalSettingsChange = (settings: ICalSettings) => {
    setICalSettings(settings);
    ICalService.saveSettings(settings);
  };

  const handleLegendColorSettingsChange = (settings: LegendColorSettings) => {
    setLegendColorSettings(settings);
    LegendColorService.saveSettings(settings);
  };

  // Use actual iCal events with assigned colors
  const eventsToDisplay = EventColorService.assignColorsToEvents(icalEvents);

  return (
    <div className="app">
      <Menu 
        year={year}
        country={country}
        state={state}
        workDaysPerYear={workDaysPerYear}
        carryoverHolidays={carryoverHolidays}
        remainingHolidays={remainingHolidays}
        onYearChange={setYear}
        onCountryChange={setCountry}
        onStateChange={setState}
        onWorkDaysChange={setWorkDaysPerYear}
        onCarryoverChange={setCarryoverHolidays}
        onGitHubSettingsChange={handleGitHubSettingsChange}
        onICalSettingsChange={handleICalSettingsChange}
      />
      
      <div className="app-content">
        <main className="app-main">
          <Calendar 
            year={year}
            country={country}
            state={state}
            personalHolidays={personalHolidays}
            icalEvents={eventsToDisplay}
            legendColorSettings={legendColorSettings}
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
        
        {/* Legend */}
        <Legend
          colorSettings={legendColorSettings}
          onColorSettingsChange={handleLegendColorSettingsChange}
        />
      </div>
    </div>
  )
}

export default App
