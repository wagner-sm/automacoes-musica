export async function onRequestGet({ request, env }) {
  const source = new URL(request.url).searchParams.get("source");

  if (!["discogs", "setlistfm"].includes(source)) {
    return Response.json({ message: "Automação inválida" }, { status: 400 });
  }
  if (!env.N8N_STATUS_URL) {
    return Response.json({ message: "Status não configurado" }, { status: 500 });
  }

  try {
    const upstream = await fetch(
      `${env.N8N_STATUS_URL}?source=${encodeURIComponent(source)}`,
      { signal: AbortSignal.timeout(15000) }
    );
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ message: "Falha ao consultar status" }, { status: 502 });
  }
}
