import logging
from datetime import datetime

def setup_logger(name: str = None, level: int = logging.INFO):
    """
    Configures and returns a logger with the specified name and level.

    Args:
      name: Logger name; if omitted, the root logger is used.
      level: Log level; defaults to INFO.
    
    Returns:
      A logger object configured to display messages in the console.
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        # Create a handler for console output
        handler = logging.StreamHandler()
        handler.setLevel(level)
        formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    return logger

def current_timestamp() -> str:
    """
    Returns the current date and time in ISO format.

    Returns:
      A string with the current date and time in ISO format.
    """
    return datetime.utcnow().isoformat()