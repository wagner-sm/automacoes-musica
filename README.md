# Automações de Música

Aplicação simples para disparar automações de coleta de dados sobre música a partir de uma interface web, com autenticação básica e um Worker do Cloudflare para proteger o acesso e encaminar as requisições para o webhook do n8n.

## Funcionalidades

- Botão para executar a automação de Discogs
- Botão para executar a automação de Setlist.fm
- Interface em HTML/CSS/JS
- Proteção de acesso com autenticação HTTP Basic
- Proxy seguro via Worker do Cloudflare
- Validação de origem, método HTTP, JSON e automação solicitada
- Ocultação da URL do webhook do n8n no navegador

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

A página `index.html` envia uma requisição para o Worker em `/api/music` quando um dos botões é clicado. O Worker:

1. valida a autenticação HTTP Basic;
2. verifica a origem permitida;
3. valida o tipo de automação (`discogs` ou `setlistfm`);
4. encaminha a requisição para o webhook do n8n configurado em `N8N_WEBHOOK_URL`;
5. retorna a resposta do fluxo de automação sem expor a URL do n8n ao navegador.

A autenticação é realizada com o usuário `visitante` e a senha definida na variável `SITE_PASSWORD`.

## Variáveis de ambiente

No Cloudflare Workers, configure as seguintes variáveis:

```bash
SITE_PASSWORD=sua_senha
N8N_WEBHOOK_URL=https://seu-n8n.example.com/webhook/seu-fluxo
```

## Configuração local

1. Instale as dependências do Wrangler, se necessário:

```bash
npm install -g wrangler
```

2. Inicie o projeto localmente:

```bash
npx wrangler dev
```

3. Acesse a URL local exibida no terminal para testar a interface.

## Deploy

Para publicar no Cloudflare Workers:

```bash
npx wrangler deploy
```

## Credenciais esperadas

- Usuário: `visitante`
- Senha: valor da variável `SITE_PASSWORD`

## Observações importantes

- A origem permitida no Worker está definida em `ALLOWED_ORIGINS` e deve ser ajustada para o domínio real do deploy.
- Se `SITE_PASSWORD` não estiver configurada, o Worker responde com erro `500`.
- Se `N8N_WEBHOOK_URL` não estiver configurada, a rota `/api/music` retorna erro `500`.
- O projeto usa autenticação básica para proteger o acesso ao site e ao endpoint da automação.

## Requisitos

- Node.js
- Wrangler
- Cloudflare Workers
- Webhook do n8n ativo e acessível
