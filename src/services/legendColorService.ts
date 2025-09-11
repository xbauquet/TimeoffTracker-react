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
  
  // Soft but vibrant color palette
  private static readonly DEFAULT_COLORS: ColorOption[] = [
    { id: 'background-match', name: 'Background', color: '#1a1a1a' },
    { id: 'dark-gray', name: 'Dark Gray', color: '#2a2a2a' },
    { id: 'medium-gray', name: 'Medium Gray', color: '#404040' },
    { id: 'warm-gray', name: 'Warm Gray', color: '#9e9e9e' },
    { id: 'lavender', name: 'Lavender', color: '#b39ddb' },
    { id: 'rose', name: 'Rose', color: '#f48fb1' },
    { id: 'peach', name: 'Peach', color: '#ffab91' },
    { id: 'mint', name: 'Mint', color: '#81c784' },
    { id: 'sky-blue', name: 'Sky Blue', color: '#64b5f6' },
    { id: 'powder-blue', name: 'Powder Blue', color: '#90caf9' },
    { id: 'coral', name: 'Coral', color: '#ff8a65' },
    { id: 'sage-green', name: 'Sage Green', color: '#aed581' },
    { id: 'butter', name: 'Butter', color: '#fff176' },
    { id: 'pink', name: 'Pink', color: '#f8bbd9' },
    { id: 'purple', name: 'Purple', color: '#ce93d8' },
    { id: 'forest-green', name: 'Forest Green', color: '#a5d6a7' },
    { id: 'ocean-blue', name: 'Ocean Blue', color: '#4fc3f7' },
    { id: 'beige', name: 'Beige', color: '#d7ccc8' },
    { id: 'dusty-rose', name: 'Dusty Rose', color: '#f48fb1' },
    { id: 'teal', name: 'Teal', color: '#4db6ac' },
    { id: 'periwinkle', name: 'Periwinkle', color: '#9fa8da' },
    { id: 'cream', name: 'Cream', color: '#ffecb3' },
    { id: 'lime', name: 'Lime', color: '#dce775' },
    { id: 'blush', name: 'Blush', color: '#f8bbd9' }
  ];

  // Default color settings
  private static readonly DEFAULT_SETTINGS: LegendColorSettings = {
    normal: '#9e9e9e',
    weekend: '#64b5f6',
    holiday: '#81c784',
    holidayWeekend: '#4db6ac',
    personalHoliday: '#ff8a65',
    icalEvents: '#b39ddb'
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
   * Calculate the luminance of a color to determine if text should be black or white
   */
  private static getLuminance(hex: string): number {
    // Remove # if present
    const color = hex.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(color.substr(0, 2), 16) / 255;
    const g = parseInt(color.substr(2, 2), 16) / 255;
    const b = parseInt(color.substr(4, 2), 16) / 255;
    
    // Apply gamma correction
    const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
    // Calculate relative luminance
    return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
  }

  /**
   * Get the appropriate text color (black or white) for a given background color
   */
  static getTextColor(backgroundColor: string): string {
    const luminance = this.getLuminance(backgroundColor);
    // Use white text for dark backgrounds, black text for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
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
      '--legend-ical-events-color': settings.icalEvents,
      '--legend-normal-text-color': this.getTextColor(settings.normal),
      '--legend-weekend-text-color': this.getTextColor(settings.weekend),
      '--legend-holiday-text-color': this.getTextColor(settings.holiday),
      '--legend-holiday-weekend-text-color': this.getTextColor(settings.holidayWeekend),
      '--legend-personal-holiday-text-color': this.getTextColor(settings.personalHoliday),
      '--legend-ical-events-text-color': this.getTextColor(settings.icalEvents)
    };
  }
}
