import iscLogo from "./assets/images/isc-logo.png";
import { motion } from "framer-motion";
import TedWidget from "./components/ted/TedWidget";
import { openTed } from "./components/ted/openTed";
import {
  ArrowRight,
  BrainCircuit,
  Cloud,
  Database,
  Network,
  Sparkles,
} from "lucide-react";

const capabilities = [
  {
    title: "Estrategia de IA",
    description:
      "Definimos una visión clara, priorizamos oportunidades y construimos una hoja de ruta realista para convertir la IA en valor de negocio.",
    icon: BrainCircuit,
  },
  {
    title: "IA Agéntica",
    description:
      "Diseñamos agentes inteligentes capaces de ejecutar tareas, coordinar procesos y ampliar la capacidad de los equipos.",
    icon: Network,
  },
  {
    title: "Plataformas de Datos",
    description:
      "Construimos arquitecturas de datos modernas, gobernadas y preparadas para analítica avanzada e inteligencia artificial.",
    icon: Database,
  },
  {
    title: "Cloud y Modernización",
    description:
      "Modernizamos aplicaciones, infraestructura y operaciones para crear plataformas más ágiles, escalables y sostenibles.",
    icon: Cloud,
  },
];

function App() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-[#050816]/75 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <a href="#inicio" className="flex items-center">
            <img
              src={iscLogo}
              alt="Intelligence Software Consulting"
              className="h-10 w-auto object-contain"
            />
          </a>

          <div className="hidden items-center gap-8 text-sm text-zinc-400 lg:flex">
            <a className="transition hover:text-white" href="#por-que-isc">
              ¿Por qué ISC?
            </a>
            <a className="transition hover:text-white" href="#transformamos">
              Cómo Transformamos
            </a>
            <a className="transition hover:text-white" href="#capacidades">
              Capacidades
            </a>
            <a
              className="transition hover:text-white"
              href="https://ai.iscit.com.mx"
            >
              ISC AI
            </a>
            <a className="transition hover:text-white" href="#insights">
              Insights
            </a>
            <a className="transition hover:text-white" href="#hablemos">
              Hablemos
            </a>
          </div>

          <a
            href="https://ai.iscit.com.mx"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            Explorar ISC AI
            <ArrowRight size={16} />
          </a>
        </nav>
      </header>

      <section
        id="inicio"
        className="relative flex min-h-screen items-center overflow-hidden px-6 pt-20"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[30%] h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-red-500/10 blur-[160px]" />
          <div className="absolute bottom-[-160px] right-[-80px] h-[360px] w-[360px] rounded-full bg-blue-500/10 blur-[150px]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl py-24">
          <div className="max-w-6xl">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 text-sm font-semibold uppercase tracking-[0.35em] text-red-500"
            >
              Intelligence Software Consulting
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1 }}
              className="max-w-6xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl lg:text-[7rem]"
            >
              <span className="block">Human Life-Centric</span>
              <span className="mt-2 block text-zinc-300">
                Artificial Intelligence
              </span>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.8 }}
              className="my-10 h-px w-32 origin-left bg-gradient-to-r from-red-500 to-transparent"
            />

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="text-2xl font-medium text-zinc-500 md:text-3xl"
            >
              Transformación Digital
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.15 }}
              className="mt-8 max-w-2xl text-lg leading-8 text-zinc-400"
            >
              Convertimos estrategia, datos e inteligencia artificial en
              capacidades reales de negocio, crecimiento sostenible y mejores
              decisiones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.3 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <a
                href="#hablemos"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
              >
                Iniciar conversación
                <ArrowRight size={16} />
              </a>

              <a
                href="https://ai.iscit.com.mx"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Explorar ISC AI
                <ArrowRight size={16} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="por-que-isc"
        className="border-t border-white/5 px-6 py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">
              ¿Por qué ISC?
            </p>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              Tecnología con propósito.
              <span className="block text-zinc-500">
                Transformación con criterio.
              </span>
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {[
              [
                "Negocio primero",
                "Partimos de los objetivos, restricciones y oportunidades reales de cada organización.",
              ],
              [
                "Acompañamiento senior",
                "Trabajamos con experiencia ejecutiva, técnica y estratégica desde el diagnóstico hasta la implementación.",
              ],
              [
                "IA responsable",
                "Integramos ética, gobierno, seguridad y pensamiento crítico desde el diseño.",
              ],
              [
                "Capacidades sostenibles",
                "No dejamos proyectos aislados: transferimos conocimiento y fortalecemos a los equipos.",
              ],
            ].map(([title, description]) => (
              <article
                key={title}
                className="border-t border-white/10 pt-6"
              >
                <h3 className="text-xl font-medium">{title}</h3>
                <p className="mt-3 leading-7 text-zinc-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="transformamos"
        className="border-t border-white/5 bg-white/[0.02] px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.3em] text-red-500">
              Cómo transformamos
            </p>

            <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
              Una transformación no comienza con la tecnología.
            </h2>

            <p className="mt-6 text-lg leading-8 text-zinc-400">
              Comienza entendiendo el propósito, las personas, el negocio y las
              capacidades que deben evolucionar.
            </p>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
            {[
              "Entendemos",
              "Diseñamos",
              "Construimos",
              "Implementamos",
              "Transferimos conocimiento",
              "Evolucionamos",
            ].map((step, index) => (
              <div
                key={step}
                className="min-h-48 bg-[#080b18] p-8"
              >
                <span className="text-sm text-red-500">
                  0{index + 1}
                </span>
                <h3 className="mt-12 text-2xl font-medium">{step}</h3>
              </div>
            ))}
          </div>

          <a
            href="#"
            className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-white"
          >
            Conocer nuestra metodología
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section
        id="capacidades"
        className="border-t border-white/5 px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-red-500">
                Capacidades
              </p>

              <h2 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
                Capacidades que generan resultados.
              </h2>
            </div>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium text-white"
            >
              Explorar capacidades
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2">
            {capabilities.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="group rounded-3xl border border-white/10 bg-white/[0.025] p-8 transition hover:-translate-y-1 hover:bg-white/[0.045]"
              >
                <Icon className="text-red-500" size={28} />
                <h3 className="mt-14 text-2xl font-medium">{title}</h3>
                <p className="mt-4 max-w-xl leading-7 text-zinc-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="border-t border-white/5 bg-white/[0.02] px-6 py-28"
      >
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300">
              <Sparkles size={16} className="text-red-500" />
              Ecosistema ISC AI
            </div>

            <h2 className="mt-8 text-4xl font-semibold tracking-tight md:text-6xl">
              Conoce nuestros aceleradores de inteligencia artificial.
            </h2>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Soluciones diseñadas para acelerar investigación, automatización,
              arquitectura, calidad y nuevas experiencias digitales.
            </p>

            <a
              href="https://ai.iscit.com.mx"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Entrar a ISC AI
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {["TED", "IRIS", "QARA", "HAWK"].map((name) => (
              <div
                key={name}
                className="flex aspect-square items-end rounded-3xl border border-white/10 bg-[#080b18] p-6 text-2xl font-semibold"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="insights"
        className="border-t border-white/5 px-6 py-28"
      >
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.3em] text-red-500">
            Insights
          </p>

          <div className="mt-6 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Ideas para comprender y liderar la transformación.
            </h2>

            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-medium"
            >
              Explorar insights
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section
        id="hablemos"
        className="border-t border-white/5 px-6 py-32"
      >
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-red-500">
            Hablemos
          </p>

          <h2 className="mt-8 text-5xl font-semibold tracking-tight md:text-7xl">
            Transformemos juntos la siguiente etapa de tu organización.
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-zinc-400">
            Conversemos sobre el reto, la oportunidad o la capacidad que deseas
            construir.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openTed()}
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Conversar con TED
              <ArrowRight size={16} />
            </button>
            <a
              href="mailto:contacto@iscit.com.mx"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-7 py-3.5 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Escríbenos
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-zinc-500 md:flex-row">
          <p>Intelligence Software Consulting</p>
          <p>La tecnología es el medio, no el fin.</p>
        </div>
      </footer>

      <TedWidget />
    </main>
  );
}

export default App;