
const ALLOWED_ORIGINS = new Set([
  "https://automacoes-musica.wagnermetalcfc.workers.dev",
]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. Mantém a autenticação existente
    const authorization = request.headers.get("Authorization");
    const expectedUser = "visitante";
    const password = env.SITE_PASSWORD;

    if (!password) {
      return new Response("Autenticacao nao configurada.", {
        status: 500,
      });
    }

    let authenticated = false;

    if (authorization?.startsWith("Basic ")) {
      try {
        const decoded = atob(authorization.slice(6));
        const separator = decoded.indexOf(":");

        if (separator >= 0) {
          const username = decoded.slice(0, separator);
          const suppliedPassword = decoded.slice(separator + 1);

          authenticated =
            username === expectedUser &&
            suppliedPassword === password;
        }
      } catch {
        // Credenciais inválidas
      }
    }

    if (!authenticated) {
      return new Response("Acesso restrito. Informe as credenciais.", {
        status: 401,
        headers: {
          "WWW-Authenticate":
            'Basic realm="Automacoes Musica", charset="UTF-8"',
          "Cache-Control": "no-store",
        },
      });
    }

    // 2. Encaminha a chamada ao n8n sem revelar a URL ao navegador
    if (url.pathname === "/api/music") {
      if (request.method !== "POST") {
        return Response.json(
          { message: "Use POST para executar a automação" },
          { status: 405, headers: { Allow: "POST" } }
        );
      }

      const origin = request.headers.get("Origin");

      if (!origin || !ALLOWED_ORIGINS.has(origin)) {
        return Response.json(
          { message: "Origem não permitida" },
          { status: 403 }
        );
      }

      if (!env.N8N_WEBHOOK_URL) {
        return Response.json(
          { message: "Webhook não configurado" },
          { status: 500 }
        );
      }

      if (!(request.headers.get("Content-Type") || "")
        .toLowerCase().includes("application/json")) {
        return Response.json(
          { message: "Content-Type inválido" },
          { status: 415 }
        );
      }

      let data;

      try {
        const body = await request.text();

        if (new TextEncoder().encode(body).length > 2048) {
          return Response.json(
            { message: "Requisição muito grande" },
            { status: 413 }
          );
        }

        data = JSON.parse(body);
      } catch {
        return Response.json(
          { message: "JSON inválido" },
          { status: 400 }
        );
      }

      if (!data || !["discogs", "setlistfm"].includes(data.source)) {
        return Response.json(
          { message: "Automação inválida" },
          { status: 400 }
        );
      }

      try {
        const upstream = await fetch(env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: data.source,
            timestamp: new Date().toISOString(),
          }),
          redirect: "manual",
          signal: AbortSignal.timeout(10 * 60 * 1000),
        });

        const headers = new Headers();
        headers.set(
          "Content-Type",
          upstream.headers.get("Content-Type") || "application/json"
        );
        headers.set("Cache-Control", "no-store");

        return new Response(upstream.body, {
          status: upstream.status,
          headers,
        });
      } catch {
        return Response.json(
          { message: "Falha ao chamar a automação" },
          { status: 502 }
        );
      }
    }

    // 3. Demais rotas continuam servindo o site normalmente
    return env.ASSETS.fetch(request);
  },
};
