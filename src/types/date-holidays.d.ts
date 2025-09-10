declare module 'date-holidays' {
  interface Holiday {
    date: string;
    start: Date;
    end: Date;
    name: string;
    type: string;
    rule: string;
  }

  interface Country {
    country: string;
    state?: string;
    regions?: string[];
  }

  class Holidays {
    constructor(country?: string, state?: string, options?: any);
    
    init(country?: string, state?: string, options?: any): void;
    getHolidays(year?: number, country?: string, state?: string): Holiday[];
    isHoliday(date: Date | string): Holiday | false;
    getCountries(): { [key: string]: string };
    getStates(country?: string): { [key: string]: string };
    getTimezones(): string[];
    setTimezone(timezone: string): void;
    getLanguages(): string[];
    setLanguages(languages: string | string[]): void;
    queryHolidays(options: any): Holiday[];
  }

  export = Holidays;
}
