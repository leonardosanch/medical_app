from fastapi import APIRouter, HTTPException
from ..models import TranslationRequest, TranslationResponse
from ..services.translation_service import translate_text

router = APIRouter()

@router.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    """
    Endpoint to receive the text to translate and return the translation.

    Receives:
      - A TranslationRequest object with the text to translate and the language codes.

    Returns:
      - A TranslationResponse object with the translated text.
    """
    try:
        # Call to the translation service, passing the necessary parameters
        translated_text = translate_text(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
        return TranslationResponse(translated_text=translated_text)
    except Exception as e:
        # Error handling, returning an error response in case of failure
        raise HTTPException(status_code=500, detail=str(e))