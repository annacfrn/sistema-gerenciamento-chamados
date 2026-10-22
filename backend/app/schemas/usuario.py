from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UsuarioCadastro(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)


class UsuarioResposta(BaseModel):
    id: int
    nome: str
    email: EmailStr
    perfil_id: int
    ativo: bool

    model_config = ConfigDict(from_attributes=True)


class UsuarioAtualizacao(BaseModel):
    nome: str = Field(min_length=3, max_length=150)
    email: EmailStr