# Automações de Música

Uma interface simples em HTML para disparar automações de coleta de dados de música, integradas com um fluxo do n8n.

O projeto expõe uma página web com botões para executar duas automações:

- Discogs: coleta informações de discos, artistas e lançamentos
- Setlist.fm: coleta dados de shows e setlists

A aplicação é servida por um Worker do Cloudflare, que protege o acesso com autenticação HTTP Basic antes de liberar a página.

## Visão geral

Este repositório combina:

- uma interface web estática em `index.html`
- um Worker em `worker.js` para autenticação e roteamento
- configuração do Cloudflare em `wrangler.jsonc`
- um middleware em `functions/_middleware.js`

## Estrutura do projeto

```text
.
├── index.html
├── worker.js
├── wrangler.jsonc
├── .assetsignore
├── functions/
│   └── _middleware.js
└── README.md
```

## Como funciona

A página principal (`index.html`) envia solicitações POST para um webhook do n8n:

- `https://n8n-n8n.d4ecel.easypanel.host/webhook/unified`

Ao clicar em um botão, o navegador envia um payload com:

```json
{
  "source": "discogs",
  "timestamp": "2026-10-24T12:00:00.000Z"
}
```

O Worker verifica a autenticação Basic e, se as credenciais estiverem corretas, libera o acesso ao conteúdo estático. Caso contrário, responde com `401` e exige autenticação.

## Credenciais

O Worker espera:

- usuário: `visitante`
- senha: valor da variável de ambiente `SITE_PASSWORD`

Se `SITE_PASSWORD` não estiver configurada, o Worker retorna erro `500`.

## Pré-requisitos

- Node.js e npm
- Cloudflare Wrangler
- acesso a um ambiente do Cloudflare Workers
- variável `SITE_PASSWORD` configurada

## Configuração local

1. Instale as dependências do projeto:

```bash
npm install
```

2. Configure a variável de ambiente:

```bash
export SITE_PASSWORD="sua_senha"
```

3. Inicie o projeto localmente:

```bash
npx wrangler dev
```

4. Acesse a aplicação no navegador via o endereço exibido pelo Wrangler.

## Deploy

Para publicar o projeto no Cloudflare:

```bash
npx wrangler deploy
```

## Observações

- O projeto usa `run_worker_first: true` em `wrangler.jsonc`, então o Worker é executado antes dos assets.
- A pasta raiz é tratada como diretório de assets do Workers.
- O arquivo `functions/_middleware.js` pode ser usado para customizações adicionais de execução do Workers.

## Licença

Este projeto não especifica uma licença no momento. Caso queira, ajuste o arquivo conforme a política da sua organização ou do projeto.

## Autor

Projeto mantido por `wagner-sm`.
