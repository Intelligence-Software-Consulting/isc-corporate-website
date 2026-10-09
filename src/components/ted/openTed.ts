export const OPEN_EVENT = "ted:open";

/** Abre el widget de TED desde cualquier parte del sitio (p. ej. un botón "Conversar con TED"). */
export function openTed(prompt?: string) {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { prompt } }));
}
