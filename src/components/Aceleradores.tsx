// Tarjetas de los aceleradores de IA que ya existen en ISC AI: TED, QARA y MarIA.
import { ArrowUpRight, MessageCircle, ScanSearch } from "lucide-react";
import tedIcon from "../assets/images/aceleradores/ted.png";
import mariaPhoto from "../assets/images/aceleradores/maria.webp";
import { openTed } from "./ted/openTed";

const PORTAL = "https://ai.iscit.com.mx";

const card =
  "group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#080b18] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-white/20";

export default function Aceleradores() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:grid-rows-2">
      {/* TED */}
      <button type="button" onClick={() => openTed()} className={`${card} min-h-[240px]`}>
        <img src={tedIcon} alt="" className="h-12 w-12 rounded-2xl" width={48} height={48} />
        <div className="mt-auto pt-10">
          <p className="text-2xl font-semibold">TED</p>
          <p className="mt-1 text-sm text-red-400">Asistente conversacional</p>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Responde sobre servicios, experiencia y capacidades de ISC.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
            <MessageCircle size={15} />
            Conversar ahora
          </span>
        </div>
      </button>

      {/* MarIA: ocupa la columna derecha completa */}
      <a href={PORTAL} className={`${card} min-h-[420px] p-0 sm:row-span-2`}>
        <img
          src={mariaPhoto}
          alt="MarIA, avatar digital de ISC"
          className="absolute inset-0 h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b18] via-[#080b18]/40 to-transparent" />
        <div className="relative mt-auto p-6">
          <p className="text-2xl font-semibold">MarIA</p>
          <p className="mt-1 text-sm text-red-400">Avatar digital asistente</p>
          <p className="mt-3 text-sm leading-6 text-zinc-300">
            Conversación por voz con un avatar 3D que atiende y orienta a tus usuarios.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
            Ver en ISC AI
            <ArrowUpRight size={15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>

      {/* QARA */}
      <a href={PORTAL} className={`${card} min-h-[240px]`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white">
          <ScanSearch size={24} />
        </span>
        <div className="mt-auto pt-10">
          <p className="text-2xl font-semibold">QARA</p>
          <p className="mt-1 text-sm text-red-400">Testing con IA</p>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Automatiza el aseguramiento de calidad: genera, ejecuta y documenta pruebas.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
            Ver en ISC AI
            <ArrowUpRight size={15} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </a>
    </div>
  );
}
