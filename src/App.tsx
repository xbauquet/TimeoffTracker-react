import React, { useState } from 'react';
import { Calendar } from './components/calendar';
import { Menu } from './components/Menu';
import './App.scss'

function App() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [country, setCountry] = useState('US');
  const [state, setState] = useState<string>('');

  return (
    <div className="app">
      <Menu 
        year={year}
        country={country}
        state={state}
        onYearChange={setYear}
        onCountryChange={setCountry}
        onStateChange={setState}
      />
      
      <div className="app-content">
        <main className="app-main">
          <Calendar 
            year={year}
            country={country}
            state={state}
          />
        </main>
      </div>
    </div>
  )
}

export default App
