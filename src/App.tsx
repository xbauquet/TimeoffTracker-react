import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from './components/calendar';
import { Menu } from './components/Menu';
import { SettingsService, ICalEvent, EventColorService, GistService, ThemeService, Language } from './services';
import { ICalService } from './services/icalService';
import { AllSettings } from './components/SettingsModal';
import { HolidayCalculationService } from './services/holidayCalculationService';
import './App.scss'

const LOCAL_DATA_KEY = 'timeoffTrackerLocalData';

interface LocalYearData {
  holidays: string[];
  workDaysPerYear: number;
  carryoverHolidays: number;
}

function loadLocalData(): Record<string, LocalYearData> | null {
  try {
    const stored = localStorage.getItem(LOCAL_DATA_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocalData(year: number, holidays: string[], workDaysPerYear: number, carryoverHolidays: number): void {
  try {
    const local = loadLocalData() || {};
    local[year.toString()] = { holidays, workDaysPerYear, carryoverHolidays };
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(local));
  } catch (e) {
    console.error('Failed to save local data', e);
  }
}

function App() {
  const { i18n } = useTranslation();
  const [year, setYear] = useState(new Date().getFullYear());
  const [settings, setSettings] = useState<AllSettings>(() => SettingsService.loadSettings());
  const [icalEvents, setICalEvents] = useState<ICalEvent[]>([]);
  const [personalHolidays, setPersonalHolidays] = useState<Set<string>>(new Set());
  const [workDaysPerYear, setWorkDaysPerYear] = useState(216);
  const [carryoverHolidays, setCarryoverHolidays] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoadingFromGist, setIsLoadingFromGist] = useState(false);
  const lastSavedDataRef = useRef<{ year: number; holidays: string[]; workDays: number; carryover: number } | null>(null);

  // Load settings with gist configuration on mount
  useEffect(() => {
    const loadSettingsWithGist = async () => {
      const settingsWithGist = await SettingsService.loadSettingsWithGist();
      setSettings(settingsWithGist);
      // Apply the theme immediately after loading settings
      ThemeService.applyTheme(settingsWithGist.theme);
      // Initialize i18n language
      i18n.changeLanguage(settingsWithGist.language);
    };
    
    loadSettingsWithGist();
  }, [i18n]);

  // Initialize theme on app start
  useEffect(() => {
    ThemeService.initializeTheme();
  }, []);

  // Load from localStorage when GitHub is not configured
  useEffect(() => {
    if (settings.gitHub.token && settings.gitHub.gistId) return;
    const local = loadLocalData();
    if (!local) return;
    const allHolidays = new Set<string>();
    Object.values(local).forEach(yd => {
      if (yd && Array.isArray(yd.holidays)) yd.holidays.forEach(d => allHolidays.add(d));
    });
    setPersonalHolidays(allHolidays);
    const current = local[year.toString()];
    if (current) {
      setWorkDaysPerYear(current.workDaysPerYear ?? 216);
      setCarryoverHolidays(current.carryoverHolidays ?? 0);
    }
  }, [settings.gitHub.token, settings.gitHub.gistId, year]);

  // Filter personal holidays to only include dates from the current year
  const personalHolidaysForYear = useMemo(() => {
    const yearStr = year.toString();
    return new Set(
      Array.from(personalHolidays).filter(dateKey => dateKey.startsWith(yearStr))
    );
  }, [personalHolidays, year]);

  // Calculate remaining holidays using the service
  const remainingHolidays = useMemo(() => {
    return HolidayCalculationService.calculateRemainingHolidays({
      year,
      country: settings.country,
      state: '',
      workDaysPerYear,
      carryoverHolidays,
      personalHolidays: personalHolidaysForYear
    }).remainingHolidays;
  }, [year, settings.country, workDaysPerYear, carryoverHolidays, personalHolidaysForYear]);

  // Convert personalHolidays Set to a string for dependency tracking
  const personalHolidaysKey = useMemo(() => {
    const yearStr = year.toString();
    const holidaysForYear = Array.from(personalHolidays)
      .filter(dateKey => dateKey.startsWith(yearStr))
      .sort()
      .join(',');
    return `${year}:${holidaysForYear}`;
  }, [personalHolidays, year]);

  // Auto-save to GitHub when data changes
  useEffect(() => {
    // Don't save if we're currently loading from gist
    if (isLoadingFromGist || !settings.gitHub.token || !settings.gitHub.gistId) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        // Filter holidays to only include dates from the current year
        const yearStr = year.toString();
        const holidaysForYear = Array.from(personalHolidays)
          .filter(dateKey => dateKey.startsWith(yearStr))
          .sort();
        
        // Check if data actually changed
        const lastSaved = lastSavedDataRef.current;
        const holidaysChanged = !lastSaved || 
          JSON.stringify(lastSaved.holidays) !== JSON.stringify(holidaysForYear);
        const workDaysChanged = !lastSaved || lastSaved.workDays !== workDaysPerYear;
        const carryoverChanged = !lastSaved || lastSaved.carryover !== carryoverHolidays;
        const yearChanged = !lastSaved || lastSaved.year !== year;
        
        if (!holidaysChanged && !workDaysChanged && !carryoverChanged && !yearChanged) {
          // No changes, skip save
          return;
        }
        
        console.log('Auto-saving holidays for year', year, ':', holidaysForYear);
        
        const result = await GistService.saveToGist(
          settings.gitHub.token!,
          settings.gitHub.gistId!,
          year,
          holidaysForYear,
          workDaysPerYear,
          carryoverHolidays
        );
        
        if (!result.success) {
          if (result.error?.includes('rate limit')) {
            console.warn('Rate limit exceeded, will retry later. Please wait a few minutes before making more changes.');
          } else {
            console.error('Auto-save failed:', result.error);
          }
        } else {
          console.log('Auto-save successful for year', year);
          // Update last saved data
          lastSavedDataRef.current = {
            year,
            holidays: holidaysForYear,
            workDays: workDaysPerYear,
            carryover: carryoverHolidays
          };
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes('rate limit')) {
          console.warn('Rate limit exceeded, will retry later. Please wait a few minutes before making more changes.');
        } else {
          console.error('Auto-save failed:', error);
        }
      }
    }, 1500); // 1.5 second delay so day clicks persist if user refreshes soon after

    return () => clearTimeout(timeoutId);
  }, [personalHolidaysKey, workDaysPerYear, carryoverHolidays, year, settings.gitHub.token, settings.gitHub.gistId, isLoadingFromGist]);

  // When GitHub is not configured, persist to localStorage so day clicks survive refresh
  useEffect(() => {
    if (settings.gitHub.token && settings.gitHub.gistId) return;
    const yearStr = year.toString();
    const holidaysForYear = Array.from(personalHolidays)
      .filter(dateKey => dateKey.startsWith(yearStr))
      .sort();
    const timeoutId = setTimeout(() => {
      saveLocalData(year, holidaysForYear, workDaysPerYear, carryoverHolidays);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [personalHolidaysKey, workDaysPerYear, carryoverHolidays, year, settings.gitHub.token, settings.gitHub.gistId]);

  // Auto-save configuration (colors, country, and language) to GitHub when they change
  useEffect(() => {
    if (settings.gitHub.token && settings.gitHub.gistId) {
      const timeoutId = setTimeout(async () => {
        try {
          const result = await GistService.saveConfigurationToGist(
            settings.gitHub.token!,
            settings.gitHub.gistId!,
            settings.country,
            settings.language,
            settings.colors
          );
          
          if (!result.success) {
            console.error('Auto-save configuration failed:', result.error);
          }
        } catch (error) {
          console.error('Auto-save configuration failed:', error);
        }
      }, 2000); // 2 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [settings.colors, settings.country, settings.language, settings.gitHub.token, settings.gitHub.gistId]);


  // Load data from GitHub when settings change or on initial load
  useEffect(() => {
    if (settings.gitHub.token && settings.gitHub.gistId) {
      loadFromGitHub();
    }
  }, [settings.gitHub.token, settings.gitHub.gistId]);

  // Reload year-specific data when year changes
  useEffect(() => {
    if (settings.gitHub.token && settings.gitHub.gistId) {
      loadFromGitHub();
    }
  }, [year]);

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

    setIsLoadingFromGist(true);
    try {
      const result = await GistService.loadFromGist(settings.gitHub.token, settings.gitHub.gistId);
      
      if (result.success && result.data) {
        let yearData = result.data[year.toString()];
        
        // On initial load only: if no data for current year, try to find the most recent year's data
        if (!yearData && isInitialLoad) {
          const availableYears = Object.keys(result.data)
            .filter(key => key !== 'configuration')
            .sort((a, b) => parseInt(b) - parseInt(a));
          if (availableYears.length > 0) {
            const mostRecentYear = availableYears[0];
            yearData = result.data[mostRecentYear];
            // Only change year on initial load if no data exists for current year
            if (year === new Date().getFullYear()) {
              setYear(parseInt(mostRecentYear));
            }
          }
        }
        
        if (yearData && 'holidays' in yearData) {
          // Merge holidays: keep holidays from other years, update holidays for current year
          setPersonalHolidays(prev => {
            const newSet = new Set(prev);
            const yearStr = year.toString();
            // Remove all holidays from the current year
            Array.from(newSet).forEach(dateKey => {
              if (dateKey.startsWith(yearStr)) {
                newSet.delete(dateKey);
              }
            });
            // Add holidays for the current year from gist
            yearData.holidays.forEach((dateKey: string) => {
              newSet.add(dateKey);
            });
            return newSet;
          });
          setWorkDaysPerYear(yearData.workDaysPerYear ?? 216);
          setCarryoverHolidays(yearData.carryoverHolidays ?? 0);
          
          // Update last saved data to prevent immediate save after load
          const yearStr = year.toString();
          const holidaysForYear = Array.from(yearData.holidays).filter((dateKey: string) => 
            dateKey.startsWith(yearStr)
          ).sort();
          lastSavedDataRef.current = {
            year,
            holidays: holidaysForYear,
            workDays: yearData.workDaysPerYear ?? 216,
            carryover: yearData.carryoverHolidays ?? 0
          };
        } else {
          // If no data for this year, remove holidays for this year but keep others
          setPersonalHolidays(prev => {
            const newSet = new Set(prev);
            const yearStr = year.toString();
            Array.from(newSet).forEach(dateKey => {
              if (dateKey.startsWith(yearStr)) {
                newSet.delete(dateKey);
              }
            });
            return newSet;
          });
          setWorkDaysPerYear(216);
          setCarryoverHolidays(0);
          
          // Update last saved data
          lastSavedDataRef.current = {
            year,
            holidays: [],
            workDays: 216,
            carryover: 0
          };
        }
        
        // Mark initial load as complete
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }

        // Check if configuration exists in gist and update settings if it does
        if (result.data.configuration?.legendColors) {
          setSettings(prev => ({
            ...prev,
            colors: result.data!.configuration!.legendColors
          }));
        }
        
        if (result.data.configuration?.country) {
          setSettings(prev => ({
            ...prev,
            country: result.data!.configuration!.country
          }));
        }
        
        if (result.data.configuration?.language) {
          const lang = result.data.configuration.language as Language;
          setSettings(prev => ({
            ...prev,
            language: lang
          }));
          i18n.changeLanguage(lang);
        }
        
        // If gist doesn't have configuration, save current configuration to gist
        if (!result.data.configuration?.legendColors) {
          await GistService.saveConfigurationToGist(
            settings.gitHub.token!,
            settings.gitHub.gistId!,
            settings.country,
            settings.language,
            settings.colors
          );
        }
      } else {
        console.error('Failed to load gist data:', result.error);
      }
    } catch (error) {
      console.error('Failed to load from GitHub:', error);
    } finally {
      setIsLoadingFromGist(false);
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
    
    // Apply theme if it changed
    ThemeService.applyTheme(newSettings.theme);
    
    // Apply language if it changed
    i18n.changeLanguage(newSettings.language);
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
        language={settings.language}
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
