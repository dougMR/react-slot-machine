import React from 'react';
// import logo from './logo.svg';
import './App.css';
// import Strip from './Components/Reel.jsx';
import Window from './Components/Reel.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h3>SLOTS</h3>
        <Window />
        {/* <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
      </header>
    </div>
  );
}

export default App;
