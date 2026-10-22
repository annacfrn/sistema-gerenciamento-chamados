from app.database.base import Base
from app.database.connection import engine

from app.models.perfil import Perfil
from app.models.usuario import Usuario
from app.models.chamado import Chamado


def criar_tabelas():
    Base.metadata.create_all(bind=engine)
    print("Tabelas verificadas/criadas com sucesso!")


if __name__ == "__main__":
    criar_tabelas()