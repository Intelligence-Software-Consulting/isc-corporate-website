// Captación de leads del widget de TED en www.iscit.com.mx.
//
// Vive en el sitio (no en TED), así que funciona aunque TED esté apagado fuera de horario.
// Destinos (se usan los que estén configurados en las variables de la Static Web App):
//   LEADS_STORAGE_CONNECTION  cadena de conexión de una cuenta de Azure Storage → tabla "leads"
//   LEADS_TABLE               nombre de la tabla (por defecto "leads")
//   LEAD_NOTIFY_WEBHOOK       URL que recibe un JSON por lead (Teams, Power Automate, Slack…)
// Si no hay ninguno configurado responde 503 y el widget ofrece escribir a contacto@iscit.com.mx.
//
// Privacidad (LFPDPPP): solo se guarda lo que el visitante escribe en el formulario y con su consentimiento.
import { randomUUID } from "node:crypto";
import { app } from "@azure/functions";
import { TableClient } from "@azure/data-tables";
import { clean, clientIp, json, rateLimiter, readJson } from "../lib/http.js";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/;
const PHONE_RE = /^[0-9+()\-.\s]{7,25}$/;
const SOURCES = new Set(["widget", "widget-offline"]);
const allow = rateLimiter(5, 10 * 60_000); // 5 envíos por IP cada 10 minutos

let tableClient;
let tableReady;
function table() {
  const conn = process.env.LEADS_STORAGE_CONNECTION;
  if (!conn) return null;
  if (!tableClient) {
    tableClient = TableClient.fromConnectionString(conn, process.env.LEADS_TABLE || "leads");
    tableReady = tableClient.createTable().catch((err) => {
      if (err?.statusCode !== 409) throw err; // 409 = ya existe
    });
  }
  return tableClient;
}

export function validateLead(body) {
  const lead = {
    name: clean(body?.name, 120),
    email: clean(body?.email, 160)?.toLowerCase(),
    phone: clean(body?.phone, 40),
    company: clean(body?.company, 160),
    interest: typeof body?.interest === "string" ? body.interest.trim().slice(0, 2000) || undefined : undefined,
    pageUrl: /^https?:\/\//.test(body?.page_url || "") ? clean(body.page_url, 300) : undefined,
    source: SOURCES.has(body?.source) ? body.source : "widget",
  };
  if (!lead.name || lead.name.length < 2) return { error: "Escribe tu nombre." };
  if (!lead.email && !lead.phone) return { error: "Déjanos un correo o un teléfono para contactarte." };
  if (lead.email && !EMAIL_RE.test(lead.email)) return { error: "El correo no parece válido." };
  if (lead.phone && !PHONE_RE.test(lead.phone)) return { error: "El teléfono no parece válido." };
  if (body?.consent !== true) return { error: "Necesitamos tu autorización para usar tus datos de contacto." };
  return { lead };
}

async function notify(lead, context) {
  const url = process.env.LEAD_NOTIFY_WEBHOOK;
  if (!url) return false;
  const lines = [`Nuevo lead desde www.iscit.com.mx (${lead.source})`, `Nombre: ${lead.name}`];
  if (lead.email) lines.push(`Correo: ${lead.email}`);
  if (lead.phone) lines.push(`Teléfono: ${lead.phone}`);
  if (lead.company) lines.push(`Empresa: ${lead.company}`);
  if (lead.interest) lines.push(`Interés: ${lead.interest}`);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: lines.join("\n"), lead }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch (err) {
    context.warn(`No se pudo notificar el lead ${lead.id}: ${err}`);
    return false;
  }
}

app.http("leads", {
  route: "leads",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const body = await readJson(request);
    if (!body) return json(400, { error: "Solicitud inválida." });
    if (body.website) return json(201, { ok: true }); // honeypot: bots

    const { lead, error } = validateLead(body);
    if (error) return json(422, { error });
    if (!allow(clientIp(request))) {
      return json(429, { error: "Ya recibimos tus datos. Si necesitas algo más, escríbenos a contacto@iscit.com.mx." });
    }

    const now = new Date();
    lead.id = randomUUID();
    lead.createdAt = now.toISOString();

    const client = table();
    let stored = false;
    if (client) {
      try {
        await tableReady;
        await client.createEntity({
          partitionKey: now.toISOString().slice(0, 7), // AAAA-MM
          rowKey: `${String(9999999999999 - now.getTime()).padStart(13, "0")}-${lead.id.slice(0, 8)}`, // más recientes primero
          ...Object.fromEntries(Object.entries(lead).filter(([, v]) => v !== undefined)),
          consent: true,
          status: "nuevo",
        });
        stored = true;
      } catch (err) {
        context.error(`No se pudo guardar el lead ${lead.id}: ${err}`);
      }
    }
    const notified = await notify(lead, context);

    if (!stored && !notified) {
      return json(503, { error: "No pudimos registrar tus datos en este momento.", fallback: "mailto" });
    }
    context.log(`[lead] ${lead.id} (${lead.source}) guardado=${stored} notificado=${notified}`);
    return json(201, { ok: true, id: lead.id });
  },
});
