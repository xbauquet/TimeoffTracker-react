import React, { useState, useEffect } from 'react';
import { YearService, YearData } from '../services';

const YearDemo: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [country, setCountry] = useState('US');
  const [state, setState] = useState<string>('');
  const [yearData, setYearData] = useState<YearData | null>(null);
  const [availableCountries, setAvailableCountries] = useState<{ [key: string]: string }>({});
  const [availableStates, setAvailableStates] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const countries = YearService.getAvailableCountries();
    setAvailableCountries(countries);
  }, []);

  useEffect(() => {
    const states = YearService.getAvailableStates(country);
    setAvailableStates(states);
    setState(''); // Reset state when country changes
  }, [country]);

  useEffect(() => {
    const data = YearService.generateYearData(year, country, state || undefined);
    setYearData(data);
  }, [year, country, state]);

  if (!yearData) {
    return <div>Loading...</div>;
  }

  const workingDays = YearService.getWorkingDays(yearData);
  const weekends = YearService.getWeekends(yearData);
  const bankHolidays = YearService.getBankHolidays(yearData);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Year Information for {year}</h2>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <label>
          Year: 
          <input 
            type="number" 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
        
        <label>
          Country: 
          <select 
            value={country} 
            onChange={(e) => setCountry(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            {Object.entries(availableCountries).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </label>
        
        {Object.keys(availableStates).length > 0 && (
          <label>
            State/Region: 
            <select 
              value={state} 
              onChange={(e) => setState(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="">All</option>
              {Object.entries(availableStates).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div>
          <h3>Year Summary</h3>
          <ul>
            <li>Total Days: {yearData.totalDays}</li>
            <li>Leap Year: {yearData.isLeapYear ? 'Yes' : 'No'}</li>
            <li>Working Days: {workingDays.length}</li>
            <li>Weekends: {weekends.length}</li>
            <li>Bank Holidays: {bankHolidays.length}</li>
          </ul>
        </div>

        <div>
          <h3>Bank Holidays ({country}{state ? `, ${availableStates[state]}` : ''})</h3>
          <ul>
            {bankHolidays.map((day, index) => (
              <li key={index}>
                {day.date.toLocaleDateString()} - {day.bankHolidayName}
                <span style={{ fontSize: '0.8em', color: '#666', marginLeft: '5px' }}>
                  ({day.type})
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Months</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {yearData.months.map((month) => (
            <div key={month.monthNumber} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }}>
              <h4>{month.monthName}</h4>
              <p>Days: {month.daysInMonth}</p>
              <p>First day: {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][month.firstDayOfWeek]}</p>
              <p>Bank holidays: {month.days.filter(d => d.isBankHoliday).length}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearDemo;
