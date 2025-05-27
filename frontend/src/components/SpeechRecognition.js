import React, { useState, useCallback } from 'react';
import './SpeechRecognition.css';

const SpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        // TODO: Send audioBlob to backend for processing
        setTranscript('Processing audio...');
      };

      mediaRecorder.start();
      setIsListening(true);
      setError(null);

      // Stop recording after 5 seconds (for testing)
      setTimeout(() => {
        mediaRecorder.stop();
        setIsListening(false);
      }, 5000);

    } catch (err) {
      setError('Error accessing microphone: ' + err.message);
      setIsListening(false);
    }
  }, []);

  return (
    <div className="speech-recognition">
      <button 
        className={`mic-button ${isListening ? 'listening' : ''}`}
        onClick={startListening}
        disabled={isListening}
      >
        {isListening ? 'Listening...' : 'Start Recording'}
      </button>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="transcript-box">
        <h3>Transcription:</h3>
        <p>{transcript || 'No transcription yet'}</p>
      </div>
    </div>
  );
};

export default SpeechRecognition; 