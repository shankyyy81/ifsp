import React, { useState, useCallback, useEffect } from 'react';

const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const sendAudioToBackend = async (audioBlob) => {
    try {
      setIsTranscribing(true);
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:8000/api/v1/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscribedText(data.text);
    } catch (error) {
      console.error('Error sending audio to backend:', error);
      alert('Error transcribing audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((chunks) => [...chunks, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        console.log('Recording stopped, audio blob created:', audioBlob);
        
        // Display recording info
        const recordingInfo = document.getElementById('recording-info');
        if (recordingInfo) {
          recordingInfo.textContent = `Recording completed! Duration: ${recordingDuration}s, Size: ${(audioBlob.size / 1024).toFixed(2)}KB`;
        }

        // Send to backend for transcription
        await sendAudioToBackend(audioBlob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioChunks([]); // Clear previous chunks
      setTranscribedText(''); // Clear previous transcription
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  }, [audioChunks, recordingDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, [mediaRecorder, isRecording]);

  return (
    <div className="audio-recorder">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: isRecording ? '#ff4444' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '10px'
        }}
      >
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      {isRecording && (
        <div style={{ color: '#ff4444', marginBottom: '10px' }}>
          Recording in progress... ({recordingDuration}s)
        </div>
      )}
      <div id="recording-info" style={{ 
        marginTop: '10px', 
        padding: '10px',
        backgroundColor: '#f0f0f0',
        borderRadius: '5px',
        minHeight: '20px'
      }}></div>
      {isTranscribing && (
        <div style={{ marginTop: '10px', color: '#666' }}>
          Transcribing audio...
        </div>
      )}
      {transcribedText && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: '#e8f5e9',
          borderRadius: '5px',
          textAlign: 'left'
        }}>
          <strong>Transcribed Text:</strong>
          <p>{transcribedText}</p>
        </div>
      )}
    </div>
  );
};

export default AudioRecorder; 