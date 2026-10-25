# Automações de Música

Projeto simples para disparar automações de coleta de dados sobre música usando uma interface web e um Worker do Cloudflare.

## Funcionalidades

- Botão para executar a automação de Discogs
- Botão para executar a automação de Setlist.fm
- Interface em HTML/CSS/JS
- Proteção de acesso com autenticação HTTP Basic
- Publicação com Cloudflare Workers

## Estrutura

```text
.
├── index.html
├── worker.js
├── wrangler.jsonc
├── functions/
│   └── _middleware.js
├── .assetsignore
└── README.md
```

## Como funciona

A página `index.html` envia uma requisição POST para o webhook do n8n ao clicar em um dos botões. O Worker `worker.js` valida a autenticação Basic antes de liberar o acesso ao site.

## Configuração

1. Configure a variável de ambiente:

```bash
SITE_PASSWORD=sua_senha
```

2. Rode localmente:

```bash
npx wrangler dev
```

3. Para publicar:

```bash
npx wrangler deploy
```

## Credenciais esperadas

- Usuário: `visitante`
- Senha: valor da variável `SITE_PASSWORD`

## Observação

Se a variável `SITE_PASSWORD` não estiver configurada, o Worker retorna erro `500` e o acesso é bloqueado.
