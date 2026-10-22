from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import gerar_hash_senha
from app.core.dependencies import obter_usuario_atual
from app.database.connection import SessionLocal
from app.models.perfil import Perfil
from app.models.usuario import Usuario
from app.schemas.usuario import (
    UsuarioCadastro,
    UsuarioResposta,
    UsuarioAtualizacao,
)


router = APIRouter(prefix="/usuarios", tags=["Usuários"])


def obter_sessao():
    with SessionLocal() as sessao:
        yield sessao


@router.post(
    "",
    response_model=UsuarioResposta,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_usuario(
    dados: UsuarioCadastro,
    sessao: Session = Depends(obter_sessao)
):
    email = str(dados.email).strip().lower()

    usuario_existente = sessao.scalar(
        select(Usuario).where(Usuario.email == email)
    )

    if usuario_existente:
        raise HTTPException(
            status_code=409,
            detail="Este e-mail já está cadastrado."
        )

    perfil_usuario = sessao.scalar(
        select(Perfil).where(Perfil.nome == "Usuário")
    )

    if perfil_usuario is None:
        raise HTTPException(
            status_code=500,
            detail="Perfil padrão não encontrado."
        )

    novo_usuario = Usuario(
        nome=dados.nome.strip(),
        email=email,
        senha_hash=gerar_hash_senha(dados.senha),
        perfil_id=perfil_usuario.id,
        ativo=True
    )

    sessao.add(novo_usuario)

    try:
        sessao.commit()
    except IntegrityError:
        sessao.rollback()
        raise HTTPException(
            status_code=409,
            detail="Não foi possível cadastrar: e-mail já utilizado."
        )

    sessao.refresh(novo_usuario)

    return novo_usuario


@router.put(
    "/me",
    response_model=UsuarioResposta,
    status_code=status.HTTP_200_OK
)
def atualizar_meu_perfil(
    dados: UsuarioAtualizacao,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    email = str(dados.email).strip().lower()

    usuario_existente = sessao.scalar(
        select(Usuario).where(
            Usuario.email == email,
            Usuario.id != usuario_atual.id
        )
    )

    if usuario_existente:
        raise HTTPException(
            status_code=409,
            detail="Este e-mail já está cadastrado."
        )

    usuario_para_atualizar = sessao.get(
        Usuario,
        usuario_atual.id
    )

    if usuario_para_atualizar is None:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado."
        )

    usuario_para_atualizar.nome = dados.nome.strip()
    usuario_para_atualizar.email = email

    try:
        sessao.commit()
    except IntegrityError:
        sessao.rollback()
        raise HTTPException(
            status_code=409,
            detail="Não foi possível atualizar: e-mail já utilizado."
        )

    sessao.refresh(usuario_para_atualizar)

    return usuario_para_atualizar


@router.get(
    "",
    response_model=list[UsuarioResposta],
    status_code=status.HTTP_200_OK
)
def listar_usuarios(
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    perfil_atual = sessao.get(Perfil, usuario_atual.perfil_id)

    if perfil_atual is None or perfil_atual.nome != "Administrador":
        raise HTTPException(
            status_code=403,
            detail="Acesso permitido somente ao administrador."
        )

    usuarios = sessao.scalars(
        select(Usuario).order_by(Usuario.nome)
    ).all()

    return usuarios


@router.post(
    "/admin/tecnicos",
    response_model=UsuarioResposta,
    status_code=status.HTTP_201_CREATED
)
def cadastrar_tecnico(
    dados: UsuarioCadastro,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    perfil_atual = sessao.get(Perfil, usuario_atual.perfil_id)

    if perfil_atual is None or perfil_atual.nome != "Administrador":
        raise HTTPException(
            status_code=403,
            detail="Acesso permitido somente ao administrador."
        )

    email = str(dados.email).strip().lower()

    usuario_existente = sessao.scalar(
        select(Usuario).where(Usuario.email == email)
    )

    if usuario_existente:
        raise HTTPException(
            status_code=409,
            detail="Este e-mail já está cadastrado."
        )

    perfil_tecnico = sessao.scalar(
        select(Perfil).where(Perfil.nome == "Técnico")
    )

    if perfil_tecnico is None:
        raise HTTPException(
            status_code=500,
            detail="Perfil Técnico não encontrado."
        )

    novo_tecnico = Usuario(
        nome=dados.nome.strip(),
        email=email,
        senha_hash=gerar_hash_senha(dados.senha),
        perfil_id=perfil_tecnico.id,
        ativo=True
    )

    sessao.add(novo_tecnico)

    try:
        sessao.commit()
    except IntegrityError:
        sessao.rollback()
        raise HTTPException(
            status_code=409,
            detail="Não foi possível cadastrar: e-mail já utilizado."
        )

    sessao.refresh(novo_tecnico)

    return novo_tecnico
