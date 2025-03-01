/**
 * translation.js
 * Handles communication with the backend to translate text
 */

class TranslationService {
  constructor() {
    this.apiUrl = 'https://api.leonardosanchez.online/api/translate';
    this.translateBtn = document.getElementById('translateBtn');
    this.inputText = document.getElementById('inputText');
    this.translatedText = document.getElementById('translatedText');
    this.sourceLang = document.getElementById('sourceLang');
    this.targetLang = document.getElementById('targetLang');
    this.statusMessage = document.getElementById('statusMessage');
    this.switchBtn = document.getElementById('switchLanguages');
    
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    // Translation button
    this.translateBtn.addEventListener('click', () => {
      this.translateText();
    });
    
    // Allow translation with Enter in the textarea
    this.inputText.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.translateText();
      }
    });
    
    // Button to switch languages
    this.switchBtn.addEventListener('click', () => {
      this.switchLanguages();
    });
    
    // Button to copy the translation
    document.getElementById('copyTranslation').addEventListener('click', () => {
      this.copyTranslatedText();
    });
  }
  
  async translateText() {
    const text = this.inputText.value.trim();
    if (!text) {
      this.showError('Please enter text to translate.');
      return;
    }
    
    const source_lang = this.sourceLang.value;
    const target_lang = this.targetLang.value;
    
    if (source_lang === target_lang) {
      this.showError('Source and target languages cannot be the same.');
      return;
    }
    
    // Show loading indicator
    this.translatedText.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          source_lang,
          target_lang
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.translatedText.textContent = data.translated_text;
      
      // Save to localStorage for recent history
      this.saveTranslationToHistory(text, data.translated_text, source_lang, target_lang);
    } catch (error) {
      console.error('Translation error:', error);
      this.showError('Error translating text. Please try again.');
      this.translatedText.textContent = '';
    }
  }
  
  switchLanguages() {
    // Save current values
    const sourceValue = this.sourceLang.value;
    const targetValue = this.targetLang.value;
    
    // Swap
    this.sourceLang.value = targetValue;
    this.targetLang.value = sourceValue;
    
    // If there is translated text, swap the texts as well
    if (this.translatedText.textContent.trim()) {
      const inputValue = this.inputText.value;
      this.inputText.value = this.translatedText.textContent;
      this.translatedText.textContent = inputValue;
    }
    
    // Update speech recognition language
    if (window.speechRecognitionHandler) {
      window.speechRecognitionHandler.updateLanguage(this.sourceLang.value);
    }
  }
  
  copyTranslatedText() {
    const text = this.translatedText.textContent;
    if (!text) return;
    
    navigator.clipboard.writeText(text)
      .then(() => {
        this.showSuccess('Text copied to clipboard');
      })
      .catch(err => {
        console.error('Error copying:', err);
        this.showError('Could not copy text');
      });
  }
  
  saveTranslationToHistory(sourceText, translatedText, sourceLang, targetLang) {
    // Basic history implementation using localStorage
    try {
      const history = JSON.parse(localStorage.getItem('translationHistory') || '[]');
      
      history.unshift({
        sourceText: sourceText.substring(0, 100), // Limit size
        translatedText: translatedText.substring(0, 100),
        sourceLang,
        targetLang,
        timestamp: new Date().toISOString()
      });
      
      // Keep only the 10 most recent translations
      const limitedHistory = history.slice(0, 10);
      
      localStorage.setItem('translationHistory', JSON.stringify(limitedHistory));
    } catch (e) {
      console.error('Error saving to history:', e);
    }
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
window.translationService = new TranslationService();
