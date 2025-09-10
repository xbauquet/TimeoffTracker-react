import { YearService } from './yearService';

export interface HolidayCalculationParams {
  year: number;
  country: string;
  state?: string;
  workDaysPerYear: number;
  carryoverHolidays: number;
  personalHolidays: Set<string>;
}

export interface HolidayCalculationResult {
  remainingHolidays: number;
  totalDaysInYear: number;
  weekendDays: number;
  bankHolidaysOnWeekdays: number;
  availablePersonalHolidays: number;
  usedPersonalHolidays: number;
}

export class HolidayCalculationService {
  /**
   * Calculate remaining holidays using the correct formula:
   * days_in_year - weekend_days - bank_holidays_out_of_weekends - work_days + carryover - personal_holidays
   */
  static calculateRemainingHolidays(params: HolidayCalculationParams): HolidayCalculationResult {
    try {
      const { year, country, state, workDaysPerYear, carryoverHolidays, personalHolidays } = params;
      
      // Get total days in the year
      const isLeapYear = this.isLeapYear(year);
      const totalDaysInYear = isLeapYear ? 366 : 365;
      
      // Count weekend days
      const weekendDays = this.countWeekendDays(year);
      
      // Get actual bank holidays for the country using YearService
      const yearData = YearService.generateYearData(year, country, state);
      const bankHolidaysOnWeekdays = yearData.bankHolidays.filter(holiday => {
        const dayOfWeek = holiday.date.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // Not weekend
      }).length;
      
      // Calculate available personal holidays
      const availablePersonalHolidays = totalDaysInYear - weekendDays - bankHolidaysOnWeekdays - workDaysPerYear + carryoverHolidays;
      
      // Count used personal holidays
      const usedPersonalHolidays = personalHolidays.size;
      
      // Apply the correct formula:
      // days_in_year - weekend_days - bank_holidays_out_of_weekends - work_days + carryover - personal_holidays
      const remainingHolidays = Math.max(0, availablePersonalHolidays - usedPersonalHolidays);
      
      return {
        remainingHolidays,
        totalDaysInYear,
        weekendDays,
        bankHolidaysOnWeekdays,
        availablePersonalHolidays,
        usedPersonalHolidays
      };
    } catch (error) {
      console.error('Error calculating remaining holidays:', error);
      return this.getFallbackCalculation(params);
    }
  }

  /**
   * Check if a year is a leap year
   */
  private static isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  /**
   * Count weekend days in a year
   */
  private static countWeekendDays(year: number): number {
    let weekendDays = 0;
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        if (date.getDay() === 0 || date.getDay() === 6) {
          weekendDays++;
        }
      }
    }
    return weekendDays;
  }

  /**
   * Fallback calculation if YearService fails
   */
  private static getFallbackCalculation(params: HolidayCalculationParams): HolidayCalculationResult {
    const { year, workDaysPerYear, carryoverHolidays, personalHolidays } = params;
    
    const isLeapYear = this.isLeapYear(year);
    const totalDaysInYear = isLeapYear ? 366 : 365;
    const weekendDays = 104; // Approximate weekends per year
    const bankHolidaysOnWeekdays = 8; // Conservative estimate
    const availablePersonalHolidays = totalDaysInYear - weekendDays - bankHolidaysOnWeekdays - workDaysPerYear + carryoverHolidays;
    const usedPersonalHolidays = personalHolidays.size;
    const remainingHolidays = Math.max(0, availablePersonalHolidays - usedPersonalHolidays);
    
    return {
      remainingHolidays,
      totalDaysInYear,
      weekendDays,
      bankHolidaysOnWeekdays,
      availablePersonalHolidays,
      usedPersonalHolidays
    };
  }

  /**
   * Get detailed breakdown of holiday calculation for debugging
   */
  static getCalculationBreakdown(params: HolidayCalculationParams): {
    formula: string;
    values: Record<string, number>;
    result: number;
  } {
    const result = this.calculateRemainingHolidays(params);
    
    return {
      formula: 'days_in_year - weekend_days - bank_holidays_on_weekdays - work_days + carryover - personal_holidays',
      values: {
        days_in_year: result.totalDaysInYear,
        weekend_days: result.weekendDays,
        bank_holidays_on_weekdays: result.bankHolidaysOnWeekdays,
        work_days: params.workDaysPerYear,
        carryover: params.carryoverHolidays,
        personal_holidays: result.usedPersonalHolidays
      },
      result: result.remainingHolidays
    };
  }
}
