from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Literal

from app.models.perfil import Perfil
from app.core.dependencies import obter_usuario_atual
from app.database.connection import SessionLocal
from app.models.chamado import Chamado
from app.models.usuario import Usuario
from app.schemas.chamado import ChamadoCadastro, ChamadoResposta


router = APIRouter(prefix="/chamados", tags=["Chamados Técnicos"])


def obter_sessao():
    with SessionLocal() as sessao:
        yield sessao


@router.post(
    "",
    response_model=ChamadoResposta,
    status_code=status.HTTP_201_CREATED
)
def abrir_chamado(
    dados: ChamadoCadastro,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    novo_chamado = Chamado(
        titulo=dados.titulo.strip(),
        descricao=dados.descricao.strip(),
        categoria=dados.categoria.strip(),
        prioridade=dados.prioridade,
        status="Aberto",
        usuario_id=usuario_atual.id
    )

    sessao.add(novo_chamado)
    sessao.commit()
    sessao.refresh(novo_chamado)

    return novo_chamado


@router.get(
    "",
    response_model=list[ChamadoResposta],
    status_code=status.HTTP_200_OK
)
def listar_meus_chamados(
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    chamados = sessao.scalars(
        select(Chamado)
        .where(Chamado.usuario_id == usuario_atual.id)
        .order_by(Chamado.criado_em.desc())
    ).all()

    return chamados


class AtribuicaoTecnico(BaseModel):
    tecnico_id: int


@router.patch(
    "/{chamado_id}/atribuir",
    response_model=ChamadoResposta
)
def atribuir_tecnico(
    chamado_id: int,
    dados: AtribuicaoTecnico,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    perfil_admin = sessao.get(Perfil, usuario_atual.perfil_id)

    if perfil_admin is None or perfil_admin.nome != "Administrador":
        raise HTTPException(
            status_code=403,
            detail="Somente administradores podem atribuir chamados."
        )

    chamado = sessao.get(Chamado, chamado_id)

    if chamado is None:
        raise HTTPException(
            status_code=404,
            detail="Chamado não encontrado."
        )

    tecnico = sessao.get(Usuario, dados.tecnico_id)

    if tecnico is None or not tecnico.ativo:
        raise HTTPException(
            status_code=404,
            detail="Técnico não encontrado ou inativo."
        )

    perfil_tecnico = sessao.get(Perfil, tecnico.perfil_id)

    if perfil_tecnico is None or perfil_tecnico.nome != "Técnico":
        raise HTTPException(
            status_code=400,
            detail="O usuário informado não possui perfil de técnico."
        )

    chamado.tecnico_id = tecnico.id
    sessao.commit()
    sessao.refresh(chamado)

    return chamado



@router.get(
    "/tecnico/me",
    response_model=list[ChamadoResposta],
    status_code=status.HTTP_200_OK
)
def listar_chamados_do_tecnico(
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    perfil_atual = sessao.get(Perfil, usuario_atual.perfil_id)

    if perfil_atual is None or perfil_atual.nome != "Técnico":
        raise HTTPException(
            status_code=403,
            detail="Acesso permitido somente aos técnicos."
        )

    chamados = sessao.scalars(
        select(Chamado)
        .where(Chamado.tecnico_id == usuario_atual.id)
        .order_by(Chamado.criado_em.desc())
    ).all()

    return chamados


class AtualizacaoStatus(BaseModel):
    status: Literal["Em andamento", "Concluído"]


@router.patch(
    "/{chamado_id}/status",
    response_model=ChamadoResposta,
    status_code=status.HTTP_200_OK
)
def atualizar_status_chamado(
    chamado_id: int,
    dados: AtualizacaoStatus,
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    perfil_atual = sessao.get(Perfil, usuario_atual.perfil_id)

    if perfil_atual is None or perfil_atual.nome != "Técnico":
        raise HTTPException(
            status_code=403,
            detail="Somente técnicos podem atualizar o status."
        )

    chamado = sessao.get(Chamado, chamado_id)

    if chamado is None:
        raise HTTPException(
            status_code=404,
            detail="Chamado não encontrado."
        )

    if chamado.tecnico_id != usuario_atual.id:
        raise HTTPException(
            status_code=403,
            detail="Este chamado não está atribuído a você."
        )

    if chamado.status == "Concluído":
        raise HTTPException(
            status_code=400,
            detail="Um chamado concluído não pode ser alterado."
        )

    if chamado.status == dados.status:
        raise HTTPException(
            status_code=400,
            detail="O chamado já possui esse status."
        )

    if chamado.status == "Aberto" and dados.status != "Em andamento":
        raise HTTPException(
            status_code=400,
            detail="O chamado deve passar por Em andamento antes de ser concluído."
        )

    chamado.status = dados.status

    sessao.commit()
    sessao.refresh(chamado)

    return chamado


@router.get(
    "/admin/todos",
    response_model=list[ChamadoResposta],
    status_code=status.HTTP_200_OK
)
def listar_todos_chamados(
    usuario_atual: Usuario = Depends(obter_usuario_atual),
    sessao: Session = Depends(obter_sessao)
):
    perfil_atual = sessao.get(Perfil, usuario_atual.perfil_id)

    if perfil_atual is None or perfil_atual.nome != "Administrador":
        raise HTTPException(
            status_code=403,
            detail="Somente administradores podem consultar todos os chamados."
        )

    chamados = sessao.scalars(
        select(Chamado)
        .order_by(Chamado.criado_em.desc())
    ).all()

    return chamados