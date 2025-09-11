import React, { useState, memo, useMemo } from 'react';
import { YearService, Day, ICalEvent, LegendColorSettings } from '../../services';
import YearView from './YearView';
import './Calendar.scss';

interface CalendarProps {
  year?: number;
  country?: string;
  state?: string;
  className?: string;
  personalHolidays?: Set<string>;
  icalEvents?: ICalEvent[];
  onPersonalHolidayToggle?: (dateKey: string) => void;
  legendColorSettings?: LegendColorSettings;
}

const Calendar: React.FC<CalendarProps> = memo(({ 
  year = new Date().getFullYear(),
  country = 'US',
  state,
  className = '',
  personalHolidays = new Set(),
  icalEvents = [],
  onPersonalHolidayToggle,
  legendColorSettings
}) => {
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);

  // Use useMemo to generate year data only when dependencies change
  const yearData = useMemo(() => {
    try {
      return YearService.generateYearData(year, country, state);
    } catch (error) {
      console.error('Failed to generate year data:', error);
      return null;
    }
  }, [year, country, state]);

  const handleDayClick = (day: Day) => {
    // Only allow toggling personal holidays on working days (not weekends or bank holidays)
    if (!day.isWeekend && !day.isBankHoliday && onPersonalHolidayToggle) {
      const dateKey = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.dayOfMonth).padStart(2, '0')}`;
      onPersonalHolidayToggle(dateKey);
    } else {
      setSelectedDay(day);
    }
  };

  if (!yearData) {
    return (
      <div className={`calendar-error ${className}`}>
        <div>Failed to load calendar data</div>
      </div>
    );
  }

  return (
    <div className={`calendar-container ${className}`}>
      <YearView
        yearData={yearData}
        selectedDay={selectedDay || undefined}
        onDayClick={handleDayClick}
        personalHolidays={personalHolidays as Set<string>}
        icalEvents={icalEvents}
        legendColorSettings={legendColorSettings}
      />
    </div>
  );
});

Calendar.displayName = 'Calendar';

export default Calendar;
