// Proxy del chat de TED para el widget del sitio.
//
// El navegador solo habla con www.iscit.com.mx/api/ted/* (mismo dominio: sin CORS ni cambios en TED);
// esta función reenvía al API público de TED (https://ted.iscit.com.mx/api/v1/chatbot), que ya tiene
// guardrails, límite de mensajes por IP, memoria por sesión y métricas. TED no se modifica.
import { app } from "@azure/functions";
import { clientIp, json, readJson } from "../lib/http.js";

const TED_API = (process.env.TED_API_URL || "https://ted.iscit.com.mx/api/v1/chatbot").replace(/\/+$/, "");
const CHAT_TIMEOUT_MS = 40_000; // las funciones administradas de SWA cortan a los 45 s
const STATUS_TIMEOUT_MS = 8_000;
const MAX_LEN = 2000;
const SESSION_RE = /^[A-Za-z0-9-]{8,64}$/;

app.http("ted-status", {
  route: "ted/status",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async () => {
    try {
      const res = await fetch(`${TED_API}/health`, { signal: AbortSignal.timeout(STATUS_TIMEOUT_MS) });
      return json(200, { online: res.ok });
    } catch {
      return json(200, { online: false });
    }
  },
});

app.http("ted-chat", {
  route: "ted/chat",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const body = await readJson(request);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const sessionId = typeof body?.session_id === "string" && SESSION_RE.test(body.session_id) ? body.session_id : undefined;
    if (!message) return json(400, { error: "Escribe tu mensaje." });
    if (message.length > MAX_LEN) return json(400, { error: `El mensaje excede ${MAX_LEN} caracteres.` });

    let res;
    try {
      res = await fetch(`${TED_API}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Forwarded-For": clientIp(request) },
        body: JSON.stringify({ message, session_id: sessionId }),
        signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
      });
    } catch (err) {
      context.warn(`TED no respondió: ${err?.name || err}`);
      return json(503, { error: "TED no está disponible en este momento.", offline: true });
    }

    const data = await res.json().catch(() => null);
    if (res.status === 429) return json(429, { error: data?.detail || "Estás enviando mensajes muy rápido. Espera un momento." });
    if (!res.ok || !data?.message) {
      context.warn(`TED respondió ${res.status}`);
      const offline = res.status >= 500;
      return json(offline ? 503 : 502, {
        error: offline ? "TED no está disponible en este momento." : "No pudimos obtener respuesta. Intenta de nuevo.",
        offline,
      });
    }
    return json(200, { message: data.message, session_id: data.session_id, timestamp: data.timestamp });
  },
});
