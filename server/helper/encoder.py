
from cryptography.fernet import Fernet
from config import config

# Use environment variable for encryption key or generate one
ENCRYPTION_KEY = config.ENCRYPTION_KEY

if not ENCRYPTION_KEY:
    # Generate a key if not provided - ONLY for development!
    # In production, always provide ENCRYPTION_KEY environment variable
    print("[WARNING] ENCRYPTION_KEY not set. Generating a temporary key for development.")
    ENCRYPTION_KEY = Fernet.generate_key().decode()


def get_cipher():
    """Get Fernet cipher instance"""
    try:
        return Fernet(ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY)
    except Exception as e:
        raise ValueError(f"Invalid ENCRYPTION_KEY: {str(e)}")


def encrypt_value(value: str) -> str:
    """Encrypt a sensitive value"""
    if not value:
        return ""
    cipher = get_cipher()
    encrypted = cipher.encrypt(value.encode())
    return encrypted.decode()


def decrypt_value(encrypted_value: str) -> str:
    """Decrypt a sensitive value"""
    if not encrypted_value:
        return ""
    cipher = get_cipher()
    try:
        decrypted = cipher.decrypt(encrypted_value.encode())
        return decrypted.decode()
    except Exception as e:
        raise ValueError(f"Failed to decrypt value: {str(e)}")