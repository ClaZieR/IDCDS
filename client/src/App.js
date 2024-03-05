import './App.css';
import { useState } from 'react';
import walletConnet from './components/walletConnet.jsx';
import test from './components/test.jsx';


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          {walletConnet()}

        </h1>
      </header>
    </div>
  );
}

export default App;
