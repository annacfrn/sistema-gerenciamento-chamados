from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.base import Base


class RecuperacaoSenha(Base):
    __tablename__ = "recuperacoes_senha"

    id = Column(Integer, primary_key=True, index=True)

    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id"),
        nullable=False
    )

    codigo_hash = Column(String(64), nullable=False)

    expira_em = Column(DateTime, nullable=False)

    utilizado_em = Column(DateTime, nullable=True)

    criado_em = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False
    )

    usuario = relationship("Usuario")