1. Apresentação
Projeto desenvolvido para gerenciar chamados de suporte técnico, permitindo o cadastro de usuários, autenticação, gerenciamento de perfis e acompanhamento de solicitações de atendimento.
O sistema oferece diferentes níveis de acesso para administradores, técnicos e usuários, possibilitando a organização e o acompanhamento dos atendimentos técnicos.
2. Tecnologias utilizadas
•	Frontend: React e Vite
•	Backend: Python e FastAPI
•	Banco de dados: MySQL
•	Persistência: SQLAlchemy
•	Autenticação: JWT
•	Segurança das senhas: Hash Argon2
3. Funcionalidades implementadas
•	Cadastro de usuários
•	Autenticação e encerramento de sessão
•	Consulta e atualização do próprio perfil
•	Perfis de acesso: Administrador, Técnico e Usuário
•	Cadastro e acompanhamento de chamados técnicos
•	Atribuição e atualização de chamados
•	Recuperação e redefinição de senha
Observação: a recuperação de senha utiliza um código temporário exibido no terminal do backend, exclusivamente para demonstração. O envio real por e-mail não foi implementado.
4. Estrutura do projeto
sistema-chamados-tecnicos/
├── backend/
│   ├── app/
│   ├── .env.example
│   ├── main.py
│   └── requirements.txt
├── frontend/
├── sistema_chamados.sql
└── README.md
5. Configuração do banco de dados
1.	Instalar e iniciar o MySQL.
2.	Abrir o MySQL Workbench.
3.	Importar o arquivo sistema_chamados.sql em um ambiente de demonstração.
4.	Confirmar a criação do banco sistema_chamados e de suas tabelas.
5.	Configurar a conexão do backend com o banco de dados.
Atenção: o script SQL contém comandos que podem substituir tabelas existentes. Utilize um ambiente de demonstração, sem dados importantes.
O arquivo SQL disponibilizado contém a estrutura das tabelas e os três perfis de acesso necessários ao sistema: Administrador, Técnico e Usuário. Por segurança e organização, os registros de usuários, chamados técnicos e recuperação de senha utilizados durante os testes não foram incluídos.
6. Execução do backend
6.1. Criar o ambiente virtual
Abrir um terminal na pasta backend e executar:
python -m venv .venv
6.2. Ativar o ambiente virtual
No PowerShell do Windows:
.\.venv\Scripts\Activate.ps1
6.3. Instalar as dependências
pip install -r requirements.txt
6.4. Configurar as variáveis de ambiente
Antes de iniciar o backend, copiar o arquivo backend/.env.example para um novo arquivo chamado backend/.env.
No arquivo .env, configurar as seguintes variáveis:
Variável	Descrição
DB_HOST	Endereço do servidor MySQL
DB_PORT	Porta do MySQL, normalmente 3306
DB_NAME	Nome do banco de dados: sistema_chamados
DB_USER	Usuário de acesso ao MySQL
DB_PASSWORD	Senha do usuário do MySQL
JWT_SECRET_KEY	Chave secreta aleatória utilizada para gerar e validar tokens JWT
Exemplo de configuração:
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=sistema_chamados
DB_USER=root
DB_PASSWORD=COLOQUE_SUA_SENHA_AQUI
JWT_SECRET_KEY=SUBSTITUA_POR_UMA_CHAVE_SECRETA_ALEATORIA
Os valores de DB_PASSWORD e JWT_SECRET_KEY devem ser substituídos pelas configurações do ambiente de execução.
Importante: O arquivo .env.example é disponibilizado apenas como modelo.
6.5. Iniciar o backend
Com o ambiente virtual ativado, executar:
uvicorn main:app --reload
A API estará disponível em:
http://127.0.0.1:8000
A documentação interativa da API (Swagger) poderá ser acessada em:
http://127.0.0.1:8000/docs
7. Execução do frontend
Abrir outro terminal e acessar a pasta frontend.
7.1. Instalar as dependências
É necessário ter o Node.js e o npm instalados.
Executar:
npm install
7.2. Iniciar a aplicação
npm run dev
A aplicação poderá ser acessada em:
http://localhost:5173
Observação: para utilizar todas as funcionalidades, o backend e o MySQL também deverão estar em execução.
8. Perfis de acesso e usuários de demonstração

O sistema possui três perfis de acesso:

- **Administrador:** responsável pelo gerenciamento de usuários, perfis e chamados técnicos.
- **Técnico:** responsável pelo atendimento e atualização dos chamados técnicos.
- **Usuário:** responsável pela abertura e pelo acompanhamento dos próprios chamados.

O banco de dados disponibilizado contém apenas os registros dos três perfis de acesso.

Para utilizar a aplicação, é necessário cadastrar novos usuários. A atribuição dos perfis de Administrador e Técnico deverá ser realizada conforme as permissões e funcionalidades implementadas no backend.

As credenciais utilizadas durante o desenvolvimento não acompanham esta versão pública do projeto.

9. Testes e demonstração
O sistema foi utilizado em testes funcionais envolvendo:
•	Cadastro de novos usuários
•	Autenticação com diferentes perfis de acesso
•	Consulta e atualização de informações cadastrais
•	Criação de chamados técnicos
•	Acompanhamento e atualização de chamados
•	Atribuição de chamados aos técnicos
•	Recuperação e redefinição de senha
•	Validação de permissões conforme o perfil do usuário
Os testes foram realizados em ambiente de desenvolvimento, utilizando dados fictícios. Os registros gerados durante essas atividades foram removidos do script SQL disponibilizado publicamente, preservando a estrutura do banco de dados e os perfis de acesso necessários ao funcionamento da aplicação.

10. Considerações finais
O Sistema de Gerenciamento de Chamados Técnicos foi desenvolvido utilizando tecnologias de desenvolvimento web, API REST, autenticação e banco de dados relacional.
O projeto demonstra a integração entre frontend, backend e banco de dados, além da implementação de funcionalidades de cadastro, autenticação, gerenciamento de perfis e atendimento técnico.
