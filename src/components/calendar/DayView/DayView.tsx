import React from 'react';
import { Day } from '../../types/year';
import './DayView.scss';

interface DayViewProps {
  day: Day;
  isToday?: boolean;
  isSelected?: boolean;
  isPersonalHoliday?: boolean;
  onClick?: (day: Day) => void;
  className?: string;
}

const DayView: React.FC<DayViewProps> = ({ 
  day, 
  isToday = false, 
  isSelected = false, 
  isPersonalHoliday = false,
  onClick,
  className = ''
}) => {
  const getDayClassName = (): string => {
    const classes = ['linear-day'];
    
    // Personal holidays take precedence over other day types
    if (isPersonalHoliday && !day.isBankHoliday && !day.isWeekend) {
      classes.push('personal-holiday');
    } else if (day.isBankHoliday && day.isWeekend) {
      classes.push('holiday-weekend');
    } else if (day.isBankHoliday) {
      classes.push('holiday');
    } else if (day.isWeekend) {
      classes.push('weekend');
    } else {
      classes.push('normal');
    }
    
    if (isToday) {
      classes.push('today');
    }
    
    if (isSelected) {
      classes.push('selected');
    }
    
    return classes.join(' ');
  };

  const handleClick = () => {
    if (onClick) {
      onClick(day);
    }
  };

  return (
    <div 
      className={`${getDayClassName()} ${className}`}
      onClick={handleClick}
      title={day.bankHolidayName || `${day.date.toLocaleDateString()}`}
    >
      {day.dayOfMonth}
    </div>
  );
};

export default DayView;
