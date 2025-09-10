import React from 'react';
import { Month, Day } from '../../types/year';
import DayView from '../DayView';
import './MonthView.scss';

interface MonthViewProps {
  month: Month;
  selectedDay?: Day;
  onDayClick?: (day: Day) => void;
  className?: string;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  month, 
  selectedDay, 
  onDayClick,
  className = ''
}) => {
  const today = new Date();
  const isCurrentMonth = month.monthNumber === today.getMonth() + 1 && 
                        month.days[0]?.year === today.getFullYear();

  // Calculate Monday-first alignment
  // Convert Sunday (0) to 6, Monday (1) to 0, etc.
  const mondayFirstOffset = month.firstDayOfWeek === 0 ? 6 : month.firstDayOfWeek - 1;
  const emptyDays = Array.from({ length: mondayFirstOffset }, (_, index) => (
    <div key={`empty-${index}`} className="linear-day empty"></div>
  ));

  // Calculate personal holidays count for this month (placeholder for now)
  const personalHolidaysCount = month.days.filter(day => 
    // This would be where we check for personal holidays
    // For now, return 0 or a random number for demo
    false
  ).length;

  return (
    <div className={`linear-month ${className}`}>
      <div className="linear-month-label">
        {month.monthNameShort}
      </div>
      <div className="linear-days">
        {emptyDays}
        {month.days.map((day) => (
          <DayView
            key={`${day.year}-${day.month}-${day.dayOfMonth}`}
            day={day}
            isToday={isCurrentMonth && day.dayOfMonth === today.getDate()}
            isSelected={selectedDay?.date.getTime() === day.date.getTime()}
            onClick={onDayClick}
          />
        ))}
      </div>
      <div className="linear-month-total">
        {personalHolidaysCount || 0}
      </div>
    </div>
  );
};

export default MonthView;
