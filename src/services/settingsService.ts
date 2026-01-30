import { GistService } from './gistService';
import { ICalService } from './icalService';
import { AllSettings } from '../components/SettingsModal';

export class SettingsService {
  private static readonly STORAGE_KEY = 'timeoffTrackerSettings';

  // Default settings
  private static readonly DEFAULT_SETTINGS: AllSettings = {
    country: 'US',
    theme: 'light',
    language: 'en',
    gitHub: { token: null, gistId: null },
    ical: { url: '' },
    colors: {
      normal: '#9e9e9e',
      weekend: '#64b5f6',
      holiday: '#81c784',
      holidayWeekend: '#4db6ac',
      personalHoliday: '#ff8a65',
      icalEvents: '#b39ddb'
    }
  };

  /**
   * Load all settings from localStorage and individual services
   */
  static loadSettings(): AllSettings {
    try {
      // Load from individual services first
      const gitHubSettings = GistService.loadSettings();
      const icalSettings = ICalService.loadSettings();
      // Colors are now loaded from gist, use defaults as fallback
      const colorSettings = this.DEFAULT_SETTINGS.colors;

      // Try to load from unified storage (only theme now, country/language are in gist)
      const stored = localStorage.getItem(this.STORAGE_KEY);
      let generalSettings = {};

      if (stored) {
        const parsed = JSON.parse(stored);
        generalSettings = {
          theme: parsed.theme || this.DEFAULT_SETTINGS.theme
        };
      }

      return {
        ...this.DEFAULT_SETTINGS,
        ...generalSettings,
        gitHub: gitHubSettings,
        ical: icalSettings,
        colors: colorSettings
      };
    } catch (error) {
      console.error('Failed to load settings:', error);
      return { ...this.DEFAULT_SETTINGS };
    }
  }

  /**
   * Load settings with configuration from GitHub gist
   */
  static async loadSettingsWithGist(): Promise<AllSettings> {
    const settings = this.loadSettings();
    
    // If we have GitHub credentials, try to load configuration from gist
    if (settings.gitHub.token && settings.gitHub.gistId) {
      try {
        const result = await GistService.loadConfigurationFromGist(settings.gitHub.token, settings.gitHub.gistId);
        
        if (result.success && result.configuration?.legendColors) {
          // Override with gist configuration
          settings.colors = result.configuration.legendColors;
          if (result.configuration.country) {
            settings.country = result.configuration.country;
          }
          if (result.configuration.language) {
            settings.language = result.configuration.language;
          }
        } else if (result.success) {
          // If gist doesn't have configuration, save current configuration to gist
          await GistService.saveConfigurationToGist(
            settings.gitHub.token,
            settings.gitHub.gistId,
            settings.country,
            settings.language,
            settings.colors
          );
        }
      } catch (error) {
        console.error('Failed to load configuration from gist:', error);
      }
    }
    
    return settings;
  }

  /**
   * Save all settings to localStorage and individual services
   */
  static async saveSettings(settings: AllSettings): Promise<void> {
    try {
      // Save to individual services
      if (settings.gitHub.token && settings.gitHub.gistId) {
        GistService.saveSettings(settings.gitHub.token, settings.gitHub.gistId);
        
        // Save configuration to gist (country, language, and colors)
        await GistService.saveConfigurationToGist(
          settings.gitHub.token,
          settings.gitHub.gistId,
          settings.country,
          settings.language,
          settings.colors
        );
      }
      ICalService.saveSettings(settings.ical);
      // Colors are now saved to gist, not localStorage

      // Save only theme to localStorage (country/language/colors are in gist)
      const generalSettings = {
        theme: settings.theme
      };

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(generalSettings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  /**
   * Reset all settings to defaults
   */
  static resetToDefaults(): AllSettings {
    const defaults = { ...this.DEFAULT_SETTINGS };
    
      // Reset individual services
      GistService.clearSettings();
      ICalService.saveSettings({ url: '' });
      // Colors are now in gist, no need to reset localStorage

    // Clear unified storage
    localStorage.removeItem(this.STORAGE_KEY);

    return defaults;
  }

  /**
   * Update a specific setting
   */
  static updateSetting<K extends keyof AllSettings>(
    settings: AllSettings,
    key: K,
    value: AllSettings[K]
  ): AllSettings {
    const updated = { ...settings, [key]: value };
    this.saveSettings(updated);
    return updated;
  }

  /**
   * Get settings status for display
   */
  static getSettingsStatus(settings: AllSettings) {
    return {
      gitHub: GistService.getStatus(settings.gitHub),
      ical: {
        status: settings.ical.url && settings.ical.url.trim() ? 'connected' : 'disconnected',
        message: settings.ical.url && settings.ical.url.trim() ? 'Calendar ✅' : 'Calendar ❌'
      },
      colors: {
        status: 'configured',
        message: 'Colors configured'
      }
    };
  }

  /**
   * Export settings as JSON
   */
  static exportSettings(settings: AllSettings): string {
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  static importSettings(jsonString: string): AllSettings | null {
    try {
      const imported = JSON.parse(jsonString);
      
      // Validate the imported settings structure
      if (this.validateSettings(imported)) {
        this.saveSettings(imported);
        return imported;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return null;
    }
  }

  /**
   * Validate settings structure
   */
  private static validateSettings(settings: any): settings is AllSettings {
    return (
      settings &&
      typeof settings.country === 'string' &&
      typeof settings.theme === 'string' &&
      (settings.theme === 'light' || settings.theme === 'dark') &&
      typeof settings.language === 'string' &&
      (settings.language === 'en' || settings.language === 'fr') &&
      settings.gitHub &&
      settings.ical &&
      settings.colors &&
      typeof settings.colors.normal === 'string' &&
      typeof settings.colors.weekend === 'string' &&
      typeof settings.colors.holiday === 'string' &&
      typeof settings.colors.holidayWeekend === 'string' &&
      typeof settings.colors.personalHoliday === 'string' &&
      typeof settings.colors.icalEvents === 'string'
    );
  }
}
