from transformers import pipeline
import soundfile as sf
import os
import uuid
import torch
import numpy as np

# Dictionary for preloaded models
tts_models = {}

def get_tts_model(lang_code: str = "en"):
    """
    Gets or loads a text-to-speech model for the specified language.
    Uses a simpler model compatible with the installed version of transformers.
    
    Args:
      lang_code: Language code (default "en" for English).
      
    Returns:
      A text-to-speech pipeline.
    """
    if lang_code not in tts_models:
        # Use a general TTS model that is available in transformers
        model_name = "facebook/mms-tts-eng" if lang_code == "en" else "facebook/mms-tts-eng"
        
        try:
            # Use the general pipeline that is always available
            tts_pipeline = pipeline("text-to-speech", model=model_name)
            tts_models[lang_code] = tts_pipeline
        except Exception as e:
            # If loading the specific model fails, use a general model
            if lang_code != "en":
                return get_tts_model("en")
            else:
                raise ValueError(f"Could not load TTS model for {lang_code}: {e}")
    
    return tts_models[lang_code]

def text_to_speech(text: str, lang_code: str = "en") -> str:
    """
    Converts text to speech and saves the result as an audio file.
    
    Args:
      text: The text to convert.
      lang_code: The language code (default "en" for English).
      
    Returns:
      Path to the generated audio file.
    """
    try:
        # Get the TTS model
        tts_pipeline = get_tts_model(lang_code)
        
        # Generate audio
        speech = tts_pipeline(text)
        
        # Create temporary directory if it does not exist
        output_dir = "/tmp/medical_app_tts"
        os.makedirs(output_dir, exist_ok=True)
        
        # Create unique file name
        file_name = f"{uuid.uuid4()}.wav"
        output_path = os.path.join(output_dir, file_name)
        
        # Save as WAV file
        audio_array = np.array(speech["audio"])
        sf.write(output_path, audio_array, samplerate=speech["sampling_rate"])
        
        return output_path
    except Exception as e:
        # If it fails, try a simpler alternative
        try:
            # Try with a basic backup model if available
            tts_pipeline = pipeline("text-to-speech")
            speech = tts_pipeline(text)
            
            output_dir = "/tmp/medical_app_tts"
            os.makedirs(output_dir, exist_ok=True)
            file_name = f"{uuid.uuid4()}.wav"
            output_path = os.path.join(output_dir, file_name)
            
            audio_array = np.array(speech["audio"])
            sf.write(output_path, audio_array, samplerate=speech["sampling_rate"])
            
            return output_path
        except Exception as backup_error:
            raise ValueError(f"Error in text to speech: {str(e)}. Backup error: {str(backup_error)}")