import jwt

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.security import JWT_SECRET_KEY, ALGORITHM
from app.database.connection import SessionLocal
from app.models.usuario import Usuario


seguranca = HTTPBearer()


def obter_sessao():
    with SessionLocal() as sessao:
        yield sessao


def obter_usuario_atual(
    credenciais: HTTPAuthorizationCredentials = Depends(seguranca),
    sessao: Session = Depends(obter_sessao)
):
    erro = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        dados = jwt.decode(
            credenciais.credentials,
            JWT_SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        usuario_id = int(dados["sub"])

    except (jwt.InvalidTokenError, KeyError, ValueError, TypeError):
        raise erro

    usuario = sessao.get(Usuario, usuario_id)

    if usuario is None or not usuario.ativo:
        raise erro

    return usuario