
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.base import Base
from app.database.connection import engine
from app.models.recuperacao_senha import RecuperacaoSenha

from app.routes.usuarios import router as usuarios_router
from app.routes.auth import router as auth_router
from app.routes.chamados import router as chamados_router


RecuperacaoSenha.__table__.create(bind=engine, checkfirst=True)
app = FastAPI(
    title="Sistema de Gerenciamento de Chamados Técnicos",
    description="API para gerenciamento de usuários e chamados técnicos.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(usuarios_router)
app.include_router(auth_router)
app.include_router(chamados_router)


@app.get("/")
def inicio():
    return {
        "mensagem": "API do Sistema de Gerenciamento de Chamados Técnicos funcionando!"
    }
