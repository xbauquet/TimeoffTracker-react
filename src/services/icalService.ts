import { ICalEvent, ICalSettings, ICalServiceResult } from '../types/ical';

export class ICalService {
  private static readonly STORAGE_KEY = 'timeofftracker_ical_settings';

  /**
   * Load iCal settings from localStorage
   */
  static loadSettings(): ICalSettings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          url: parsed.url || ''
        };
      }
    } catch (error) {
      console.error('Failed to load iCal settings:', error);
    }
    
    return {
      url: ''
    };
  }

  /**
   * Save iCal settings to localStorage
   */
  static saveSettings(settings: ICalSettings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save iCal settings:', error);
    }
  }

  /**
   * Convert webcal:// URLs to https:// URLs
   */
  private static convertWebcalUrl(url: string): string {
    if (url.startsWith('webcal://')) {
      return url.replace('webcal://', 'https://');
    }
    return url;
  }


  /**
   * Fetch and parse iCal events from URL
   */
  static async fetchEvents(url: string): Promise<ICalServiceResult> {
    try {
      // Convert webcal:// URLs to https://
      let icalUrl = this.convertWebcalUrl(url);

      // Add cache-busting parameter to prevent caching issues
      const cacheBuster = Date.now();
      const separator = icalUrl.includes('?') ? '&' : '?';
      icalUrl = `${icalUrl}${separator}_cb=${cacheBuster}`;

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
      });

      // Try to fetch with timeout and retry logic
      let response: Response | undefined;
      let lastError: Error | undefined;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          // Try direct fetch first
          try {
            const fetchPromise = fetch(icalUrl, {
              method: 'GET',
              headers: {
                'Accept': 'text/calendar,text/plain,*/*',
                'User-Agent': 'Mozilla/5.0 (compatible; TimeoffTracker/1.0)'
              }
            });
            
            response = await Promise.race([fetchPromise, timeoutPromise]);
          } catch (corsError) {
            // Try multiple CORS proxies as fallback
            const proxies = [
              `https://api.allorigins.win/raw?url=${encodeURIComponent(icalUrl)}`,
              `https://cors-anywhere.herokuapp.com/${icalUrl}`,
              `https://thingproxy.freeboard.io/fetch/${icalUrl}`
            ];
            
            let proxySuccess = false;
            for (const proxyUrl of proxies) {
              try {
                const proxyPromise = fetch(proxyUrl, {
                  method: 'GET',
                  headers: {
                    'Accept': 'text/calendar,text/plain,*/*',
                    'X-Requested-With': 'XMLHttpRequest'
                  }
                });
                
                response = await Promise.race([proxyPromise, timeoutPromise]);
                if (response.ok) {
                  proxySuccess = true;
                  break;
                }
              } catch (proxyError) {
                continue;
              }
            }
            
            if (!proxySuccess) {
              throw new Error('All CORS proxies failed');
            }
          }

          if (response && response.ok) {
            break; // Success, exit retry loop
          } else if (response && response.status === 408) {
            lastError = new Error(`Timeout error (408) - attempt ${attempt}/3`);
            if (attempt < 3) {
              await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Progressive delay
              continue;
            }
          } else if (response) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          } else {
            throw new Error('No response received');
          }
        } catch (error) {
          lastError = error as Error;
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Progressive delay
          }
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('All fetch attempts failed');
      }

      const icalText = await response.text();
      const events = this.parseICal(icalText);
      
      return { success: true, events };
    } catch (error) {
      console.error('Failed to fetch iCal events:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide more specific error messages
        if (error.message.includes('timeout') || error.message.includes('408')) {
          errorMessage = 'Timeout error: The server is taking too long to respond. Please try again later.';
        } else if (error.message.includes('CORS proxies failed')) {
          errorMessage = 'CORS error: Unable to bypass security restrictions. Try using a different calendar URL.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the calendar. This may be due to CORS restrictions or network issues.';
        }
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }

  /**
   * Parse iCal text content into events
   */
  private static parseICal(icalText: string): ICalEvent[] {
    const events: ICalEvent[] = [];
    const lines = icalText.split('\n');
    
    let currentEvent: Partial<ICalEvent> = {};
    let inEvent = false;
    let currentLine = '';

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Handle line folding (lines starting with space or tab)
      if (line.startsWith(' ') || line.startsWith('\t')) {
        currentLine += line.substring(1);
        continue;
      } else if (currentLine) {
        line = currentLine + line;
        currentLine = '';
      }

      if (line === 'BEGIN:VEVENT') {
        inEvent = true;
        currentEvent = {};
      } else if (line === 'END:VEVENT' && inEvent) {
        const event = this.parseEvent(currentEvent);
        if (event) {
          events.push(event);
        }
        inEvent = false;
        currentEvent = {};
      } else if (inEvent) {
        // Parse event properties using the same logic as the original TimeoffTracker
        if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = this.decodeText(line.substring(8));
        } else if (line.startsWith('DTSTART')) {
          const dateStr = line.includes(':') ? line.substring(line.indexOf(':') + 1) : '';
          currentEvent.startDate = this.parseDate(dateStr);
        } else if (line.startsWith('DTEND')) {
          const dateStr = line.includes(':') ? line.substring(line.indexOf(':') + 1) : '';
          currentEvent.endDate = this.parseDate(dateStr);
        } else if (line.startsWith('UID:')) {
          currentEvent.uid = line.substring(4);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = this.decodeText(line.substring(12));
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = this.decodeText(line.substring(9));
        } else if (line.startsWith('STATUS:')) {
          currentEvent.status = line.substring(7).toLowerCase() as 'confirmed' | 'tentative' | 'cancelled';
        }
      }
    }

    return events;
  }

  /**
   * Parse a single event from raw iCal data
   */
  private static parseEvent(eventData: Partial<ICalEvent>): ICalEvent | null {
    if (!eventData.uid || !eventData.summary || !eventData.startDate) {
      return null;
    }

    return {
      uid: eventData.uid,
      summary: eventData.summary,
      description: eventData.description,
      startDate: eventData.startDate,
      endDate: eventData.endDate || eventData.startDate,
      location: eventData.location,
      status: eventData.status || 'confirmed',
      allDay: this.isAllDayEvent(eventData.startDate, eventData.endDate)
    };
  }

  /**
   * Parse iCal date string to Date object
   */
  private static parseDate(dateString: string): Date {
    // Handle both date-only (YYYYMMDD) and date-time formats
    if (dateString.length === 8) {
      // Date only (YYYYMMDD)
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1; // JS months are 0-based
      const day = parseInt(dateString.substring(6, 8));
      return new Date(year, month, day);
    } else if (dateString.length === 15) {
      // Date-time (YYYYMMDDTHHMMSS)
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1;
      const day = parseInt(dateString.substring(6, 8));
      const hour = parseInt(dateString.substring(9, 11));
      const minute = parseInt(dateString.substring(11, 13));
      const second = parseInt(dateString.substring(13, 15));
      return new Date(year, month, day, hour, minute, second);
    } else {
      // Try parsing as ISO string
      return new Date(dateString);
    }
  }

  /**
   * Check if event is all-day
   */
  private static isAllDayEvent(startDate: Date, endDate?: Date): boolean {
    if (!endDate) return true;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // All-day events typically have start at 00:00 and end at 00:00 next day
    return start.getHours() === 0 && start.getMinutes() === 0 && 
           end.getHours() === 0 && end.getMinutes() === 0 &&
           (end.getTime() - start.getTime()) === 24 * 60 * 60 * 1000;
  }

  /**
   * Decode iCal text (handle escaped characters)
   */
  private static decodeText(text: string): string {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
      .replace(/\\"/g, '"');
  }

  /**
   * Get events for a specific date
   */
  static getEventsForDate(events: ICalEvent[], date: Date): ICalEvent[] {
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);
      
      return targetDate >= eventStart && targetDate <= eventEnd;
    });
  }

  /**
   * Clear cached events (no longer used, but kept for API compatibility)
   */
  static clearCache(): void {
    // Cache functionality removed - this is a no-op for backward compatibility
  }
}
