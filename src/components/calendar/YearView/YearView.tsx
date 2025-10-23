import React, { memo } from 'react';
import { YearData, Day } from '../../../types/year';
import { ICalEvent } from '../../../types/ical';
import { LegendColorSettings } from '../../../services';
import MonthView from '../MonthView';
import DayHeader from '../DayHeader';
import './YearView.scss';

interface YearViewProps {
  yearData: YearData;
  selectedDay?: Day;
  onDayClick?: (day: Day) => void;
  personalHolidays?: Set<string>;
  icalEvents?: ICalEvent[];
  legendColorSettings?: LegendColorSettings;
  className?: string;
}

const YearView: React.FC<YearViewProps> = memo(({ 
  yearData, 
  selectedDay, 
  onDayClick,
  personalHolidays = new Set(),
  icalEvents = [],
  legendColorSettings,
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
        {/* Global day header */}
        <DayHeader months={yearData.months} />
        
        {/* Months */}
        {yearData.months.map((month: any, index: number) => (
          <MonthView
            key={`${yearData.year}-${month.monthNumber}`}
            month={month}
            selectedDay={selectedDay}
            onDayClick={handleDayClick}
            personalHolidays={personalHolidays as Set<string>}
            icalEvents={icalEvents}
            legendColorSettings={legendColorSettings}
            className={index >= 3 && index % 3 === 0 ? 'quarter-start' : ''}
          />
        ))}
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
});

YearView.displayName = 'YearView';

export default YearView;
