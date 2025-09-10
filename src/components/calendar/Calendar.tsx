import React, { useState, useEffect } from 'react';
import { YearService, YearData, Day, ICalEvent, LegendColorSettings } from '../../services';
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

const Calendar: React.FC<CalendarProps> = ({ 
  year = new Date().getFullYear(),
  country = 'US',
  state,
  className = '',
  personalHolidays = new Set(),
  icalEvents = [],
  onPersonalHolidayToggle,
  legendColorSettings
}) => {
  const [yearData, setYearData] = useState<YearData | null>(null);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadYearData = async () => {
      setLoading(true);
      try {
        const data = YearService.generateYearData(year, country, state);
        setYearData(data);
      } catch (error) {
        console.error('Failed to load year data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadYearData();
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

  if (loading) {
    return (
      <div className={`calendar-loading ${className}`}>
        <div className="loading-spinner"></div>
        <div>Loading calendar...</div>
      </div>
    );
  }

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
        personalHolidays={personalHolidays}
        icalEvents={icalEvents}
        legendColorSettings={legendColorSettings}
      />
    </div>
  );
};

export default Calendar;
