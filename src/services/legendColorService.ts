import { ColorOption } from '../components/ColorPicker';

export interface LegendColorSettings {
  normal: string;
  weekend: string;
  holiday: string;
  holidayWeekend: string;
  personalHoliday: string;
  icalEvents: string;
}

export class LegendColorService {
  private static readonly STORAGE_KEY = 'legendColorSettings';
  
  // Apple-style color palette
  private static readonly DEFAULT_COLORS: ColorOption[] = [
    { id: 'gray', name: 'Gray', color: '#8e8e93' },
    { id: 'red', name: 'Red', color: '#ff3b30' },
    { id: 'orange', name: 'Orange', color: '#ff9500' },
    { id: 'yellow', name: 'Yellow', color: '#ffcc00' },
    { id: 'green', name: 'Green', color: '#34c759' },
    { id: 'mint', name: 'Mint', color: '#00c7be' },
    { id: 'teal', name: 'Teal', color: '#30b0c7' },
    { id: 'cyan', name: 'Cyan', color: '#32d74b' },
    { id: 'blue', name: 'Blue', color: '#007aff' },
    { id: 'indigo', name: 'Indigo', color: '#5856d6' },
    { id: 'purple', name: 'Purple', color: '#af52de' },
    { id: 'pink', name: 'Pink', color: '#ff2d92' },
    { id: 'brown', name: 'Brown', color: '#a2845e' },
    { id: 'dark-gray', name: 'Dark Gray', color: '#48484a' },
    { id: 'light-gray', name: 'Light Gray', color: '#c7c7cc' },
    { id: 'white', name: 'White', color: '#ffffff', borderColor: '#e5e5ea' },
    { id: 'black', name: 'Black', color: '#000000' },
    { id: 'dark-blue', name: 'Dark Blue', color: '#1e3a8a' },
    { id: 'dark-green', name: 'Dark Green', color: '#166534' },
    { id: 'dark-red', name: 'Dark Red', color: '#991b1b' },
    { id: 'dark-orange', name: 'Dark Orange', color: '#ea580c' },
    { id: 'dark-purple', name: 'Dark Purple', color: '#7c2d12' },
    { id: 'dark-pink', name: 'Dark Pink', color: '#be185d' },
    { id: 'dark-cyan', name: 'Dark Cyan', color: '#0f766e' }
  ];

  // Default color settings
  private static readonly DEFAULT_SETTINGS: LegendColorSettings = {
    normal: '#8e8e93',
    weekend: '#007aff',
    holiday: '#34c759',
    holidayWeekend: '#00c7be',
    personalHoliday: '#ff9500',
    icalEvents: '#af52de'
  };

  /**
   * Get all available color options
   */
  static getColorOptions(): ColorOption[] {
    return [...this.DEFAULT_COLORS];
  }

  /**
   * Load color settings from localStorage
   */
  static loadSettings(): LegendColorSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all properties exist
        return { ...this.DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load legend color settings:', error);
    }
    return { ...this.DEFAULT_SETTINGS };
  }

  /**
   * Save color settings to localStorage
   */
  static saveSettings(settings: LegendColorSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save legend color settings:', error);
    }
  }

  /**
   * Reset color settings to defaults
   */
  static resetToDefaults(): LegendColorSettings {
    const defaults = { ...this.DEFAULT_SETTINGS };
    this.saveSettings(defaults);
    return defaults;
  }

  /**
   * Update a specific color setting
   */
  static updateColorSetting(
    settings: LegendColorSettings,
    key: keyof LegendColorSettings,
    color: string
  ): LegendColorSettings {
    const updated = { ...settings, [key]: color };
    this.saveSettings(updated);
    return updated;
  }

  /**
   * Get CSS custom properties for the color settings
   */
  static getCSSVariables(settings: LegendColorSettings): Record<string, string> {
    return {
      '--legend-normal-color': settings.normal,
      '--legend-weekend-color': settings.weekend,
      '--legend-holiday-color': settings.holiday,
      '--legend-holiday-weekend-color': settings.holidayWeekend,
      '--legend-personal-holiday-color': settings.personalHoliday,
      '--legend-ical-events-color': settings.icalEvents
    };
  }
}
