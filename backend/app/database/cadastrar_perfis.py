from sqlalchemy import select

from app.database.connection import SessionLocal
from app.models.perfil import Perfil


def cadastrar_perfis():
    perfis_iniciais = [
        {
            "nome": "Administrador",
            "descricao": "Gerencia usuários, perfis e chamados técnicos."
        },
        {
            "nome": "Técnico",
            "descricao": "Atende e atualiza os chamados técnicos."
        },
        {
            "nome": "Usuário",
            "descricao": "Abre e acompanha seus chamados técnicos."
        }
    ]

    with SessionLocal() as sessao:
        for dados in perfis_iniciais:
            perfil_existente = sessao.scalar(
                select(Perfil).where(Perfil.nome == dados["nome"])
            )

            if perfil_existente is None:
                sessao.add(Perfil(**dados))
                print(f"Perfil cadastrado: {dados['nome']}")
            else:
                print(f"Perfil já existe: {dados['nome']}")

        sessao.commit()

    print("Cadastro dos perfis finalizado!")


if __name__ == "__main__":
    cadastrar_perfis()