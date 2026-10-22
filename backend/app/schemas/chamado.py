
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class ChamadoCadastro(BaseModel):
    titulo: str = Field(min_length=3, max_length=150)
    descricao: str = Field(min_length=5)
    categoria: str = Field(min_length=3, max_length=100)
    prioridade: Literal["Baixa", "Media", "Alta", "Urgente"]


class ChamadoResposta(BaseModel):
    id: int
    titulo: str
    descricao: str
    categoria: str
    prioridade: str
    status: str
    usuario_id: int
    tecnico_id: int | None
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)
