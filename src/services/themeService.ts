export type Theme = 'light' | 'dark';

export interface ThemeSettings {
  theme: Theme;
}

export class ThemeService {
  private static readonly STORAGE_KEY = 'timeoffTrackerTheme';
  private static readonly DEFAULT_THEME: Theme = 'light';

  /**
   * Load theme from localStorage
   */
  static loadTheme(): Theme {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && (stored === 'light' || stored === 'dark')) {
        return stored as Theme;
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
    return this.DEFAULT_THEME;
  }

  /**
   * Save theme to localStorage
   */
  static saveTheme(theme: Theme): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }

  /**
   * Apply theme to the document
   */
  static applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-light', 'theme-dark');
    
    // Add new theme class
    root.classList.add(`theme-${theme}`);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1c1c1e' : '#ffffff');
    }
    
    // Save to localStorage
    this.saveTheme(theme);
  }

  /**
   * Initialize theme on app load
   */
  static initializeTheme(): Theme {
    const theme = this.loadTheme();
    this.applyTheme(theme);
    return theme;
  }

  /**
   * Toggle between light and dark themes
   */
  static toggleTheme(): Theme {
    const currentTheme = this.loadTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    return newTheme;
  }

  /**
   * Check if current theme is dark
   */
  static isDarkTheme(): boolean {
    return this.loadTheme() === 'dark';
  }

  /**
   * Get theme status for display
   */
  static getThemeStatus(theme: Theme) {
    return {
      current: theme,
      isDark: theme === 'dark',
      displayName: theme === 'dark' ? 'Dark' : 'Light'
    };
  }
}
