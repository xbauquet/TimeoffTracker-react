import React, { useState, useEffect } from 'react';
import { YearService, YearData, Day } from '../services';
import YearView from './YearView';
import './Calendar.scss';

interface CalendarProps {
  year?: number;
  country?: string;
  state?: string;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({ 
  year = new Date().getFullYear(),
  country = 'US',
  state,
  className = ''
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
    setSelectedDay(day);
    console.log('Selected day:', day);
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
        selectedDay={selectedDay}
        onDayClick={handleDayClick}
      />
    </div>
  );
};

export default Calendar;
