export interface Day {
  date: Date;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  isWeekend: boolean;
  isBankHoliday: boolean;
  bankHolidayName?: string;
  month: number; // 1-12
  dayOfMonth: number; // 1-31
  year: number;
}

export interface Month {
  monthNumber: number; // 1-12
  monthName: string;
  monthNameShort: string;
  daysInMonth: number;
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  days: Day[];
}

export interface YearData {
  year: number;
  isLeapYear: boolean;
  totalDays: number;
  months: Month[];
  bankHolidays: BankHoliday[];
}

export interface BankHoliday {
  date: Date;
  name: string;
  type: 'fixed' | 'calculated' | 'library'; // fixed = same date every year, calculated = varies by year, library = from date-holidays library
}

export interface BankHolidayRule {
  name: string;
  type: 'fixed' | 'calculated';
  month: number;
  day?: number; // for fixed holidays
  week?: number; // for calculated holidays (e.g., 3rd Monday)
  dayOfWeek?: number; // for calculated holidays (0 = Sunday, 1 = Monday, etc.)
  description?: string;
}
