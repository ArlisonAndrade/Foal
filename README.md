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
