from transformers import pipeline
import os
import tempfile
import base64

# Global pipeline for ASR
asr_pipeline = None

def get_asr_pipeline():
    """
    Gets or initializes the ASR (Automatic Speech Recognition) pipeline.
    
    Returns:
      A Hugging Face pipeline for speech recognition.
    """
    global asr_pipeline
    if asr_pipeline is None:
        # Use a smaller but efficient model for ASR
        asr_pipeline = pipeline(
            "automatic-speech-recognition",
            model="facebook/wav2vec2-base-960h",
            chunk_length_s=10
        )
    return asr_pipeline

def transcribe_audio(audio_file_path: str) -> str:
    """
    Transcribes an audio file to text.
    
    Args:
        audio_file_path: Path to the audio file to transcribe.
        
    Returns:
        A string with the audio transcription.
    """
    pipeline = get_asr_pipeline()
    result = pipeline(audio_file_path)
    
    # The result could be a dictionary or directly the text
    if isinstance(result, dict) and "text" in result:
        return result["text"]
    return result

def transcribe_audio_base64(audio_base64: str, format: str = "wav") -> str:
    """
    Transcribes audio in base64 format to text.
    
    Args:
        audio_base64: Base64 encoded string containing the audio.
        format: Audio format (default "wav").
        
    Returns:
        A string with the audio transcription.
    """
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
        # Clean up the temporary file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)