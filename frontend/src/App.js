import React from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Speech to Sign Language Translator</h1>
        <AudioRecorder />
      </header>
    </div>
  );
}

export default App; 