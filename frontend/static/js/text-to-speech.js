/**
 * text-to-speech.js
 * Handles the text-to-speech functionality for translation
 */

class TextToSpeechService {
  constructor() {
    this.apiUrl = 'https://api.leonardosanchez.online/api/text-to-speech';
    this.speakBtn = document.getElementById('speakTranslation');
    this.translatedText = document.getElementById('translatedText');
    this.targetLang = document.getElementById('targetLang');
    this.statusMessage = document.getElementById('statusMessage');
    this.audioPlayer = null;
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.speakBtn.addEventListener('click', () => {
      this.speakText();
    });
  }
  
  async speakText() {
    const text = this.translatedText.textContent.trim();
    if (!text) {
      this.showError('No text to play.');
      return;
    }
    
    const language = this.targetLang.value;
    
    // First, try using the browser API (faster)
    if (this.tryBrowserTTS(text, language)) {
      return;
    }
    
    // If it fails or is unavailable, use our backend
    try {
      this.speakBtn.disabled = true;
      this.speakBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          language
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Create audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Play the audio
      if (this.audioPlayer) {
        this.audioPlayer.pause();
        document.body.removeChild(this.audioPlayer);
      }
      
      this.audioPlayer = new Audio(audioUrl);
      this.audioPlayer.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
      document.body.appendChild(this.audioPlayer);
      this.audioPlayer.play();
      
    } catch (error) {
      console.error('Text-to-speech error:', error);
      this.showError('Error playing audio. Please try again.');
    } finally {
      this.speakBtn.disabled = false;
      this.speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    }
  }
  
  tryBrowserTTS(text, language) {
    // Check if the browser supports the speech synthesis API
    if (!('speechSynthesis' in window)) {
      return false;
    }
    
    // Mapping of language codes to voice codes
    const voiceLangMap = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'pt': 'pt-BR',
      'it': 'it-IT'
    };
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voiceLangMap[language] || 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    
    // Try to find an appropriate voice
    const voices = speechSynthesis.getVoices();
    const targetVoices = voices.filter(voice => voice.lang.startsWith(utterance.lang));
    
    if (targetVoices.length > 0) {
      // Prefer native voices if available
      const nativeVoice = targetVoices.find(voice => !voice.localService);
      utterance.voice = nativeVoice || targetVoices[0];
    }
    
    // Handle events
    utterance.onstart = () => {
      this.speakBtn.disabled = true;
      this.speakBtn.innerHTML = '<i class="fas fa-pause"></i>';
    };
    
    utterance.onend = () => {
      this.speakBtn.disabled = false;
      this.speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
    };
    
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.speakBtn.disabled = false;
      this.speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      
      // If it fails, cancel and return false so it tries our backend
      speechSynthesis.cancel();
      return false;
    };
    
    // Play
    speechSynthesis.speak(utterance);
    return true;
  }
  
  showError(message) {
    this.statusMessage.textContent = message;
    this.statusMessage.classList.add('error');
    this.statusMessage.classList.remove('success');
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
window.textToSpeechService = new TextToSpeechService();
