import React from 'react';
import { Month, Day } from '../../../types/year';
import { ICalEvent } from '../../../services';
import DayView from '../DayView';
import EventContainer from '../EventContainer';
import './MonthView.scss';

interface MonthViewProps {
  month: Month;
  selectedDay?: Day;
  onDayClick?: (day: Day) => void;
  personalHolidays?: Set<string>;
  icalEvents?: ICalEvent[];
  className?: string;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  month, 
  selectedDay, 
  onDayClick,
  personalHolidays = new Set(),
  icalEvents = [],
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

  // Calculate personal holidays count for this month
  const personalHolidaysCount = month.days.filter((day: Day) => {
    const dateKey = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.dayOfMonth).padStart(2, '0')}`;
    return personalHolidays.has(dateKey);
  }).length;

  // Get events for this month
  const monthYear = month.days[0]?.year || new Date().getFullYear();
  const monthEvents = icalEvents.filter(event => {
    const eventDate = new Date(event.startDate);
    const eventMonth = eventDate.getMonth(); // 0-indexed
    const eventYear = eventDate.getFullYear();
    const targetMonth = month.monthNumber - 1; // Convert 1-12 to 0-11
    
    return eventMonth === targetMonth && eventYear === monthYear;
  });

  // Helper function to get events for a specific day
  const getEventsForDay = (day: Day): ICalEvent[] => {
    return icalEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const dayDate = new Date(day.year, day.month - 1, day.dayOfMonth);
      
      // Check if the day falls within the event range
      return dayDate >= eventStart && dayDate <= eventEnd;
    });
  };

  return (
    <div className={`linear-month ${className}`}>
      {/* Month row with label, days, and total */}
      <div className="linear-month-row">
        <div className="linear-month-label">
          {month.monthNameShort}
        </div>
        <div className="linear-days">
          {emptyDays}
          {month.days.map((day: Day) => {
            const dateKey = `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.dayOfMonth).padStart(2, '0')}`;
            const isPersonalHoliday = personalHolidays.has(dateKey);
            const dayEvents = getEventsForDay(day);
            
            return (
              <DayView
                key={`${day.year}-${day.month}-${day.dayOfMonth}`}
                day={day}
                isToday={isCurrentMonth && day.dayOfMonth === today.getDate()}
                isSelected={selectedDay?.date.getTime() === day.date.getTime()}
                isPersonalHoliday={isPersonalHoliday}
                icalEvents={dayEvents}
                onClick={onDayClick}
              />
            );
          })}
        </div>
        <div className="linear-month-total">
          {personalHolidaysCount || 0}
        </div>
      </div>
      
      {/* Event rows below the month */}
      <EventContainer
        events={monthEvents}
        month={month.monthNumber - 1}
        year={monthYear}
      />
    </div>
  );
};

export default MonthView;
