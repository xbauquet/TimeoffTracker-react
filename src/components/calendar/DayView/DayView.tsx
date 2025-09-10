import React from 'react';
import { Day } from '../../types/year';
import './DayView.scss';

interface DayViewProps {
  day: Day;
  isToday?: boolean;
  isSelected?: boolean;
  onClick?: (day: Day) => void;
  className?: string;
}

const DayView: React.FC<DayViewProps> = ({ 
  day, 
  isToday = false, 
  isSelected = false, 
  onClick,
  className = ''
}) => {
  const getDayClassName = (): string => {
    const classes = ['linear-day'];
    
    if (day.isBankHoliday && day.isWeekend) {
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
