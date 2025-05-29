import React, { useState } from 'react';
import './App.css';
import AudioRecorder from './components/AudioRecorder';
import SignLanguageAvatar from './components/SignLanguageAvatar';

function App() {
  const [gestureSequence, setGestureSequence] = useState([]);

  const handleTranscription = async (text) => {
    try {
      // Get gesture sequence from backend
      const response = await fetch('http://localhost:8002/api/v1/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      const data = await response.json();
      setGestureSequence(data.gestures);
    } catch (error) {
      console.error('Error getting gesture sequence:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Speech to Sign Language Translator</h1>
      </header>
      
      <main className="App-main">
        <div className="avatar-section">
          <SignLanguageAvatar gestureSequence={gestureSequence} />
        </div>
        
        <div className="controls-section">
          <AudioRecorder onTranscription={handleTranscription} />
        </div>
      </main>

      <style>{`
        .App {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #f5f5f5;
        }

        .App-header {
          background-color: #282c34;
          padding: 20px;
          color: white;
          text-align: center;
        }

        .App-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .App-main {
          flex: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        .avatar-section {
          flex: 1;
          min-height: 400px;
        }

        .controls-section {
          flex: 0 0 auto;
        }

        @media (min-width: 768px) {
          .App-main {
            flex-direction: row;
          }

          .avatar-section {
            flex: 2;
          }

          .controls-section {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default App; 