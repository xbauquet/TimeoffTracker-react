import React from 'react';
import { Day } from '../../../types/year';
import { ICalEvent } from '../../../types/ical';
import './DayView.scss';

interface DayViewProps {
  day: Day;
  isToday?: boolean;
  isSelected?: boolean;
  isPersonalHoliday?: boolean;
  icalEvents?: ICalEvent[];
  onClick?: (day: Day) => void;
  className?: string;
}

const DayView: React.FC<DayViewProps> = ({ 
  day, 
  isToday = false, 
  isSelected = false, 
  isPersonalHoliday = false,
  icalEvents = [],
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
    
    // Add iCal events indicator
    if (icalEvents && icalEvents.length > 0) {
      classes.push('has-ical-events');
    }
    
    if (isToday) {
      classes.push('today');
    }
    
    if (isSelected) {
      classes.push('selected');
    }
    
    return classes.join(' ');
  };

  const getEventTooltip = (): string => {
    const tooltips = [];
    
    if (day.bankHolidayName) {
      tooltips.push(day.bankHolidayName);
    }
    
    if (icalEvents && icalEvents.length > 0) {
      icalEvents.forEach(event => {
        tooltips.push(`📅 ${event.summary}`);
        if (event.location) {
          tooltips.push(`📍 ${event.location}`);
        }
      });
    }
    
    if (tooltips.length === 0) {
      return day.date.toLocaleDateString();
    }
    
    return tooltips.join('\n');
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
      title={getEventTooltip()}
    >
      <div className="day-number">{day.dayOfMonth}</div>
    </div>
  );
};

export default DayView;
