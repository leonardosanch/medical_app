from transformers import pipeline, AutoModelForSeq2SeqLM, AutoTokenizer
import re

# Dictionary to store already loaded translation pipelines
translation_pipelines = {}

# Dictionary of common medical terms
MEDICAL_TERMS = {
    "en": {
        "headache": "cephalgia",
        "heart attack": "myocardial infarction",
        "high blood pressure": "hypertension",
        "stroke": "cerebrovascular accident",
        "flu": "influenza",
        "diabetes": "diabetes mellitus",
        "cold": "common cold"
    },
    "es": {
        "dolor de cabeza": "cefalea",
        "ataque al corazón": "infarto de miocardio",
        "presión arterial alta": "hipertensión",
        "derrame cerebral": "accidente cerebrovascular",
        "gripe": "influenza",
        "resfriado": "resfriado común"
    }
}

# Direct translations of medical terms between languages
MEDICAL_TRANSLATIONS = {
    "en-es": {
        "cephalgia": "cefalea",
        "myocardial infarction": "infarto de miocardio",
        "hypertension": "hipertensión",
        "cerebrovascular accident": "accidente cerebrovascular",
        "diabetes mellitus": "diabetes mellitus",
        "influenza": "influenza",
        "common cold": "resfriado común"
    },
    "es-en": {
        "cefalea": "cephalgia",
        "infarto de miocardio": "myocardial infarction",
        "hipertensión": "hypertension",
        "accidente cerebrovascular": "cerebrovascular accident",
        "diabetes mellitus": "diabetes mellitus",
        "influenza": "influenza",
        "resfriado común": "common cold"
    }
}

def get_translation_pipeline(source_lang: str, target_lang: str):
    """
    Gets or creates a translation pipeline for the specified language pair.
    Prioritizes medical models when available.
    
    Args:
      source_lang: Source language code (e.g., 'en').
      target_lang: Target language code (e.g., 'es').
    
    Returns:
      A Hugging Face pipeline object for translation.
      
    Raises:
      ValueError if no model can be loaded for the requested language pair.
    """
    key = f"{source_lang}-{target_lang}"
    
    if key not in translation_pipelines:
        # Try with a specific medical model first
        medical_model_name = f"Helsinki-NLP/opus-mt-med-{source_lang}-{target_lang}"
        try:
            tokenizer = AutoTokenizer.from_pretrained(medical_model_name)
            model = AutoModelForSeq2SeqLM.from_pretrained(medical_model_name)
            translation_pipelines[key] = pipeline("translation", model=model, tokenizer=tokenizer)
            return translation_pipelines[key]
        except Exception:
            # If no specific medical model exists, continue with alternatives
            pass
            
        # Try with a specific general model
        general_model_name = f"Helsinki-NLP/opus-mt-{source_lang}-{target_lang}"
        try:
            tokenizer = AutoTokenizer.from_pretrained(general_model_name)
            model = AutoModelForSeq2SeqLM.from_pretrained(general_model_name)
            translation_pipelines[key] = pipeline("translation", model=model, tokenizer=tokenizer)
            return translation_pipelines[key]
        except Exception:
            # If no specific general model exists, use a multilingual model
            pass
            
        # Use NLLB model as a last resort (supports 200 languages)
        try:
            model_name = "facebook/nllb-200-distilled-600M"
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
            
            # Specific language codes for NLLB
            src_lang_code = f"{source_lang}_XX"
            tgt_lang_code = f"{target_lang}_XX"
            
            translation_pipelines[key] = pipeline(
                "translation", 
                model=model, 
                tokenizer=tokenizer,
                src_lang=src_lang_code,
                tgt_lang=tgt_lang_code
            )
        except Exception as e:
            raise ValueError(f"Could not load any model to translate from {source_lang} to {target_lang}: {e}")
    
    return translation_pipelines[key]

def preprocess_medical_terms(text: str, source_lang: str) -> str:
    """
    Replaces colloquial terms with precise medical terms.
    
    Args:
      text: The text to process.
      source_lang: Language code of the text.
      
    Returns:
      The text with standardized medical terms.
    """
    if source_lang in MEDICAL_TERMS:
        for common, medical in MEDICAL_TERMS[source_lang].items():
            pattern = r'\b' + re.escape(common) + r'\b'
            text = re.sub(pattern, medical, text, flags=re.IGNORECASE)
    return text

def postprocess_medical_translations(text: str, source_lang: str, target_lang: str) -> str:
    """
    Ensures that medical terms are translated correctly.
    
    Args:
      text: The translated text to process.
      source_lang: Source language code.
      target_lang: Target language code.
      
    Returns:
      The text with corrected medical terms.
    """
    key = f"{source_lang}-{target_lang}"
    if key in MEDICAL_TRANSLATIONS:
        for source_term, target_term in MEDICAL_TRANSLATIONS[key].items():
            pattern = r'\b' + re.escape(source_term) + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                text = re.sub(pattern, target_term, text, flags=re.IGNORECASE)
    return text

def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translates the received text from the source language to the target language.
    
    Includes preprocessing and postprocessing for medical terms.
    
    Args:
      text: The text to translate.
      source_lang: Source language code.
      target_lang: Target language code.
      
    Returns:
      The translated text with optimized medical terms.
    """
    # Preprocess medical terms
    preprocessed_text = preprocess_medical_terms(text, source_lang)
    
    # Get translation pipeline
    translation_pipeline = get_translation_pipeline(source_lang, target_lang)
    
    # Translate the text
    result = translation_pipeline(preprocessed_text)
    
    # The result format may vary depending on the model
    if isinstance(result, list) and 'translation_text' in result[0]:
        translated_text = result[0]['translation_text']
    elif isinstance(result, list) and len(result) > 0 and 'generated_text' in result[0]:
        translated_text = result[0]['generated_text']
    elif isinstance(result, list) and len(result) > 0:
        translated_text = result[0]
    else:
        translated_text = str(result)
    
    # Postprocess to correct medical terms
    final_text = postprocess_medical_translations(translated_text, source_lang, target_lang)
    
    return final_text