export interface YearData {
  holidays: string[];
  workDaysPerYear: number;
  carryoverHolidays: number;
}

export interface ConfigurationData {
  country: string;
  legendColors: {
    normal: string;
    weekend: string;
    holiday: string;
    holidayWeekend: string;
    personalHoliday: string;
    icalEvents: string;
  };
}

export interface GistData {
  configuration?: ConfigurationData;
  [year: string]: YearData | ConfigurationData | undefined;
}

export interface GistSettings {
  token: string | null;
  gistId: string | null;
}

export class GistService {
  private static readonly STORAGE_KEY_TOKEN = 'github-token';
  private static readonly STORAGE_KEY_GIST_ID = 'gist-id';

  static loadSettings(): GistSettings {
    return {
      token: localStorage.getItem(this.STORAGE_KEY_TOKEN),
      gistId: localStorage.getItem(this.STORAGE_KEY_GIST_ID),
    };
  }

  static saveSettings(token: string, gistId?: string): void {
    localStorage.setItem(this.STORAGE_KEY_TOKEN, token);
    if (gistId) {
      localStorage.setItem(this.STORAGE_KEY_GIST_ID, gistId);
    } else {
      localStorage.removeItem(this.STORAGE_KEY_GIST_ID);
    }
  }

  static clearSettings(): void {
    localStorage.removeItem(this.STORAGE_KEY_TOKEN);
    localStorage.removeItem(this.STORAGE_KEY_GIST_ID);
  }

  static async testToken(token: string): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (response.ok) {
        const user = await response.json();
        return { success: true, user };
      } else {
        const error = await response.json();
        return { success: false, error: error.message || 'Invalid token' };
      }
    } catch (error) {
      return { success: false, error: 'Connection error' };
    }
  }

  static async saveConfigurationToGist(
    token: string,
    gistId: string,
    country: string,
    legendColors: {
      normal: string;
      weekend: string;
      holiday: string;
      holidayWeekend: string;
      personalHoliday: string;
      icalEvents: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get existing data from gist
      let existingData: GistData = {};
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!response.ok) {
          return { success: false, error: `Gist not found or access denied (${response.status})` };
        }
        
        const gist = await response.json();
        const fileName = Object.keys(gist.files)[0];
        if (fileName) {
          existingData = JSON.parse(gist.files[fileName].content);
        }
      } catch (e) {
        return { success: false, error: 'Failed to load existing gist data' };
      }

      // Clean up any legacy global fields that shouldn't be there
      const cleanedExistingData = { ...existingData };
      delete (cleanedExistingData as any).workDaysPerYear;
      delete (cleanedExistingData as any).savedAt;
      delete (cleanedExistingData as any).note;
      
      // Clean up legacy fields from year data
      Object.keys(cleanedExistingData).forEach(key => {
        if (key !== 'configuration' && typeof cleanedExistingData[key] === 'object' && cleanedExistingData[key] !== null) {
          const yearData = cleanedExistingData[key] as any;
          delete yearData.country;
          delete yearData.state;
          delete yearData.savedAt;
          delete yearData.note;
        }
      });

      // Update configuration data
      const data: GistData = {
        ...cleanedExistingData,
        configuration: {
          country,
          legendColors
        }
      };

      console.log('Saving configuration to gist:', {
        country,
        legendColors,
        gistId
      });

      const gistData = {
        description: `Calendrier de congés - ${new Date().toLocaleDateString('fr-FR')}`,
        public: false, // Private gist
        files: {
          'holidays.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      };

      console.log('Final gist data being saved:', JSON.stringify(data, null, 2));

      // Update existing gist
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(gistData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'GitHub API error' };
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async saveToGist(
    token: string,
    gistId: string,
    year: number,
    holidays: string[],
    workDaysPerYear: number,
    carryoverHolidays: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get existing data from gist
      let existingData: GistData = {};
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (!response.ok) {
          return { success: false, error: `Gist not found or access denied (${response.status})` };
        }
        
        const gist = await response.json();
        const fileName = Object.keys(gist.files)[0];
        if (fileName) {
          existingData = JSON.parse(gist.files[fileName].content);
        }
      } catch (e) {
        return { success: false, error: 'Failed to load existing gist data' };
      }

      // Clean up any legacy global fields that shouldn't be there
      const cleanedExistingData = { ...existingData };
      delete (cleanedExistingData as any).workDaysPerYear;
      delete (cleanedExistingData as any).savedAt;
      delete (cleanedExistingData as any).note;
      
      // Clean up legacy fields from year data
      Object.keys(cleanedExistingData).forEach(key => {
        if (key !== 'configuration' && typeof cleanedExistingData[key] === 'object' && cleanedExistingData[key] !== null) {
          const yearData = cleanedExistingData[key] as any;
          delete yearData.country;
          delete yearData.state;
          delete yearData.savedAt;
          delete yearData.note;
        }
      });

      // Update with current year data
      const data: GistData = {
        ...cleanedExistingData,
        [year]: {
          holidays,
          workDaysPerYear,
          carryoverHolidays
        }
      };

      const gistData = {
        description: `Calendrier de congés - ${new Date().toLocaleDateString('fr-FR')}`,
        public: false, // Private gist
        files: {
          'holidays.json': {
            content: JSON.stringify(data, null, 2)
          }
        }
      };

      // Update existing gist
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(gistData)
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'GitHub API error' };
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async loadConfigurationFromGist(
    token: string | null,
    gistId: string
  ): Promise<{ success: boolean; configuration?: GistData['configuration']; error?: string }> {
    try {
      const result = await this.loadFromGist(token, gistId);
      if (result.success && result.data) {
        return { success: true, configuration: result.data.configuration };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async loadFromGist(
    token: string | null,
    gistId: string
  ): Promise<{ success: boolean; data?: GistData; error?: string }> {
    try {
      
      // Validate gist ID format
      if (!gistId || gistId.length !== 32) {
        console.error('Invalid gist ID format:', gistId);
        return { success: false, error: 'Invalid gist ID format' };
      }
      
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let response = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
      
      // If Bearer token fails, try with the old token format
      if (!response.ok && token && response.status === 401) {
        headers['Authorization'] = `token ${token}`;
        response = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API error response:', errorText);
        return { success: false, error: `Gist not found or access denied (${response.status})` };
      }

      const gist = await response.json();
      
      const fileName = Object.keys(gist.files)[0];
      if (!fileName) {
        console.error('No files found in gist');
        return { success: false, error: 'Invalid backup file' };
      }
      
      const content = JSON.parse(gist.files[fileName].content);
      
      return { success: true, data: content };

    } catch (error) {
      console.error('Error in loadFromGist:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static getStatus(settings: GistSettings): { status: 'connected' | 'warning' | 'disconnected'; message: string } {
    if (!settings.token) {
      return { status: 'disconnected', message: 'GitHub ❌' };
    }
    
    if (!settings.gistId) {
      return { status: 'warning', message: 'GitHub ⚠️' };
    }
    
    return { status: 'connected', message: 'GitHub ✅' };
  }
}
