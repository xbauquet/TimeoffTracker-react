import React from 'react';
import { YearData, Day } from '../../../types/year';
import { ICalEvent } from '../../../types/ical';
import MonthView from '../MonthView';
import DayHeader from '../DayHeader';
import './YearView.scss';

interface YearViewProps {
  yearData: YearData;
  selectedDay?: Day;
  onDayClick?: (day: Day) => void;
  personalHolidays?: Set<string>;
  icalEvents?: ICalEvent[];
  className?: string;
}

const YearView: React.FC<YearViewProps> = ({ 
  yearData, 
  selectedDay, 
  onDayClick,
  personalHolidays = new Set(),
  icalEvents = [],
  className = ''
}) => {
  // const [hoveredDay, setHoveredDay] = useState<Day | null>(null);

  const handleDayClick = (day: Day) => {
    if (onDayClick) {
      onDayClick(day);
    }
  };

  // const handleDayHover = (day: Day | null) => {
  //   setHoveredDay(day);
  // };

  return (
    <div className={`year-view ${className}`}>
      <div className="calendar-linear">
        {/* Day names header component */}
        <DayHeader/>

        {/* Months */}
        {yearData.months.map((month: any, index: number) => (
          <MonthView
            key={`${yearData.year}-${month.monthNumber}`}
            month={month}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
            personalHolidays={personalHolidays}
            icalEvents={icalEvents}
            className={index >= 3 && index % 3 === 0 ? 'quarter-start' : ''}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <div className="legend-color normal"></div>
          <span>Jour normal</span>
        </div>
        <div className="legend-item">
          <div className="legend-color weekend"></div>
          <span>Week-end</span>
        </div>
        <div className="legend-item">
          <div className="legend-color holiday"></div>
          <span>Jour férié</span>
        </div>
        <div className="legend-item">
          <div className="legend-color holiday-weekend"></div>
          <span>Jour férié (week-end)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color personal-holiday"></div>
          <span>Congé personnel</span>
        </div>
        <div className="legend-item">
          <div className="legend-color has-ical-events"></div>
          <span>Événements iCal</span>
        </div>
      </div>

      {/* Day info tooltip - commented out for now */}
      {/* {hoveredDay && (
        <div className="day-tooltip">
          <div className="tooltip-content">
            <div className="tooltip-date">{hoveredDay.date.toLocaleDateString()}</div>
            {hoveredDay.bankHolidayName && (
              <div className="tooltip-holiday">{hoveredDay.bankHolidayName}</div>
            )}
            <div className="tooltip-type">
              {hoveredDay.isBankHoliday && hoveredDay.isWeekend && 'Bank holiday (weekend)'}
              {hoveredDay.isBankHoliday && !hoveredDay.isWeekend && 'Bank holiday'}
              {!hoveredDay.isBankHoliday && hoveredDay.isWeekend && 'Weekend'}
              {!hoveredDay.isBankHoliday && !hoveredDay.isWeekend && 'Working day'}
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default YearView;
