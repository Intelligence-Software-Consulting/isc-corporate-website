// Utilidades compartidas por las funciones del sitio (sin dependencias).

/** IP real del visitante detrás del front door de Azure Static Web Apps. */
export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for") || "";
  const first = fwd.split(",")[0].trim().replace(/:\d+$/, "");
  return request.headers.get("x-azure-clientip") || first || "unknown";
}

export const json = (status, body) => ({
  status,
  jsonBody: body,
  headers: { "Cache-Control": "no-store" },
});

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** Límite simple en memoria por llave (por instancia de la función). */
export function rateLimiter(max, windowMs) {
  const hits = new Map();
  return (key) => {
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
    if (recent.length >= max) {
      hits.set(key, recent);
      return false;
    }
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // evita crecer sin límite
    return true;
  };
}

export const clean = (v, max) =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) || undefined : undefined;
