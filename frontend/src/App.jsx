import { useState } from 'react'
import './App.css'

const API = 'http://127.0.0.1:8000'

function App() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState('')
  const [chamados, setChamados] = useState([])
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarCadastro, setMostrarCadastro] = useState(false)
  const [mostrarRecuperacao, setMostrarRecuperacao] = useState(false)

  const [etapaRecuperacao, setEtapaRecuperacao] = useState(1)

  const [dadosRecuperacao, setDadosRecuperacao] = useState({
    email: '',
    codigo: '',
    nova_senha: ''
})
  const [mostrarPerfil, setMostrarPerfil] = useState(false)
  const [mostrarCadastroTecnico, setMostrarCadastroTecnico] = useState(false)

  const [novoTecnico, setNovoTecnico] = useState({
    nome: '',
    email: '',
    senha: ''
})

const [dadosPerfil, setDadosPerfil] = useState({
  nome: '',
  email: ''
})

const [novoUsuario, setNovoUsuario] = useState({
  nome: '',
  email: '',
  senha: ''
})


  const [novoChamado, setNovoChamado] = useState({
    titulo: '',
    descricao: '',
    categoria: 'Hardware',
    prioridade: 'Media'
  })

  async function consultarChamados(tokenAcesso, usuarioPerfil) {
    const rota =
  usuarioPerfil === 'Administrador'
    ? `${API}/chamados/admin/todos`
    : usuarioPerfil === 'Técnico'
      ? `${API}/chamados/tecnico/me`
      : `${API}/chamados`	

const resposta = await fetch(rota, {
      headers: {
        Authorization: `Bearer ${tokenAcesso}`
      }
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error('Não foi possível consultar os chamados.')
    }

    setChamados(dados)
  }

  async function entrar(evento) {
    evento.preventDefault()
    setErro('')
    setMensagem('')
    setCarregando(true)

    try {
      const resposta = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, senha })
      })

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          typeof dados.detail === 'string'
            ? dados.detail
            : 'Não foi possível entrar.'
        )
      }

      await consultarChamados(dados.access_token, dados.usuario.perfil)

      sessionStorage.setItem('token', dados.access_token)
      setToken(dados.access_token)
      setUsuario(dados.usuario)
      setSenha('')
    } catch (falha) {
      setErro(falha.message || 'Erro de conexão com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

async function solicitarRecuperacao(evento) {
  evento.preventDefault()
  setErro('')
  setMensagem('')
  setCarregando(true)

  try {
    const resposta = await fetch(`${API}/auth/solicitar-recuperacao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: dadosRecuperacao.email
      })
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error('Não foi possível solicitar a recuperação.')
    }

    setEtapaRecuperacao(2)
    setMensagem(
      'Solicitação realizada! Para esta demonstração, consulte o código no PowerShell do backend.'
    )
  } catch (falha) {
    setErro(falha.message || 'Erro ao solicitar recuperação.')
  } finally {
    setCarregando(false)
  }
}
async function redefinirSenha(evento) {
  evento.preventDefault()
  setErro('')
  setMensagem('')
  setCarregando(true)

  try {
    const resposta = await fetch(`${API}/auth/redefinir-senha`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: dadosRecuperacao.email,
        codigo: dadosRecuperacao.codigo,
        nova_senha: dadosRecuperacao.nova_senha
      })
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(
        typeof dados.detail === 'string'
          ? dados.detail
          : 'Não foi possível redefinir a senha.'
      )
    }

    setMostrarRecuperacao(false)
    setEtapaRecuperacao(1)
    setEmail(dadosRecuperacao.email)
    setSenha('')

    setDadosRecuperacao({
      email: '',
      codigo: '',
      nova_senha: ''
    })

    setMensagem('Senha redefinida com sucesso! Faça login com a nova senha.')
  } catch (falha) {
    setErro(falha.message || 'Erro ao redefinir a senha.')
  } finally {
    setCarregando(false)
  }
}
async function cadastrarUsuario(evento) {
  evento.preventDefault()
  setErro('')
  setMensagem('')
  setCarregando(true)

  try {
    const resposta = await fetch(`${API}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(novoUsuario)
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(
        typeof dados.detail === 'string'
          ? dados.detail
          : 'Não foi possível cadastrar o usuário.'
      )
    }

    setNovoUsuario({
      nome: '',
      email: '',
      senha: ''
    })

    setMostrarCadastro(false)
    setEmail(novoUsuario.email)
    setSenha('')
    setMensagem('Cadastro realizado com sucesso! Faça seu login.')
  } catch (falha) {
    setErro(falha.message || 'Erro ao cadastrar usuário.')
  } finally {
    setCarregando(false)
  }
}

async function cadastrarTecnico(evento) {
  evento.preventDefault()
  setErro('')
  setMensagem('')
  setCarregando(true)

  try {
    const resposta = await fetch(`${API}/usuarios/admin/tecnicos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(novoTecnico)
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(
        typeof dados.detail === 'string'
          ? dados.detail
          : 'Não foi possível cadastrar o técnico.'
      )
    }

    setNovoTecnico({
      nome: '',
      email: '',
      senha: ''
    })

    setMostrarCadastroTecnico(false)
    setMensagem(`Técnico ${dados.nome} cadastrado com sucesso!`)
  } catch (falha) {
    setErro(falha.message || 'Erro ao cadastrar técnico.')
  } finally {
    setCarregando(false)
  }
}

async function atualizarMeuPerfil(evento) {
  evento.preventDefault()
  setErro('')
  setMensagem('')
  setCarregando(true)

  try {
    const resposta = await fetch(`${API}/usuarios/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dadosPerfil)
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(
        typeof dados.detail === 'string'
          ? dados.detail
          : 'Não foi possível atualizar o perfil.'
      )
    }

    setUsuario((anterior) => ({
      ...anterior,
      nome: dados.nome,
      email: dados.email
    }))

    setMostrarPerfil(false)
    setMensagem('Perfil atualizado com sucesso!')
  } catch (falha) {
    setErro(falha.message || 'Erro ao atualizar o perfil.')
  } finally {
    setCarregando(false)
  }
}
  async function cadastrarChamado(evento) {
    evento.preventDefault()
    setErro('')
    setMensagem('')
    setCarregando(true)

    try {
      const resposta = await fetch(`${API}/chamados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(novoChamado)
      })

      if (!resposta.ok) {
        throw new Error('Não foi possível cadastrar o chamado.')
      }

      await consultarChamados(token, usuario.perfil)

      setNovoChamado({
        titulo: '',
        descricao: '',
        categoria: 'Hardware',
        prioridade: 'Media'
      })

      setMostrarFormulario(false)
      setMensagem('Chamado cadastrado com sucesso!')
    } catch (falha) {
      setErro(falha.message || 'Erro ao cadastrar chamado.')
    } finally {
      setCarregando(false)
    }
  }


  async function atualizarStatus(chamadoId, novoStatus) {
    setErro('')
    setMensagem('')
    setCarregando(true)

    try {
      const resposta = await fetch(
        `${API}/chamados/${chamadoId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status: novoStatus })
        }
      )

      const dados = await resposta.json()

      if (!resposta.ok) {
        throw new Error(
          typeof dados.detail === 'string'
            ? dados.detail
            : 'Não foi possível atualizar o status.'
        )
      }

      await consultarChamados(token, usuario.perfil)
      setMensagem(`Chamado #${chamadoId} atualizado para ${novoStatus}!`)
    } catch (falha) {
      setErro(falha.message || 'Erro ao atualizar o chamado.')
    } finally {
      setCarregando(false)
    }
  }


async function atribuirTecnico(chamadoId) {
  const tecnicoId = window.prompt(
    'Digite o ID do técnico responsável:'
  )

  if (tecnicoId === null) return

  const id = Number(tecnicoId)

  if (!Number.isInteger(id) || id <= 0) {
    setErro('Informe um ID de técnico válido.')
    return
  }

  setErro('')
  setMensagem('')
  setCarregando(true)

  try {
    const resposta = await fetch(
      `${API}/chamados/${chamadoId}/atribuir`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ tecnico_id: id })
      }
    )

    const dados = await resposta.json()

    if (!resposta.ok) {
      throw new Error(
        typeof dados.detail === 'string'
          ? dados.detail
          : 'Não foi possível atribuir o técnico.'
      )
    }

    await consultarChamados(token, usuario.perfil)
    setMensagem(`Chamado #${chamadoId} atribuído ao técnico ${id}!`)
  } catch (falha) {
    setErro(falha.message || 'Erro ao atribuir o técnico.')
  } finally {
    setCarregando(false)
  }
}

  function atualizarCampo(campo, valor) {
    setNovoChamado((anterior) => ({
      ...anterior,
      [campo]: valor
    }))
  }

  function sair() {
    sessionStorage.removeItem('token')
    setToken('')
    setUsuario(null)
    setChamados([])
    setEmail('')
    setSenha('')
    setErro('')
    setMensagem('')
    setMostrarFormulario(false)
    setMostrarPerfil(false)
    setDadosPerfil({
      nome: '',
      email: ''
    })
  }

  if (usuario) {
    return (
      <main className="painel-container">
        <section className="painel-card">
          <header className="painel-cabecalho">
            <div>
              <h1>Sistema de Chamados Técnicos</h1>
              <p>Bem-vindo(a), {usuario.nome}!</p>
              <p>Perfil: {usuario.perfil}</p>
            </div>

<div className="acoes-painel">
  <button
    type="button"
    onClick={() => {
      setDadosPerfil({
        nome: usuario.nome,
        email: usuario.email
      })
      setMostrarPerfil(!mostrarPerfil)
      setErro('')
      setMensagem('')
    }}
  >
    {mostrarPerfil ? 'Voltar aos chamados' : 'Meu perfil'}
  </button>

  <button onClick={sair}>Sair</button>
</div>          </header>

          {mostrarPerfil && (
            <form
              className="formulario-chamado"
              onSubmit={atualizarMeuPerfil}
            >
              <h2>Meu perfil</h2>
              <p>Atualize seus dados pessoais.</p>

              <label htmlFor="perfil-nome">Nome completo</label>
              <input
                id="perfil-nome"
                type="text"
                value={dadosPerfil.nome}
                onChange={(evento) =>
                  setDadosPerfil({
                    ...dadosPerfil,
                    nome: evento.target.value
                  })
                }
                required
              />

              <label htmlFor="perfil-email">E-mail</label>
              <input
                id="perfil-email"
                type="email"
                value={dadosPerfil.email}
                onChange={(evento) =>
                  setDadosPerfil({
                    ...dadosPerfil,
                    email: evento.target.value
                  })
                }
                required
              />

              <button type="submit" disabled={carregando}>
                {carregando ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </form>
          )}

          {!mostrarPerfil && (
            <>
{mostrarCadastroTecnico && usuario.perfil === 'Administrador' && (
  <form
    className="formulario-chamado"
    onSubmit={cadastrarTecnico}
  >
    <h2>Cadastrar técnico</h2>

    <label htmlFor="tecnico-nome">Nome completo</label>
    <input
      id="tecnico-nome"
      type="text"
      value={novoTecnico.nome}
      onChange={(evento) =>
        setNovoTecnico({
          ...novoTecnico,
          nome: evento.target.value
        })
      }
      required
    />

    <label htmlFor="tecnico-email">E-mail</label>
    <input
      id="tecnico-email"
name="novo-tecnico-email"
autoComplete="off"
      type="email"
      value={novoTecnico.email}
      onChange={(evento) =>
        setNovoTecnico({
          ...novoTecnico,
          email: evento.target.value
        })
      }
      required
    />

    <label htmlFor="tecnico-senha">Senha</label>
    <input
      id="tecnico-senha"
name="nova-senha-tecnico"
autoComplete="new-password"
      type="password"
      value={novoTecnico.senha}
      onChange={(evento) =>
        setNovoTecnico({
          ...novoTecnico,
          senha: evento.target.value
        })
      }
      required
    />

    <button type="submit" disabled={carregando}>
      {carregando ? 'Cadastrando...' : 'Salvar técnico'}
    </button>

    <button
      type="button"
      className="botao-link"
      onClick={() => setMostrarCadastroTecnico(false)}
    >
      Cancelar
    </button>
  </form>
)}
          <h2>
  {usuario.perfil === 'Administrador'
    ? 'Todos os chamados'
    : 'Meus chamados'}
</h2>

          <div className="acoes-painel">
{usuario.perfil === 'Administrador' && (
  <button
    type="button"
    onClick={() => {
      setMostrarCadastroTecnico(true)
      setMostrarPerfil(false)
      setErro('')
      setMensagem('')
    }}
  >
    + Cadastrar técnico
  </button>
)}
           {usuario.perfil === 'Usuário' && (
  <button
    onClick={() => {
      setMostrarFormulario(!mostrarFormulario)
      setErro('')
      setMensagem('')
    }}
  >
    {mostrarFormulario ? 'Cancelar' : '+ Novo chamado'}
  </button>
)}

            <button
              onClick={async () => {
                try {
                  setErro('')
                  await consultarChamados(token, usuario.perfil)
                } catch (falha) {
                  setErro(falha.message)
                }
              }}
            >
              Atualizar lista
            </button>
          </div>

          {mensagem && (
            <p role="status" className="mensagem-sucesso">
              {mensagem}
            </p>
          )}

   {mensagem && (
  <p role="status" className="mensagem-sucesso">
    {mensagem}
  </p>
)} 

          {erro && (
            <p role="alert" className="mensagem-erro">
              {erro}
            </p>
          )}

          {mostrarFormulario && (
            <form
              className="formulario-chamado"
              onSubmit={cadastrarChamado}
            >
              <h3>Abrir novo chamado</h3>

              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                value={novoChamado.titulo}
                onChange={(evento) =>
                  atualizarCampo('titulo', evento.target.value)
                }
                minLength={3}
                maxLength={150}
                required
                placeholder="Ex.: Impressora não funciona"
              />

              <label htmlFor="descricao">Descrição do problema</label>
              <textarea
                id="descricao"
                value={novoChamado.descricao}
                onChange={(evento) =>
                  atualizarCampo('descricao', evento.target.value)
                }
                minLength={5}
                required
                placeholder="Descreva o problema encontrado"
              />

              <label htmlFor="categoria">Categoria</label>
              <select
                id="categoria"
                value={novoChamado.categoria}
                onChange={(evento) =>
                  atualizarCampo('categoria', evento.target.value)
                }
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Rede">Rede</option>
                <option value="Outros">Outros</option>
              </select>

              <label htmlFor="prioridade">Prioridade</label>
              <select
                id="prioridade"
                value={novoChamado.prioridade}
                onChange={(evento) =>
                  atualizarCampo('prioridade', evento.target.value)
                }
              >
                <option value="Baixa">Baixa</option>
                <option value="Media">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>

              <button type="submit" disabled={carregando}>
                {carregando ? 'Salvando...' : 'Cadastrar chamado'}
              </button>
            </form>
          )}

          {chamados.length === 0 ? (
            <p>Você ainda não possui chamados cadastrados.</p>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Título</th>
                    <th>Categoria</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th>ID do técnico</th>
{(usuario.perfil === 'Técnico' || usuario.perfil === 'Administrador') && (
  <th>Ações</th>
)}
                  </tr>
                </thead>
                <tbody>
                  {chamados.map((chamado) => (
                    <tr key={chamado.id}>
                      <td>#{chamado.id}</td>
                      <td>{chamado.titulo}</td>
                      <td>{chamado.categoria}</td>
                      <td>{chamado.prioridade}</td>
                      <td>{chamado.status}</td>
                      <td>
                        {chamado.tecnico_id ?? 'Não atribuído'}
                      </td>
{usuario.perfil === 'Administrador' && (
  <td>
    {chamado.status === 'Concluído' ? (
      <span>Finalizado</span>
    ) : (
      <button
        disabled={carregando}
        onClick={() => atribuirTecnico(chamado.id)}
      >
        {chamado.tecnico_id
          ? 'Alterar técnico'
          : 'Atribuir técnico'}
      </button>
    )}
  </td>
)}

{usuario.perfil === 'Técnico' && (
  <td>
    {chamado.status === 'Aberto' && (
      <button
        disabled={carregando}
        onClick={() =>
          atualizarStatus(chamado.id, 'Em andamento')
        }
      >
        Iniciar atendimento
      </button>
    )}

    {chamado.status === 'Em andamento' && (
      <button
        disabled={carregando}
        onClick={() =>
          atualizarStatus(chamado.id, 'Concluído')
        }
      >
        Concluir chamado
      </button>
    )}

    {chamado.status === 'Concluído' && (
      <span>Finalizado</span>
    )}
  </td>
)}

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

                 )}

          </>
          )}
        </section>
      </main>
    )
  }

if (mostrarRecuperacao) {
  return (
    <main className="login-container">
      <section className="login-card">
        <div className="logo">ST</div>

        <h1>Recuperar senha</h1>
        <p>
          {etapaRecuperacao === 1
            ? 'Informe seu e-mail para solicitar a recuperação.'
            : 'Informe o código de recuperação e escolha uma nova senha.'}
        </p>

        <form
          onSubmit={
            etapaRecuperacao === 1
              ? solicitarRecuperacao
              : redefinirSenha
          }
        >
          <label htmlFor="recuperacao-email">E-mail</label>
          <input
            id="recuperacao-email"
            type="email"
            value={dadosRecuperacao.email}
            onChange={(evento) =>
              setDadosRecuperacao({
                ...dadosRecuperacao,
                email: evento.target.value
              })
            }
            required
          />

          {etapaRecuperacao === 2 && (
            <>
              <label htmlFor="recuperacao-codigo">
                Código de recuperação
              </label>
              <input
                id="recuperacao-codigo"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={dadosRecuperacao.codigo}
                onChange={(evento) =>
                  setDadosRecuperacao({
                    ...dadosRecuperacao,
                    codigo: evento.target.value
                  })
                }
                required
              />

              <label htmlFor="recuperacao-senha">
                Nova senha
              </label>
              <input
                id="recuperacao-senha"
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={dadosRecuperacao.nova_senha}
                onChange={(evento) =>
                  setDadosRecuperacao({
                    ...dadosRecuperacao,
                    nova_senha: evento.target.value
                  })
                }
                required
              />
            </>
          )}

          {mensagem && (
            <p role="status" className="mensagem-sucesso">
              {mensagem}
            </p>
          )}

          {erro && (
            <p role="alert" className="mensagem-erro">
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando}>
            {carregando
              ? 'Aguarde...'
              : etapaRecuperacao === 1
                ? 'Solicitar código'
                : 'Redefinir senha'}
          </button>
        </form>

        <button
          type="button"
          className="botao-link"
          onClick={() => {
            setMostrarRecuperacao(false)
            setEtapaRecuperacao(1)
            setDadosRecuperacao({
              email: '',
              codigo: '',
              nova_senha: ''
            })
            setErro('')
            setMensagem('')
          }}
        >
          Voltar ao login
        </button>
      </section>
    </main>
  )
}

  if (mostrarCadastro) {
    return (
      <main className="login-container">
        <section className="login-card">
          <div className="logo">ST</div>

          <h1>Criar conta</h1>
          <p>Cadastre-se para abrir chamados técnicos.</p>

          <form onSubmit={cadastrarUsuario}>
            <label htmlFor="cadastro-nome">Nome completo</label>
            <input
              id="cadastro-nome"
              type="text"
              placeholder="Digite seu nome completo"
              value={novoUsuario.nome}
              onChange={(evento) =>
                setNovoUsuario({
                  ...novoUsuario,
                  nome: evento.target.value
                })
              }
              required
            />

            <label htmlFor="cadastro-email">E-mail</label>
            <input
              id="cadastro-email"
              type="email"
              placeholder="Digite seu e-mail"
              value={novoUsuario.email}
              onChange={(evento) =>
                setNovoUsuario({
                  ...novoUsuario,
                  email: evento.target.value
                })
              }
              required
            />

            <label htmlFor="cadastro-senha">Senha</label>
            <input
              id="cadastro-senha"
              type="password"
              placeholder="Crie uma senha"
              value={novoUsuario.senha}
              onChange={(evento) =>
                setNovoUsuario({
                  ...novoUsuario,
                  senha: evento.target.value
                })
              }
              required
            />

            {erro && (
              <p role="alert" className="mensagem-erro">
                {erro}
              </p>
            )}

            <button type="submit" disabled={carregando}>
              {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <button
            className="botao-link"
            type="button"
            onClick={() => {
              setMostrarCadastro(false)
              setErro('')
              setMensagem('')
            }}
          >
            Voltar ao login
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="login-container">
      <section className="login-card">
        <div className="logo">ST</div>

        <h1>Sistema de Chamados Técnicos</h1>
        <p>Entre com sua conta para acessar o sistema.</p>

<form onSubmit={entrar} autoComplete="off">
  <label htmlFor="email">E-mail</label>
  <input
    id="email"
    type="email"
    name="login-email"
    autoComplete="off"
    placeholder="Digite seu e-mail"
    value={email}
    onChange={(evento) => setEmail(evento.target.value)}
    required
  />

  <label htmlFor="senha">Senha</label>
  <input
    id="senha"
    type="password"
    name="login-senha"
    autoComplete="new-password"
    placeholder="Digite sua senha"
    value={senha}
    onChange={(evento) => setSenha(evento.target.value)}
    required
  />

  {mensagem && (
    <p role="status" className="mensagem-sucesso">
      {mensagem}
    </p>
  )}

  {erro && (
    <p role="alert" className="mensagem-erro">
      {erro}
    </p>
  )}

  <button type="submit" disabled={carregando}>
    {carregando ? 'Entrando...' : 'Entrar'}
  </button>
</form>
<button
  type="button"
  className="botao-link"
  onClick={() => {
    setMostrarRecuperacao(true)
    setEtapaRecuperacao(1)
    setDadosRecuperacao({
      email: email,
      codigo: '',
      nova_senha: ''
    })
    setErro('')
    setMensagem('')
  }}
>
  Esqueci minha senha
</button>
        <button
className="botao-link"
          type="button"
          onClick={() => {
            setMostrarCadastro(true)
            setErro('')
            setMensagem('')
          }}
        >
          Criar conta
        </button>

        <p className="rodape">
          Sistema de Gerenciamento de Chamados Técnicos
        </p>
      </section>
    </main>
  )
}

export default App
