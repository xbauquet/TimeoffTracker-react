import { Day, Month, YearData, BankHoliday } from '../types/year';
import Holidays from 'date-holidays';

export class YearService {
  private static readonly MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  private static readonly MONTH_NAMES_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  private static readonly DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Default country for bank holidays
  private static readonly DEFAULT_COUNTRY = 'US';

  /**
   * Generate complete year data for a given year
   */
  static generateYearData(year: number, country?: string, state?: string): YearData {
    const isLeapYear = this.isLeapYear(year);
    const totalDays = isLeapYear ? 366 : 365;
    const countryCode = country || this.DEFAULT_COUNTRY;
    
    const bankHolidays = this.getBankHolidaysFromLibrary(year, countryCode, state);
    const months = this.generateMonths(year, isLeapYear, bankHolidays);

    return {
      year,
      isLeapYear,
      totalDays,
      months,
      bankHolidays
    };
  }

  /**
   * Check if a year is a leap year
   */
  private static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Generate all months for a year
   */
  private static generateMonths(year: number, isLeapYear: boolean, bankHolidays: BankHoliday[]): Month[] {
    const months: Month[] = [];
    const bankHolidayDates = new Set(bankHolidays.map(bh => this.formatDateKey(bh.date)));

    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthNumber = monthIndex + 1;
      const daysInMonth = monthIndex === 1 && isLeapYear ? 29 : this.DAYS_IN_MONTH[monthIndex];
      const firstDay = new Date(year, monthIndex, 1);
      const firstDayOfWeek = firstDay.getDay();

      const days: Day[] = [];
      for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth++) {
        const date = new Date(year, monthIndex, dayOfMonth);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        const dateKey = this.formatDateKey(date);
        const bankHoliday = bankHolidays.find(bh => this.formatDateKey(bh.date) === dateKey);

        days.push({
          date,
          dayOfWeek,
          isWeekend,
          isBankHoliday: bankHolidayDates.has(dateKey),
          bankHolidayName: bankHoliday?.name,
          month: monthNumber,
          dayOfMonth,
          year
        });
      }

      months.push({
        monthNumber,
        monthName: this.MONTH_NAMES[monthIndex],
        monthNameShort: this.MONTH_NAMES_SHORT[monthIndex],
        daysInMonth,
        firstDayOfWeek,
        days
      });
    }

    return months;
  }

  /**
   * Get bank holidays using the date-holidays library
   */
  private static getBankHolidaysFromLibrary(year: number, country: string, state?: string): BankHoliday[] {
    try {
      const holidays = new Holidays();
      holidays.init(country, state);
      
      const libraryHolidays = holidays.getHolidays(year);
      
      return libraryHolidays
        .filter(holiday => {
          // Filter for bank holidays and public holidays
          const type = holiday.type.toLowerCase();
          return type.includes('bank') || type.includes('public') || type.includes('national');
        })
        .map(holiday => ({
          date: new Date(holiday.start),
          name: holiday.name,
          type: 'library' as const
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.warn(`Failed to load holidays for ${country}${state ? `, ${state}` : ''}:`, error);
      return [];
    }
  }

  /**
   * Get available countries from the library
   */
  static getAvailableCountries(): { [key: string]: string } {
    try {
      const holidays = new Holidays();
      return holidays.getCountries();
    } catch (error) {
      console.warn('Failed to load available countries:', error);
      return {};
    }
  }

  /**
   * Get available states for a country
   */
  static getAvailableStates(country: string): { [key: string]: string } {
    try {
      const holidays = new Holidays();
      return holidays.getStates(country);
    } catch (error) {
      console.warn(`Failed to load states for ${country}:`, error);
      return {};
    }
  }

  /**
   * Format date as YYYY-MM-DD for consistent comparison
   */
  private static formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Get a specific day from year data
   */
  static getDay(yearData: YearData, month: number, day: number): Day | null {
    const monthData = yearData.months.find(m => m.monthNumber === month);
    if (!monthData) return null;
    
    return monthData.days.find(d => d.dayOfMonth === day) || null;
  }

  /**
   * Get all weekends in a year
   */
  static getWeekends(yearData: YearData): Day[] {
    const weekends: Day[] = [];
    
    for (const month of yearData.months) {
      weekends.push(...month.days.filter(day => day.isWeekend));
    }
    
    return weekends;
  }

  /**
   * Get all bank holidays in a year
   */
  static getBankHolidays(yearData: YearData): Day[] {
    const bankHolidays: Day[] = [];
    
    for (const month of yearData.months) {
      bankHolidays.push(...month.days.filter(day => day.isBankHoliday));
    }
    
    return bankHolidays;
  }

  /**
   * Get working days (excluding weekends and bank holidays)
   */
  static getWorkingDays(yearData: YearData): Day[] {
    const workingDays: Day[] = [];
    
    for (const month of yearData.months) {
      workingDays.push(...month.days.filter(day => !day.isWeekend && !day.isBankHoliday));
    }
    
    return workingDays;
  }
}
