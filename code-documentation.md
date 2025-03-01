# Technical Documentation

## Backend Components

### 1. Main Structure (`main.py`)

The `main.py` file is the main entry point of the FastAPI application, which configures:

- Main FastAPI instance
- CORS Middleware to allow requests from the frontend
- Static routes to serve frontend files
- API routes for translation and speech processing

```python
# Allows CORS requests from any origin (for development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

This pattern allows the backend to serve both the API and static frontend files, simplifying deployment.

### 2. Data Models (`models.py`)

Defines Pydantic models that validate input and output data for the API:

- `TranslationRequest`: Structure for translation requests
- `TranslationResponse`: Structure for translation responses

These models ensure that data follows a predefined schema before processing.

### 3. Helper Functions (`helpers.py`)

Contains utilities for the system:

- `setup_logger`: Configures a custom logger for event tracking
- `current_timestamp`: Function to get the current timestamp in ISO format

### 4. Core Services

#### Speech Recognition (`speech_recognition.py`)

Implements functionality to convert audio into text:

- Uses the `facebook/wav2vec2-base-960h` model from Hugging Face
- Supports audio input as files or base64 encoded
- Manages temporary files for audio processing

```python
def transcribe_audio_base64(audio_base64: str, format: str = "wav") -> str:
    # Decode the base64 audio
    audio_bytes = base64.b64decode(audio_base64)
    
    # Temporarily save the audio
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{format}") as temp_file:
        temp_file.write(audio_bytes)
        temp_file_path = temp_file.name
    
    try:
        # Transcribe the audio
        transcription = transcribe_audio(temp_file_path)
        return transcription
    finally:
        # Clean up temporary files
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
```

#### Text-to-Speech (`text_to_speech_service.py`)

Converts text into audio using Hugging Face models:

- Manages different models based on the language
- Implements error handling with fallback options
- Generates temporary WAV audio files

#### Translation Service (`translation_service.py`)

The core component responsible for text translation:

- Implements a cache system to reuse translation pipelines
- Prioritizes specialized medical models when available
- Handles medical terms with specialized dictionaries
- Includes preprocessing and postprocessing to enhance medical accuracy

```python
def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    # Preprocess medical terms
    preprocessed_text = preprocess_medical_terms(text, source_lang)
    
    # Get the translation pipeline
    translation_pipeline = get_translation_pipeline(source_lang, target_lang)
    
    # Translate the text
    result = translation_pipeline(preprocessed_text)
    
    # [...]
    
    # Postprocess to correct medical terms
    final_text = postprocess_medical_translations(translated_text, source_lang, target_lang)
    
    return final_text
```

### 5. API Endpoints

#### Speech Endpoints (`speech.py`)

Defines routes for speech-related functionalities:

- `/api/transcribe`: Converts base64 audio to text
- `/api/transcribe/upload`: Processes uploaded audio files
- `/api/text-to-speech`: Converts text to speech

#### Translation Endpoints (`translation.py`)

Defines the routes for translation services:

- `/api/translate`: Translates text between specified languages

## Frontend Components

### 1. HTML Structure (`index.html`)

Defines the user interface structure:

- Elements for language selection
- Areas for original and translated transcription
- Controls for recording voice, translating, and playing audio
- Status indicators and error messages

### 2. CSS Styles (`style.css`)

Implements a responsive design with:

- CSS variables for a consistent theme
- Media queries for adaptation to different screen sizes
- Visual effects like pulse animations for recording
- Automated dark mode and color preferences

### 3. JavaScript

#### App Initialization (`app.js`)

Coordinates all frontend components:

- Initializes services and checks browser compatibility
- Configures keyboard shortcuts for common functions
- Manages settings persistence in localStorage

```javascript
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
  });
}
```

#### Speech Recognition (`speech-recognition.js`)

Implements speech recognition functionality using the Web Speech API:

- Manages the recording lifecycle
- Adapts recognition based on the selected language
- Handles errors and updates the UI in real-time

#### Text-to-Speech (`text-to-speech.js`)

Provides functionality to convert translated text into audio:

- First attempts to use the native browser API for performance
- Falls back to the backend API if unavailable
- Manages events and updates the UI during playback

#### Translation Service (`translation.js`)

Handles communication with the translation API:

- Sends requests to the backend and processes responses
- Implements features to swap languages
- Stores recent translation history in localStorage

## Security Considerations

### Backend

1. **Temporary File Handling**:
   - Audio files are stored in temporary locations
   - Cleanup mechanisms are implemented to delete files after processing

2. **Input Validation**:
   - Pydantic models validate all API inputs
   - Limits are implemented to prevent excessive resource consumption

3. **CORS Configuration**:
   - In production, it is recommended to restrict allowed origins to specific domains

### Frontend

1. **Input and Output Sanitization**:
   - Data is validated before being sent to the backend
   - Responses are securely handled to prevent XSS vulnerabilities

2. **Robust Error Handling**:
   - Clear feedback on issues without exposing technical details
   - Edge case handling to prevent unexpected behaviors

## Performance Optimization

### Backend

1. **Model Caching**:
   - ML models are loaded once and reused
   - Fallback implementation if preferred models are unavailable

2. **Efficient Processing**:
   - Careful memory management for large audio files
   - Resource cleanup to prevent memory leaks

### Frontend

1. **Optimized User Experience**:
   - Immediate visual feedback during async operations
   - Throttling to prevent excessive API calls

2. **Efficient Storage**:
   - Uses localStorage to store preferences and recent history
   - Limits history size to avoid storage issues

## Testing and Quality Assurance

To maintain code quality, the following testing approaches are recommended:

1. **Unit Testing**:
   - Backend: Test individual functions using pytest
   - Frontend: Test JavaScript components using Jest

2. **Integration Testing**:
   - Verify proper communication between frontend and backend
   - Test full translation and speech processing flow

3. **Usability Testing**:
   - Real user testing to identify UX issues
   - Feedback on medical translation accuracy

