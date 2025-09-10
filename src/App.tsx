import React, { useState } from 'react';
import { Calendar } from './components/calendar';
import './App.scss'

function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [country, setCountry] = useState('US');
  const [state, setState] = useState<string>('');

  return (
    <div className="app">
      <header className="app-header">
        <h1>Timeoff Tracker</h1>
        <div className="app-controls">
          <div className="control-group">
            <label>Year:</label>
            <input 
              type="number" 
              value={year} 
              onChange={(e) => setYear(parseInt(e.target.value))}
            />
          </div>
          <div className="control-group">
            <label>Country:</label>
            <select 
              value={country} 
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="CA">Canada</option>
            </select>
          </div>
        </div>
      </header>
      
      <main className="app-main">
        <Calendar 
          year={year}
          country={country}
          state={state}
        />
      </main>
    </div>
  )
}

export default App
