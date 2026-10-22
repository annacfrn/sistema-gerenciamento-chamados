from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
)

from sqlalchemy.orm import relationship

from app.database.base import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(150), nullable=False)

    email = Column(String(150), unique=True, nullable=False, index=True)

    senha_hash = Column(String(255), nullable=False)

    perfil_id = Column(Integer, ForeignKey("perfis.id"), nullable=False)

    ativo = Column(Boolean, default=True, nullable=False)

    criado_em = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        nullable=False,
    )

    perfil = relationship("Perfil")
