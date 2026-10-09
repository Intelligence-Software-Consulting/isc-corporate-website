// Widget compacto de TED para www.iscit.com.mx.
// Solo lo básico: conversar y dejar datos de contacto. Habla con /api/ted/* y /api/leads
// (funciones del propio sitio), que a su vez usan el API de TED sin modificarlo.
import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Check, Loader2, MessageCircle, RotateCcw, UserRound, X } from "lucide-react";
import { Markdown } from "./markdown";
import { OPEN_EVENT } from "./openTed";

type Role = "user" | "assistant";
interface Msg {
  role: Role;
  content: string;
}
type Status = "idle" | "checking" | "online" | "offline";
type View = "chat" | "lead" | "thanks";

const CONTACT_EMAIL = "contacto@iscit.com.mx";
const MAX_LEN = 2000;
const SUGGESTIONS = [
  "¿Qué servicios ofrece ISC?",
  "¿Cómo pueden ayudarme con IA agéntica?",
  "¿Qué experiencia tienen en plataformas de datos?",
];

const newSessionId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

function storage(key: string, value?: string): string | null {
  try {
    if (value === undefined) return sessionStorage.getItem(key);
    sessionStorage.setItem(key, value);
  } catch {
    /* almacenamiento no disponible */
  }
  return null;
}

export default function TedWidget() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chat");
  const [status, setStatus] = useState<Status>("idle");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const [nudge, setNudge] = useState(false);
  const sessionId = useRef(newSessionId());
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pendingPrompt = useRef<string | null>(null);

  // Comprueba si TED está encendido la primera vez que se abre.
  const checkStatus = useCallback(async () => {
    setStatus("checking");
    try {
      const res = await fetch("/api/ted/status", { signal: AbortSignal.timeout(12_000) });
      const data = await res.json();
      setStatus(data?.online ? "online" : "offline");
    } catch {
      setStatus("offline");
    }
  }, []);

  const checkedOnce = useRef(false);
  const openPanel = useCallback(() => {
    setOpen(true);
    setNudge(false);
    storage("ted-nudge", "1");
    if (!checkedOnce.current) {
      checkedOnce.current = true;
      void checkStatus();
    }
    setTimeout(() => inputRef.current?.focus(), 250);
  }, [checkStatus]);

  // Invitación discreta una sola vez por visita.
  useEffect(() => {
    if (storage("ted-nudge")) return;
    const t = setTimeout(() => setNudge(true), 9000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) pendingPrompt.current = prompt;
      setView("chat");
      openPanel();
    };
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, [openPanel]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, error, view]);

  const send = useCallback(
    async (text?: string) => {
      const message = (text ?? input).trim();
      if (!message || loading) return;
      if (message.length > MAX_LEN) {
        setError(`El mensaje excede ${MAX_LEN} caracteres.`);
        return;
      }
      setMessages((m) => [...m, { role: "user", content: message }]);
      if (text === undefined) setInput("");
      setError(null);
      setLoading(true);
      try {
        const res = await fetch("/api/ted/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, session_id: sessionId.current }),
          signal: AbortSignal.timeout(50_000),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data?.offline) setStatus("offline");
          throw new Error(data?.error || "No pudimos obtener respuesta. Intenta de nuevo.");
        }
        if (data.session_id) sessionId.current = data.session_id;
        setStatus("online");
        setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      } catch (e) {
        const timeout = e instanceof DOMException && (e.name === "TimeoutError" || e.name === "AbortError");
        setError(timeout ? "TED tardó demasiado en responder. Intenta de nuevo." : (e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [input, loading],
  );

  // Pregunta enviada desde otra parte del sitio.
  useEffect(() => {
    if (open && pendingPrompt.current && status !== "checking" && status !== "idle") {
      const p = pendingPrompt.current;
      pendingPrompt.current = null;
      void send(p);
    }
  }, [open, status, send]);

  const reset = () => {
    sessionId.current = newSessionId();
    setMessages([]);
    setError(null);
    setView("chat");
    inputRef.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const assistantReplies = messages.filter((m) => m.role === "assistant").length;
  const interest = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" · ")
    .slice(0, 600);

  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Conversación con TED, asistente de ISC"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-[60] flex flex-col overflow-hidden bg-[#0a0f1f] text-white shadow-2xl shadow-black/60 sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px] sm:rounded-2xl sm:border sm:border-white/10"
          >
            {/* Encabezado */}
            <header className="flex items-center gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
              <TedMark />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">TED · Asistente de ISC</p>
                <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      status === "online" ? "bg-emerald-400" : status === "offline" ? "bg-zinc-500" : "animate-pulse bg-amber-400"
                    }`}
                  />
                  {status === "online" ? "En línea" : status === "offline" ? "Fuera de línea" : "Conectando…"}
                </p>
              </div>
              {view === "chat" && !leadSent && (
                <IconButton label="Déjanos tus datos" onClick={() => setView("lead")}>
                  <UserRound size={17} />
                </IconButton>
              )}
              {view === "chat" && messages.length > 0 && (
                <IconButton label="Nueva conversación" onClick={reset}>
                  <RotateCcw size={16} />
                </IconButton>
              )}
              <IconButton label="Cerrar" onClick={() => setOpen(false)}>
                <X size={18} />
              </IconButton>
            </header>

            {view === "chat" && (
              <>
                <div ref={listRef} className="ted-scroll flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
                  {status === "offline" && (
                    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 text-sm text-zinc-300">
                      <p className="font-medium text-white">TED está descansando</p>
                      <p className="mt-1 text-zinc-400">
                        Atiende de 7:00 a 21:00 h (centro de México). Déjanos tus datos y un consultor te contactará.
                      </p>
                      {!leadSent && (
                        <button type="button" onClick={() => setView("lead")} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition hover:bg-zinc-200">
                          Dejar mis datos
                        </button>
                      )}
                    </div>
                  )}

                  {messages.length === 0 && status !== "offline" && (
                    <div className="pt-2">
                      <p className="text-lg font-semibold tracking-tight">Hola, soy TED.</p>
                      <p className="mt-1.5 text-sm leading-6 text-zinc-400">
                        Pregúntame sobre los servicios, la experiencia y las capacidades de ISC.
                      </p>
                      <div className="mt-5 flex flex-col gap-2">
                        {SUGGESTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => void send(s)}
                            className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left text-sm text-zinc-300 transition hover:border-red-500/40 hover:bg-white/[0.06] hover:text-white"
                          >
                            {s}
                          </button>
                        ))}
                        {!leadSent && (
                          <button type="button" onClick={() => setView("lead")} className="rounded-xl border border-white/10 px-3.5 py-2.5 text-left text-sm text-zinc-400 transition hover:border-red-500/40 hover:text-white">
                            Quiero que un consultor me contacte
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {messages.map((m, i) =>
                    m.role === "user" ? (
                      <div key={i} className="flex justify-end">
                        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-red-600 px-3.5 py-2 text-sm leading-6 text-white">
                          {m.content}
                        </p>
                      </div>
                    ) : (
                      <div key={i} className="flex gap-2.5">
                        <TedMark small />
                        <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm leading-6 text-zinc-200">
                          <Markdown text={m.content} />
                        </div>
                      </div>
                    ),
                  )}

                  {loading && (
                    <div className="flex gap-2.5" aria-label="TED está escribiendo">
                      <TedMark small />
                      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-3.5 py-3">
                        {[0, 0.15, 0.3].map((d) => (
                          <motion.span
                            key={d}
                            className="h-1.5 w-1.5 rounded-full bg-zinc-400"
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {error && (
                    <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200">
                      {error}
                    </div>
                  )}

                  {assistantReplies >= 2 && !leadSent && !loading && (
                    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-red-500/10 to-transparent p-3.5 text-sm">
                      <p className="text-zinc-200">¿Te gustaría que un consultor de ISC te contacte?</p>
                      <button type="button" onClick={() => setView("lead")} className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-black transition hover:bg-zinc-200">
                        Dejar mis datos
                      </button>
                    </div>
                  )}
                </div>

                <form
                  className="border-t border-white/10 p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void send();
                  }}
                >
                  <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1.5 focus-within:border-white/25">
                    <label htmlFor="ted-input" className="sr-only">Escribe tu pregunta para TED</label>
                    <textarea
                      id="ted-input"
                      ref={inputRef}
                      rows={1}
                      value={input}
                      maxLength={MAX_LEN}
                      onChange={(e) => {
                        setInput(e.target.value);
                        e.target.style.height = "auto";
                        e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                      }}
                      onKeyDown={onKeyDown}
                      placeholder="Escribe tu pregunta…"
                      className="max-h-[120px] min-h-[36px] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white outline-none placeholder:text-zinc-500"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      aria-label="Enviar"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowUp size={16} />}
                    </button>
                  </div>
                  <p className="mt-2 px-1 text-[0.68rem] leading-4 text-zinc-500">
                    TED puede cometer errores; valida la información importante con el equipo de ISC.
                  </p>
                </form>
              </>
            )}

            {view === "lead" && (
              <LeadForm
                offline={status === "offline"}
                interest={interest}
                onCancel={() => setView("chat")}
                onDone={() => {
                  setLeadSent(true);
                  setView("thanks");
                }}
              />
            )}

            {view === "thanks" && (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <Check size={22} />
                </span>
                <p className="mt-4 text-lg font-semibold">¡Gracias! Recibimos tus datos.</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">Un consultor de ISC se pondrá en contacto contigo muy pronto.</p>
                <button type="button" onClick={() => setView("chat")} className="mt-6 rounded-full border border-white/15 px-4 py-2 text-sm transition hover:bg-white/5">
                  Volver a la conversación
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invitación */}
      <AnimatePresence>
        {nudge && !open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="fixed bottom-24 right-6 z-[60] hidden max-w-[260px] rounded-2xl border border-white/10 bg-[#0a0f1f] p-3.5 pr-8 text-sm text-zinc-300 shadow-xl shadow-black/50 sm:block"
          >
            <button type="button" aria-label="Cerrar invitación" onClick={() => { setNudge(false); storage("ted-nudge", "1"); }} className="absolute right-2 top-2 rounded p-1 text-zinc-500 hover:text-white">
              <X size={14} />
            </button>
            <button type="button" className="text-left" onClick={openPanel}>
              <span className="font-medium text-white">¿Tienes un reto en mente?</span>{" "}
              Pregúntale a TED, el asistente de ISC.
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Burbuja */}
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-label={open ? "Cerrar chat con TED" : "Abrir chat con TED"}
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-[61] h-14 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-black shadow-lg shadow-black/40 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-zinc-100 ${open ? "hidden sm:flex" : "flex"}`}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span className={open ? "sr-only" : ""}>Pregúntale a TED</span>
        {!open && <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
      </button>
    </>
  );
}

function TedMark({ small }: { small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 font-semibold tracking-tight text-white ${
        small ? "mt-0.5 h-7 w-7 text-[0.6rem]" : "h-9 w-9 text-xs"
      }`}
    >
      TED
    </span>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} className="rounded-lg p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white">
      {children}
    </button>
  );
}

function LeadForm({ offline, interest, onCancel, onDone }: { offline: boolean; interest: string; onCancel: () => void; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", interest, consent: false, website: "" });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mailto, setMailto] = useState<string | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.name.trim().length < 2) return setError("Escribe tu nombre.");
    if (!form.email.trim() && !form.phone.trim()) return setError("Déjanos un correo o un teléfono para contactarte.");
    if (!form.consent) return setError("Necesitamos tu autorización para contactarte.");
    setSending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: offline ? "widget-offline" : "widget", page_url: window.location.href }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) return onDone();
      if (res.status === 503 || res.status >= 500) throw new Error("fallback");
      setError(data?.error || "No pudimos enviar tus datos. Intenta de nuevo.");
    } catch {
      const body = [`Nombre: ${form.name}`, form.email && `Correo: ${form.email}`, form.phone && `Teléfono: ${form.phone}`, form.company && `Empresa: ${form.company}`, form.interest && `Interés: ${form.interest}`]
        .filter(Boolean)
        .join("\n");
      setMailto(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Contacto desde el sitio de ISC")}&body=${encodeURIComponent(body)}`);
      setError("No pudimos registrar tus datos automáticamente.");
    } finally {
      setSending(false);
    }
  };

  const field = "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/30";

  return (
    <form onSubmit={submit} className="ted-scroll flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-5" noValidate>
      <div>
        <p className="text-lg font-semibold tracking-tight">Hablemos</p>
        <p className="mt-1 text-sm leading-6 text-zinc-400">Déjanos tus datos y un consultor de ISC te contactará.</p>
      </div>
      <label className="text-xs text-zinc-400">
        Nombre <span className="text-red-400">*</span>
        <input className={`${field} mt-1`} value={form.name} onChange={set("name")} autoComplete="name" maxLength={120} required />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs text-zinc-400">
          Correo
          <input className={`${field} mt-1`} type="email" value={form.email} onChange={set("email")} autoComplete="email" maxLength={160} />
        </label>
        <label className="text-xs text-zinc-400">
          Teléfono
          <input className={`${field} mt-1`} type="tel" value={form.phone} onChange={set("phone")} autoComplete="tel" maxLength={40} />
        </label>
      </div>
      <p className="-mt-1.5 text-[0.7rem] text-zinc-500">Correo o teléfono, al menos uno.</p>
      <label className="text-xs text-zinc-400">
        Empresa
        <input className={`${field} mt-1`} value={form.company} onChange={set("company")} autoComplete="organization" maxLength={160} />
      </label>
      <label className="text-xs text-zinc-400">
        ¿En qué te podemos ayudar?
        <textarea className={`${field} mt-1 min-h-[72px] resize-y`} value={form.interest} onChange={set("interest")} maxLength={2000} />
      </label>
      {/* Honeypot: invisible para personas */}
      <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />
      <label className="flex items-start gap-2 text-xs leading-5 text-zinc-400">
        <input type="checkbox" checked={form.consent} onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))} className="mt-0.5 accent-red-500" />
        Autorizo a Intelligence Software Consulting a usar estos datos únicamente para contactarme sobre mi solicitud.
      </label>

      {error && (
        <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
          {mailto && (
            <a href={mailto} className="mt-1 block font-medium text-white underline underline-offset-2">
              Envíanos tus datos por correo a {CONTACT_EMAIL}
            </a>
          )}
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="rounded-full border border-white/15 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5">
          Volver
        </button>
        <button type="submit" disabled={sending} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50">
          {sending && <Loader2 size={15} className="animate-spin" />}
          Enviar datos
        </button>
      </div>
    </form>
  );
}
