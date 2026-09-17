# FOAL — Avaliação da Liderança

Aplicação web (PWA-ish, mobile-first) usada por instrutores para avaliar alunos
em exercícios de equitação militar. O instrutor monta grupamentos, aplica os
cenários de avaliação por atributo, e o resultado é gravado em um banco do Notion.

## Stack

| Camada    | Tecnologia                                      |
| --------- | ----------------------------------------------- |
| Front-end | React 18 + Vite 4 (sem framework de CSS — estilos inline) |
| Auth      | Firebase Authentication (e-mail/senha)          |
| Back-end  | Vercel Serverless Functions (`api/`)            |
| Dados     | Notion API (banco de avaliações)                |
| Deploy    | Vercel — <https://foal-app.vercel.app>          |

## Estrutura

```
src/
  main.jsx          bootstrap React + AuthProvider
  App.jsx           app inteiro: navegação, telas, fluxo de avaliação (~1.2k linhas)
  TelaLogin.jsx     tela de login/cadastro
  AuthContext.jsx   contexto de sessão do Firebase
  firebase.js       config do Firebase (chaves públicas de client)
  cenarios.js       cenários, atributos e cálculo de nota/menção
  dados.js          cursos, turmas e lista de atletas
  logos.js          mapa de logos das armas
api/
  salvar.js         POST — grava as avaliações como páginas no Notion
  grupamentos.js    GET/POST — persiste grupamentos (sem uso no front hoje)
public/logos/       brasões das armas
tools/              scripts Python avulsos de manutenção do Notion
```

## Rodando local

```bash
npm install
npm run dev
```

Abre em <http://localhost:5173>.

> **Atenção:** `vite dev` serve só o front. As rotas `api/*` são Serverless
> Functions da Vercel e **não** sobem com o Vite. Para exercitar a gravação
> local, use `vercel dev` ou aponte `VITE_API_BASE` (em `.env.local`) para um
> deploy que já tenha as functions. Sem isso, o envio final retorna 404.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. As credenciais do Notion são lidas
**apenas no servidor** (`api/`) e precisam estar também no painel da Vercel em
_Settings → Environment Variables_.

| Variável                   | Onde         | Obrigatória |
| -------------------------- | ------------ | ----------- |
| `NOTION_API_KEY`           | Vercel / api | sim         |
| `NOTION_DATABASE_ID`       | Vercel / api | sim         |
| `NOTION_GRUPAMENTOS_DB_ID` | Vercel / api | não         |
| `VITE_API_BASE`            | dev local    | não         |

A config do Firebase em `src/firebase.js` é pública por design (chave de client);
a proteção real vem das regras do Firebase, não do sigilo dessa chave.

## Entrada facial (biometria)

No celular, o instrutor pode ativar **"entrar com o rosto"** no rodapé da tela
inicial. A partir daí, abrir o app pede Face ID / desbloqueio facial do Android
em vez da senha.

Como funciona (`src/biometria.js`, `src/TelaBloqueio.jsx`):

- Usa **WebAuthn com autenticador de plataforma**. O dado biométrico nunca sai do
  aparelho — o navegador devolve só uma assinatura criptográfica. Nenhum dado
  facial passa pelo nosso código nem pelo Notion.
- O `rp.id` é **omitido de propósito**, então o navegador usa o domínio atual.
  Isso faz o mesmo código funcionar em `localhost` e em `foal-app.vercel.app`.
- O credential ID fica em `localStorage` por `uid`; o estado "destravado" fica em
  `sessionStorage`, então recarregar a página no meio de uma avaliação não
  reinterroga, mas fechar e reabrir o app sim.
- O botão só aparece em aparelho com biometria de plataforma disponível. Em
  notebook sem sensor, nem renderiza — e a senha continua sendo o caminho.

### Limite importante

Isto é um **cadeado local sobre a sessão do Firebase**, não uma fronteira de
autenticação. Não existe servidor verificando a assertion (o Firebase não tem
provider de passkey nativo), então o desafio é gerado no próprio cliente.

Na prática: protege contra o cenário real — celular desbloqueado na mão de outra
pessoa — mas não contra alguém com devtools abertos no aparelho. Quem autoriza de
verdade continua sendo a sessão do Firebase.

Para transformar isso numa autenticação de verdade seria preciso uma Serverless
Function rodando a cerimônia WebAuthn com o Firebase Admin SDK, emitindo custom
tokens — o que exige um service account guardado na Vercel.

### Se o domínio mudar

As credenciais WebAuthn são amarradas ao domínio. Migrar de `foal-app.vercel.app`
para um domínio próprio **invalida todas as biometrias cadastradas** e cada
instrutor precisa reativar. Nada quebra — o app cai no login por senha — mas vale
avisar antes.

## Build e deploy

```bash
npm run build     # gera dist/
npm run preview   # serve o build em :4173
```

O deploy é automático na Vercel a partir da branch `main`
(projeto `foal-app`, ver `.vercel/project.json`).

## Scripts Python (`tools/`)

Utilitários pontuais para popular/inspecionar o banco do Notion. Não fazem parte
do app.

```bash
python -m venv .venv && .venv/Scripts/activate
pip install -r tools/requirements.txt
python tools/radar.py            # lista o que a integração enxerga no Notion
python tools/popular_notas.py    # popula notas (aceita --help)
```

Leem `NOTION_API_KEY` do `.env` na raiz.

## Pendências conhecidas

- `api/grupamentos.js` não é chamado por nenhum ponto do front.
- `vite@4` / `esbuild` têm advisories abertos que só fecham subindo para `vite@8`
  (breaking). Afetam apenas o dev server, não o build de produção.
- `App.jsx` concentra ~1.2k linhas com todas as telas — candidato natural a split.
