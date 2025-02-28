from pydantic import BaseModel

class TranslationRequest(BaseModel):
    """
    Data model for the translation request.
    
    Attributes:
      - text: The text to be translated.
      - source_lang: Source language code (e.g., 'en' for English).
      - target_lang: Target language code (e.g., 'es' for Spanish).
    """
    text: str
    source_lang: str
    target_lang: str

class TranslationResponse(BaseModel):
    """
    Data model for the translation response.
    
    Attributes:
      - translated_text: The resulting text after translation.
    """
    translated_text: str