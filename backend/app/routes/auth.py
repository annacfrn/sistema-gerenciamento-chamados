import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from app.models.recuperacao_senha import RecuperacaoSenha
from app.core.dependencies import obter_usuario_atual
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import verificar_senha, criar_token, gerar_hash_senha
from app.database.connection import SessionLocal
from app.models.perfil import Perfil
from app.models.usuario import Usuario

router = APIRouter(prefix="/auth", tags=["Autenticação"])


class LoginDados(BaseModel):
    email: EmailStr
    senha: str


def obter_sessao():
    with SessionLocal() as sessao:
        yield sessao


@router.post("/login")
def login(dados: LoginDados, sessao: Session = Depends(obter_sessao)):
    email = str(dados.email).strip().lower()

    usuario = sessao.scalar(select(Usuario).where(Usuario.email == email))

    if not usuario or not verificar_senha(dados.senha, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")

    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Usuário inativo.")

    perfil = sessao.get(Perfil, usuario.perfil_id)

    token = criar_token(usuario.id)

    return {
        "access_token": token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "nome": usuario.nome,
            "email": usuario.email,
            "perfil": perfil.nome if perfil else None,
        },
    }


@router.get("/me")
def consultar_usuario_atual(usuario: Usuario = Depends(obter_usuario_atual)):
    return {
        "id": usuario.id,
        "nome": usuario.nome,
        "email": usuario.email,
        "perfil_id": usuario.perfil_id,
        "ativo": usuario.ativo,
    }


class SolicitarRecuperacaoDados(BaseModel):
    email: EmailStr


class RedefinirSenhaDados(BaseModel):
    email: EmailStr
    codigo: str
    nova_senha: str


def agora_utc():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def hash_codigo(codigo: str) -> str:
    return hashlib.sha256(codigo.encode("utf-8")).hexdigest()


@router.post("/solicitar-recuperacao")
def solicitar_recuperacao(
    dados: SolicitarRecuperacaoDados, sessao: Session = Depends(obter_sessao)
):
    email = str(dados.email).strip().lower()

    mensagem = {
        "mensagem": (
            "Se o e-mail estiver cadastrado e ativo, "
            "as instruções de recuperação serão disponibilizadas."
        )
    }

    usuario = sessao.scalar(select(Usuario).where(Usuario.email == email))

    if not usuario or not usuario.ativo:
        return mensagem

    codigo = f"{secrets.randbelow(1000000):06d}"
    agora = agora_utc()

    recuperacoes_anteriores = sessao.scalars(
        select(RecuperacaoSenha).where(
            RecuperacaoSenha.usuario_id == usuario.id,
            RecuperacaoSenha.utilizado_em.is_(None),
        )
    ).all()

    for recuperacao in recuperacoes_anteriores:
        recuperacao.utilizado_em = agora

    nova_recuperacao = RecuperacaoSenha(
        usuario_id=usuario.id,
        codigo_hash=hash_codigo(codigo),
        expira_em=agora + timedelta(minutes=10),
    )

    sessao.add(nova_recuperacao)
    sessao.commit()

    # Somente para demonstração acadêmica.
    # Em produção, o código deverá ser enviado por e-mail.
    print(
        f"\n[CÓDIGO DE RECUPERAÇÃO] " f"Usuário ID: {usuario.id} | Código: {codigo}\n",
        flush=True,
    )

    return mensagem


@router.post("/redefinir-senha")
def redefinir_senha(
    dados: RedefinirSenhaDados, sessao: Session = Depends(obter_sessao)
):
    email = str(dados.email).strip().lower()
    agora = agora_utc()

    if (
        len(dados.codigo) != 6
        or not dados.codigo.isdigit()
        or len(dados.nova_senha) < 8
    ):
        raise HTTPException(
            status_code=400,
            detail="Código ou nova senha inválidos. A senha deve ter pelo menos 8 caracteres.",
        )

    usuario = sessao.scalar(select(Usuario).where(Usuario.email == email))

    if not usuario or not usuario.ativo:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

    recuperacao = sessao.scalar(
        select(RecuperacaoSenha)
        .where(
            RecuperacaoSenha.usuario_id == usuario.id,
            RecuperacaoSenha.codigo_hash == hash_codigo(dados.codigo),
            RecuperacaoSenha.utilizado_em.is_(None),
            RecuperacaoSenha.expira_em > agora,
        )
        .order_by(RecuperacaoSenha.id.desc())
    )

    if not recuperacao:
        raise HTTPException(status_code=400, detail="Código inválido ou expirado.")

    usuario.senha_hash = gerar_hash_senha(dados.nova_senha)
    recuperacao.utilizado_em = agora

    sessao.commit()

    return {"mensagem": "Senha redefinida com sucesso. Faça login com a nova senha."}
