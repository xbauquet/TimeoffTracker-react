export interface GistData {
  [year: string]: {
    holidays: string[];
    workDaysPerYear: number;
    carryoverHolidays: number;
    country: string;
    state?: string;
    savedAt: string;
    note: string;
  };
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
          'Authorization': `token ${token}`,
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

  static async saveToGist(
    token: string,
    gistId: string | null,
    year: number,
    holidays: string[],
    workDaysPerYear: number,
    carryoverHolidays: number,
    country: string,
    state?: string
  ): Promise<{ success: boolean; gistId?: string; error?: string }> {
    try {
      // Get existing data from gist to preserve other years
      let existingData: GistData = {};
      if (gistId) {
        try {
          const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          });
          if (response.ok) {
            const gist = await response.json();
            const fileName = Object.keys(gist.files)[0];
            if (fileName) {
              existingData = JSON.parse(gist.files[fileName].content);
            }
          }
        } catch (e) {
          // Ignore errors when loading existing data
        }
      }

      // Update with current year data
      const data: GistData = {
        ...existingData,
        [year]: {
          holidays,
          workDaysPerYear,
          carryoverHolidays,
          country,
          state,
          savedAt: new Date().toISOString(),
          note: 'Calendrier de congés personnels'
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

      let response;
      let isUpdate = false;

      // Try to update existing gist if we have an ID
      if (gistId) {
        try {
          response = await fetch(`https://api.github.com/gists/${gistId}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `token ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify(gistData)
          });
          isUpdate = true;
        } catch (e) {
          // If update fails, we'll create a new gist
        }
      }

      // Create new gist if update failed or no gist ID
      if (!response || !response.ok) {
        response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify(gistData)
        });
        isUpdate = false;
      }

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'GitHub API error' };
      }

      const result = await response.json();
      
      if (!isUpdate) {
        return { success: true, gistId: result.id };
      } else {
        return { success: true, gistId: gistId! };
      }

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async loadFromGist(
    token: string | null,
    gistId: string
  ): Promise<{ success: boolean; data?: GistData; error?: string }> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json'
      };
      
      if (token) {
        headers['Authorization'] = `token ${token}`;
      }
      
      const response = await fetch(`https://api.github.com/gists/${gistId}`, { headers });
      
      if (!response.ok) {
        return { success: false, error: 'Gist not found or access denied' };
      }

      const gist = await response.json();
      const fileName = Object.keys(gist.files)[0];
      if (!fileName) {
        return { success: false, error: 'Invalid backup file' };
      }
      
      const content = JSON.parse(gist.files[fileName].content);
      return { success: true, data: content };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static getStatus(settings: GistSettings): { status: 'connected' | 'warning' | 'disconnected'; message: string } {
    if (!settings.token) {
      return { status: 'disconnected', message: 'GitHub: ❌' };
    }
    
    if (!settings.gistId) {
      return { status: 'warning', message: 'GitHub: ⚠️' };
    }
    
    return { status: 'connected', message: 'GitHub: ✅' };
  }
}
