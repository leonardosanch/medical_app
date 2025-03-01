# Healthcare Translation Web App

Healthcare Translation Web App is a prototype designed to facilitate real-time translation between patients and healthcare providers using generative AI tools.

## Key Features

- **Speech-to-Text Conversion**: Utilizes the Web Speech API on the frontend and Hugging Face models on the backend to convert speech to text with enhanced accuracy for medical terms.
- **Real-Time Translation**: Employs Hugging Face models optimized for medical terminology to translate text between different languages.
- **Audio Playback**: Converts translated text into audio using both the browser's Web Speech API and backend services.
- **Responsive Design**: Interface adapted for mobile and desktop devices, following "Mobile-First" principles.
- **Medical Terminology Processing**: Recognizes and processes medical terms accurately using specialized dictionaries.
- **Keyboard Shortcuts**: Enhances accessibility and usability with shortcuts for common functions.
- **Local Storage**: Saves language preferences and a history of recent translations.

## Project Structure

### Backend (FastAPI)

```
backend/
├── main.py                    # FastAPI application entry point
├── models.py                  # Pydantic data models
├── helpers.py                 # Helper functions for logging and timestamps
├── services/
│   ├── speech_recognition.py  # Audio transcription service
│   ├── text_to_speech_service.py  # Text-to-speech conversion service
│   └── translation_service.py # Text translation service
└── endpoints/
    ├── speech.py              # Endpoints for speech recognition and synthesis
    └── translation.py         # Endpoints for text translation
```

### Frontend (HTML/CSS/JavaScript)

```
frontend/
├── templates/
│   └── index.html            # Main HTML structure of the application
└── static/
    ├── css/
    │   └── style.css         # UI styling
    └── js/
        ├── app.js            # Initialization and component coordination
        ├── speech-recognition.js  # Voice recognition handling
        ├── text-to-speech.js # Text-to-speech conversion
        └── translation.js    # Communication with the translation API
```

## Technologies Used

### Backend

- **FastAPI**: High-performance web framework for APIs
- **Hugging Face Transformers**: AI models for natural language processing
- **PyTorch**: Machine learning framework
- **SoundFile**: Audio file processing
- **Uvicorn**: ASGI server for FastAPI

### Frontend

- **HTML5/CSS3**: Responsive layout and styling
- **JavaScript (ES6+)**: Client-side logic and interactivity
- **Web Speech API**: Native browser API for speech recognition and synthesis
- **Fetch API**: For backend communication

## AI Models Used

### Translation

- **Helsinki-NLP/opus-mt-med**: Specialized medical translation models
- **Helsinki-NLP/opus-mt**: General translation models
- **Facebook/nllb-200-distilled-600M**: Multilingual model for unsupported language pairs

### Speech Recognition

- **facebook/wav2vec2-base-960h**: Automatic speech recognition (ASR) model

### Text-to-Speech

- **facebook/mms-tts-eng**: English text-to-speech model

## Setup and Deployment

### Prerequisites

- Python 3.8+
- Node.js and npm (optional, for development)
- Internet access (to download Hugging Face models)

### Backend Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/leonardosanch/medical_app.git
   cd medical_app
   ```

2. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Deployment

- **Backend**: Deployed on a virtual machine with Ubuntu on Hostinger
- **Frontend**: Deployed on Vercel with a custom domain

The application is currently available at: https://www.leonardosanchez.online/

## Detailed Features

### Medical Terminology Processing

The system uses specialized dictionaries to improve translation accuracy for medical terms:

1. **Preprocessing**: Identifies and normalizes common medical terms before translation
2. **Postprocessing**: Verifies and corrects specific medical terms after translation

### Speech Recognition

The system offers two options for speech recognition:

1. **Frontend (Web Speech API)**: Real-time recognition in the browser
2. **Backend (Hugging Face)**: For higher accuracy or compatibility needs

### Text-to-Speech

Similarly, the system provides two methods for text-to-speech conversion:

1. **Browser**: Uses the browser's Speech Synthesis API when available
2. **Backend**: Uses Hugging Face models to generate high-quality audio

## Data Security and Privacy

- **CORS**: Security policies to control API access
- **Local Processing**: Sensitive data is processed locally when possible
- **Temporary Storage**: Audio files are stored temporarily and deleted after processing
- **No Permanent Data Storage**: Conversations or translations are not stored on the server

## User Guide

1. **Select Languages**: Choose source and target languages from the dropdown menus
2. **Input Text**:
   - Type directly into the text area
   - Or click the microphone icon to record your voice
3. **Translate**: Click the "Translate" button or use Ctrl+Enter
4. **Audio Playback**: Click the speaker icon to listen to the translation
5. **Additional Features**:
   - Swap languages using the arrow button
   - Copy translation to clipboard
   - Clear text using the trash button

### Keyboard Shortcuts

- **Ctrl+Enter**: Translate text
- **Ctrl+Shift+S**: Start/stop recording
- **Ctrl+Shift+P**: Play translation

## Generative AI in Development

This project uses generative AI in two ways:

1. **As a functional component**: Hugging Face models provide translation, speech recognition, and text-to-speech capabilities.
2. **As a development assistant**: AI tools were used to optimize code, improve structure, and resolve specific technical issues.

## Known Limitations

- Speech recognition may be less accurate in noisy environments
- Some language pairs have better support than others
- Highly specialized medical terms may require additional improvements
- Performance may vary depending on the device and browser used

## Future Improvements

- Expansion of the medical dictionary for more terms and specialties
- Implementation of automatic language detection
- Enhancement of audio quality in text-to-speech synthesis
- Offline mode for use without an internet connection
- Integration with electronic health record (EHR) systems

## License

This project is a prototype developed for Nao Medical as part of a selection process and is not available for commercial use.

## Contact

Developed by Leonardo Sánchez

---

© 2025 Healthcare Translation Web App
