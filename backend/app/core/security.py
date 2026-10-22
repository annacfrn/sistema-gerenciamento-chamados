import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from pwdlib import PasswordHash

load_dotenv()

password_hash = PasswordHash.recommended()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY não configurada no .env")

ALGORITHM = "HS256"


def gerar_hash_senha(senha: str) -> str:
    return password_hash.hash(senha)


def verificar_senha(senha: str, hash_armazenado: str) -> bool:
    return password_hash.verify(senha, hash_armazenado)


def criar_token(usuario_id: int) -> str:
    expiracao = datetime.now(timezone.utc) + timedelta(hours=2)

    dados = {
        "sub": str(usuario_id),
        "exp": expiracao
    }

    return jwt.encode(
        dados,
        JWT_SECRET_KEY,
        algorithm=ALGORITHM
    )