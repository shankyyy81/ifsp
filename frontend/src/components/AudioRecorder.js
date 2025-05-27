import React, { useState, useRef } from 'react';
import axios from 'axios';

const AudioRecorder = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      setError('Error accessing microphone. Please ensure microphone permissions are granted.');
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorderRef.current) return;

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        resolve();
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    });
  };

  const processAudio = async (audioBlob) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');

      const response = await axios.post('http://localhost:8000/api/v1/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout
      });

      const transcribedText = response.data.text;
      setTranscription(transcribedText);
      
      // Call the onTranscription callback with the transcribed text
      if (onTranscription) {
        onTranscription(transcribedText);
      }
    } catch (err) {
      let errorMessage = 'An error occurred while processing the audio.';
      
      if (err.response) {
        // Server responded with an error
        errorMessage = err.response.data.detail || errorMessage;
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Could not connect to the server. Please check your connection.';
      }
      
      setError(errorMessage);
      console.error('Error processing audio:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = async () => {
    setError(null);
    setTranscription('');
    await startRecording();
  };

  return (
    <div className="audio-recorder">
      <div className="controls">
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`record-button ${isRecording ? 'recording' : ''}`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        )}
      </div>

      {isProcessing && (
        <div className="processing-message">
          Processing audio... Please wait.
        </div>
      )}

      {transcription && (
        <div className="transcription">
          <h3>Transcription:</h3>
          <p style={{ color: '#111', fontSize: '20px', fontWeight: 500, margin: 0 }}>{transcription}</p>
        </div>
      )}

      <style jsx>{`
        .audio-recorder {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .controls {
          margin-bottom: 20px;
        }

        .record-button {
          padding: 10px 20px;
          font-size: 16px;
          border: none;
          border-radius: 5px;
          background-color: #007bff;
          color: white;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .record-button:hover {
          background-color: #0056b3;
        }

        .record-button.recording {
          background-color: #dc3545;
        }

        .record-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .error-message {
          margin-top: 10px;
          padding: 10px;
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 5px;
          color: #721c24;
        }

        .retry-button {
          margin-top: 10px;
          padding: 5px 15px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }

        .processing-message {
          margin: 10px 0;
          padding: 10px;
          background-color: #e2e3e5;
          border-radius: 5px;
          text-align: center;
        }

        .transcription {
          margin-top: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }

        .transcription h3 {
          margin-top: 0;
          color: #343a40;
        }

        .transcription p {
          color: #212529;
          font-size: 16px;
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder; 