/**
 * app.js
 * Main JavaScript file that initializes all components
 * and handles global interaction between them
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global variables
  const app = {
    isInitialized: false,
    services: {
      speech: window.speechRecognitionHandler,
      translation: window.translationService,
      tts: window.textToSpeechService
    },
    elements: {
      translateBtn: document.getElementById('translateBtn'),
      inputText: document.getElementById('inputText'),
      translatedText: document.getElementById('translatedText'),
      sourceLang: document.getElementById('sourceLang'),
      targetLang: document.getElementById('targetLang'),
      statusMessage: document.getElementById('statusMessage')
    }
  };
  
  // Initialize the application
  function initApp() {
    if (app.isInitialized) return;
    
    // Check browser support for critical functions
    checkBrowserSupport();
    
    // Set up keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Load saved settings (if any)
    loadSavedSettings();
    
    // Mark as initialized
    app.isInitialized = true;
    
    console.log('Healthcare Translation App successfully initialized');
  }
  
  // Check browser capabilities
  function checkBrowserSupport() {
    // List of checks
    const checks = [
      { feature: 'fetch' in window, name: 'Fetch API' },
      { feature: 'localStorage' in window, name: 'Local Storage' }
    ];
    
    // Show warnings for unsupported features
    checks.forEach(check => {
      if (!check.feature) {
        console.warn(`Warning: Your browser does not support ${check.name}, some features may not be available.`);
      }
    });
  }
  
  // Set up keyboard shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+Enter to translate from anywhere
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        app.elements.translateBtn.click();
      }
      
      // Ctrl+Shift+S to start/stop recording
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        
        if (app.services.speech.isRecording) {
          document.getElementById('stopRecording').click();
        } else {
          document.getElementById('startRecording').click();
        }
      }
      
      // Ctrl+Shift+P to play the translation
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        document.getElementById('speakTranslation').click();
      }
    });
  }
  
  // Load saved settings
  function loadSavedSettings() {
    try {
      // Retrieve settings from localStorage
      const savedSettings = JSON.parse(localStorage.getItem('healthcareTranslationSettings') || '{}');
      
      // Apply settings
      if (savedSettings.sourceLang) {
        app.elements.sourceLang.value = savedSettings.sourceLang;
      }
      
      if (savedSettings.targetLang) {
        app.elements.targetLang.value = savedSettings.targetLang;
      }
      
      // Update speech recognition language
      if (app.services.speech) {
        app.services.speech.updateLanguage(app.elements.sourceLang.value);
      }
    } catch (e) {
      console.error('Error loading saved settings:', e);
    }
  }
  
  // Save current settings
  function saveSettings() {
    try {
      const settings = {
        sourceLang: app.elements.sourceLang.value,
        targetLang: app.elements.targetLang.value
      };
      
      localStorage.setItem('healthcareTranslationSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }
  
  // Save settings when language selectors change
  app.elements.sourceLang.addEventListener('change', saveSettings);
  app.elements.targetLang.addEventListener('change', saveSettings);
  
  // Initialize the application
  initApp();
});
