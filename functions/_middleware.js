
function unauthorized() {
  return new Response("Senha necessaria para acessar este site.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Site protegido", charset="UTF-8"',
      "Cache-Control": "no-store"
    }
  });
}

export async function onRequest({ request, env, next }) {
  const auth = request.headers.get("Authorization");

  if (!auth || !auth.startsWith("Basic ")) {
    return unauthorized();
  }

  let credentials;

  try {
    credentials = atob(auth.slice(6));
  } catch {
    return unauthorized();
  }

  const separator = credentials.indexOf(":");

  if (separator < 0) {
    return unauthorized();
  }

  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);

  if (
    username !== "visitante" ||
    !env.SITE_PASSWORD ||
    password !== env.SITE_PASSWORD
  ) {
    return unauthorized();
  }

  const response = await next();
  const headers = new Headers(response.headers);

  headers.set("Cache-Control", "private, no-store");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
