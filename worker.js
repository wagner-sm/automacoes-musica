
export default {
  async fetch(request, env) {
    const authorization = request.headers.get("Authorization");
    const expectedUser = "visitante";
    const password = env.SITE_PASSWORD;

    if (!password) {
      return new Response("Autenticacao nao configurada.", {
        status: 500
      });
    }

    if (authorization?.startsWith("Basic ")) {
      try {
        const decoded = atob(authorization.slice(6));
        const separator = decoded.indexOf(":");
        const username = decoded.slice(0, separator);
        const suppliedPassword = decoded.slice(separator + 1);

        if (
          separator >= 0 &&
          username === expectedUser &&
          suppliedPassword === password
        ) {
          return env.ASSETS.fetch(request);
        }
      } catch {
        // Credenciais invalidas
      }
    }

    return new Response("Acesso restrito. Informe as credenciais.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Automacoes Musica", charset="UTF-8"',
        "Cache-Control": "no-store"
      }
    });
  }
};
