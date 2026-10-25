
const ALLOWED_ORIGINS = new Set([
  "https://automacoes-musica.wagnermetalcfc.workers.dev",
  // Adicione aqui seu domínio Pages/customizado, se diferente.
]);

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");

  // O Origin ajuda a restringir chamadas via navegador,
  // mas não substitui autenticação nem proteção contra abuso.
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

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return Response.json(
      { message: "Content-Type inválido" },
      { status: 415 }
    );
  }

  let rawBody;
  try {
    rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > 2048) {
      return Response.json(
        { message: "Requisição muito grande" },
        { status: 413 }
      );
    }
  } catch {
    return Response.json(
      { message: "Não foi possível ler a requisição" },
      { status: 400 }
    );
  }

  let data;
  try {
    data = JSON.parse(rawBody);
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
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type":
          upstream.headers.get("Content-Type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { message: "Falha ao chamar a automação" },
      { status: 502 }
    );
  }
}

export async function onRequestGet() {
  return Response.json(
    { message: "Use POST para executar a automação" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
