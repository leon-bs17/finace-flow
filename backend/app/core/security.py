"""Utilitários de segurança: hashing de senha e emissão/validação de JWT usando hashlib nativo."""
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import hashlib
import os

from jose import JWTError, jwt

from app.core.config import settings


def hash_password(password: str) -> str:
    """Gera hash PBKDF2 seguro para a senha."""
    salt = os.urandom(16)
    db_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return f"pbkdf2_sha256$100000${salt.hex()}${db_hash.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha coincide com o hash gerado."""
    try:
        parts = hashed_password.split('$')
        if len(parts) != 4 or parts[0] != 'pbkdf2_sha256':
            # Fallback opcional se a senha antiga no banco não estivesse no formato (embora o DB local comece vazio)
            return False
        iterations = int(parts[1])
        salt = bytes.fromhex(parts[2])
        original_hash = bytes.fromhex(parts[3])
        new_hash = hashlib.pbkdf2_hmac('sha256', plain_password.encode('utf-8'), salt, iterations)
        return new_hash == original_hash
    except Exception:
        return False


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload: dict[str, Any] = {"sub": subject, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload: dict[str, Any] = {"sub": subject, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict[str, Any]]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
