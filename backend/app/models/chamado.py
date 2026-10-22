
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class Chamado(Base):
    __tablename__ = "chamados"

    id = Column(Integer, primary_key=True, index=True)

    titulo = Column(String(150), nullable=False)

    descricao = Column(Text, nullable=False)

    categoria = Column(String(100), nullable=False)

    prioridade = Column(String(20), nullable=False)

    status = Column(
        String(30),
        nullable=False,
        default="Aberto"
    )

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    tecnico_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=True
    )

    criado_em = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False
    )

    usuario = relationship(
        "Usuario",
        foreign_keys=[usuario_id]
    )

    tecnico = relationship(
        "Usuario",
        foreign_keys=[tecnico_id]
    )
