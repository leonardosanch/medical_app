/**
 * speech-recognition.js
 * Handles voice recognition functionality using the Web Speech API
 */

class SpeechRecognitionHandler {
  constructor() {
    this.recognition = null;
    this.isRecording = false;
    this.currentText = '';
    this.lang = 'en-US';
    
    // DOM Elements
    this.startBtn = document.getElementById('startRecording');
    this.stopBtn = document.getElementById('stopRecording');
    this.inputText = document.getElementById('inputText');
    this.recordingStatus = document.getElementById('recordingStatus');
    this.statusMessage = document.getElementById('statusMessage');
    this.sourceLangSelect = document.getElementById('sourceLang');
    
    // Language code mapping for speech recognition
    this.langCodes = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'it': 'it-IT'
    };
    
    this.initSpeechRecognition();
    this.setupEventListeners();
  }
  
  initSpeechRecognition() {
    // Check browser support for the API
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      this.showError('Your browser does not support speech recognition. Try using Chrome or Edge.');
      this.startBtn.disabled = true;
      return;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.lang;
    
    // Handle results
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Update existing text or start a new one
      if (finalTranscript) {
        this.inputText.value = this.currentText + finalTranscript + ' ';
        this.currentText = this.inputText.value;
      } else if (interimTranscript) {
        this.inputText.value = this.currentText + interimTranscript;
      }
    };
    
    // Handle errors
    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        this.showError('No audio detected. Make sure to allow microphone access.');
      } else if (event.error === 'audio-capture') {
        this.showError('Cannot access the microphone. Check your device settings.');
      } else if (event.error === 'not-allowed') {
        this.showError('Microphone access was denied. Allow access to use this feature.');
      } else {
        this.showError(`Recognition error: ${event.error}`);
      }
      this.stopRecording();
    };
    
    // When recognition ends (due to timeout or pause)
    this.recognition.onend = () => {
      if (this.isRecording) {
        // If still recording, restart
        this.recognition.start();
      } else {
        this.updateUIState(false);
      }
    };
  }
  
  setupEventListeners() {
    // Start recording button
    this.startBtn.addEventListener('click', () => {
      this.startRecording();
    });
    
    // Stop recording button
    this.stopBtn.addEventListener('click', () => {
      this.stopRecording();
    });
    
    // Change source language
    this.sourceLangSelect.addEventListener('change', () => {
      const langCode = this.sourceLangSelect.value;
      this.updateLanguage(langCode);
    });
    
    // Clear text button
    document.getElementById('clearSource').addEventListener('click', () => {
      this.inputText.value = '';
      this.currentText = '';
    });
  }
  
  startRecording() {
    if (!this.recognition) {
      this.initSpeechRecognition();
      if (!this.recognition) return;
    }
    
    this.isRecording = true;
    this.currentText = this.inputText.value;
    
    try {
      this.recognition.start();
      this.updateUIState(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
      this.showError('Error starting recording. Try again.');
    }
  }
  
  stopRecording() {
    if (this.recognition) {
      this.isRecording = false;
      this.recognition.stop();
      this.updateUIState(false);
    }
  }
  
  updateLanguage(langCode) {
    if (this.recognition) {
      // Update recognition language
      this.lang = this.langCodes[langCode] || 'en-US';
      this.recognition.lang = this.lang;
      
      // Restart if currently recording
      if (this.isRecording) {
        this.stopRecording();
        this.startRecording();
      }
    }
  }
  
  updateUIState(isRecording) {
    if (isRecording) {
      this.startBtn.classList.add('hidden');
      this.stopBtn.classList.remove('hidden');
      this.recordingStatus.classList.remove('hidden');
    } else {
      this.startBtn.classList.remove('hidden');
      this.stopBtn.classList.add('hidden');
      this.recordingStatus.classList.add('hidden');
    }
  }
  
  showError(message) {
    this.statusMessage.textContent = message;
    this.statusMessage.classList.add('error');
    this.statusMessage.classList.remove('hidden');
    
    // Hide after 5 seconds
    setTimeout(() => {
      this.statusMessage.classList.add('hidden');
    }, 5000);
  }
  
  showSuccess(message) {
    this.statusMessage.textContent = message;
    this.statusMessage.classList.remove('error');
    this.statusMessage.classList.add('success');
    this.statusMessage.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
      this.statusMessage.classList.add('hidden');
    }, 3000);
  }
}

// Export for use in other files
window.speechRecognitionHandler = new SpeechRecognitionHandler();
