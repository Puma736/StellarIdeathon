import { useMemo, useState } from "react";
import { DEFAULT_AMOUNT, DEFAULT_MESSAGE, MEMO, MEMO_MAX_BYTES } from "../../config.js";
import { defaultSobres, loadContacts, removeContact, upsertContact } from "../../lib/contacts.js";
import { byteLength, formatBs, truncateBytes } from "../../lib/format.js";
import { isValidSplit, splitEnvelopes } from "../../lib/split.js";
import { sendSplit } from "../../lib/stellar.js";
import { Icon } from "../../components/ui/Icon.jsx";
import { Contacto } from "./Contacto.jsx";
import { Sobres } from "./Sobres.jsx";
import { VistaPrevia } from "./VistaPrevia.jsx";
import { Comprobante } from "./Comprobante.jsx";

// El memo es `REPARTE <mensaje>`: al mensaje le quedan 28 - 8 bytes.
const MESSAGE_MAX_BYTES = MEMO_MAX_BYTES - MEMO.length - 1;

/** Pantalla Enviar (Madrid): a quién, monto, sobres, mensaje, vista previa y botón. */
export function Enviar({ ready, onGoWallet }) {
  const [contacts, setContacts] = useState(loadContacts);
  const [contactId, setContactId] = useState(() => loadContacts()[0].id);
  const contact = contacts.find((c) => c.id === contactId) || contacts[0];

  const [monto, setMonto] = useState(String(DEFAULT_AMOUNT));
  const [sobres, setSobres] = useState(() => contact?.sobres || defaultSobres());
  const [mensaje, setMensaje] = useState(DEFAULT_MESSAGE);

  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const split = useMemo(() => splitEnvelopes(monto, sobres), [monto, sobres]);
  const canSend = isValidSplit(split, sobres);
  const sending = status === "sending";

  function selectContact(id) {
    const c = contacts.find((x) => x.id === id);
    if (!c) return;
    setContactId(id);
    setSobres(c.sobres || defaultSobres());
  }

  function createContact(c) {
    setContacts(upsertContact(c));
    setContactId(c.id);
    setSobres(c.sobres || defaultSobres());
  }

  function dropContact(id) {
    const next = removeContact(id);
    setContacts(next);
    if (id === contactId) {
      setContactId(next[0].id);
      setSobres(next[0].sobres || defaultSobres());
    }
  }

  function onMensaje(e) {
    setMensaje(truncateBytes(e.target.value, MESSAGE_MAX_BYTES));
  }

  async function onSend() {
    if (!ready || !canSend || sending) return;
    setStatus("sending");
    setError(null);
    try {
      const { hash, createdAt } = await sendSplit({
        sobres: split.sobres,
        comision: split.comision,
        mensaje,
      });
      // El reparto que funcionó queda guardado en la libreta para el próximo mes.
      setContacts(upsertContact({ ...contact, sobres }));
      setResult({ hash, createdAt, split, mensaje, contacto: contact, sobresPct: sobres });
      setStatus("done");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setError(null);
    setResult(null);
    setMonto(String(DEFAULT_AMOUNT));
    setMensaje("");
  }

  if (status === "done" && result) {
    return <Comprobante result={result} onClose={reset} onGoWallet={onGoWallet} />;
  }

  return (
    <div className="flex flex-col w-full pb-6 md:pb-2">
      <section className="flex flex-col pt-space-xs mb-space-lg">
        <div className="flex items-center justify-between">
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Nuevo envío</h1>
          <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high lg:bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Desde Madrid
          </span>
        </div>
        <p className="font-body-sm text-body-sm text-outline mt-1">Reparte directo a los sobres del hogar</p>
      </section>

      <div className="flex flex-col space-y-space-lg md:grid md:grid-cols-5 md:gap-8 md:space-y-0 md:items-start">
      <div className="flex flex-col space-y-space-lg md:col-span-3">
      <Contacto
        contacts={contacts}
        contact={contact}
        disabled={sending}
        onSelect={selectContact}
        onCreate={createContact}
        onRemove={dropContact}
      />

      <section className="flex flex-col space-y-space-xs">
        <div className="flex items-center justify-between">
          <label htmlFor="envio-monto" className="font-label-md text-label-md text-on-surface-variant">
            Monto total
          </label>
          <span className="font-label-sm text-label-sm text-outline">Sin comisiones ocultas</span>
        </div>
        <div className="p-space-lg bg-surface-container-lowest rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center gap-2">
            <input
              id="envio-monto"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              disabled={sending}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0"
              className="bg-transparent text-right font-display-currency-mobile text-display-currency-mobile text-on-surface tracking-tight font-bold outline-none placeholder:text-outline focus:bg-surface-container-low rounded px-1"
              style={{ width: `${Math.max(2, String(monto).length) + 0.5}ch` }}
            />
            <span className="font-headline-md text-headline-md text-primary-container font-bold">USDp</span>
          </div>
          <span className="font-currency-reference text-currency-reference text-outline mt-1 font-medium">
            ≈ {formatBs(split.total)} Bs ref.
          </span>
        </div>
      </section>

      <Sobres sobres={sobres} split={split} disabled={sending} onChange={setSobres} />

      <section className="flex flex-col space-y-space-xs">
        <div className="flex items-center justify-between">
          <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="envio-mensaje">
            Mensaje
          </label>
          <span className="font-label-sm text-label-sm text-outline">
            {byteLength(mensaje)}/{MESSAGE_MAX_BYTES}
          </span>
        </div>
        <div className="p-space-md bg-surface-container-lowest rounded-xl shadow-sm flex items-center justify-between">
          <input
            id="envio-mensaje"
            type="text"
            disabled={sending}
            value={mensaje}
            onChange={onMensaje}
            placeholder="Nota para el hogar..."
            className="w-full bg-transparent font-body-lg text-body-lg text-on-surface outline-none placeholder:text-outline"
          />
          <Icon name="edit_note" size={20} className="text-outline" />
        </div>
        <p className="font-label-sm text-label-sm text-outline px-1">
          Viaja en el memo de la transacción como <code className="font-mono">{MEMO} {mensaje || "…"}</code>
        </p>
      </section>
      </div>

      <div className="flex flex-col space-y-space-lg md:col-span-2 md:sticky md:top-24">
      <VistaPrevia split={split} />

      <section className="flex flex-col space-y-space-sm pt-space-xs">
        {error && (
          <div className="p-space-md rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm flex items-start gap-2">
            <Icon name="error" size={18} />
            <span>{error}</span>
          </div>
        )}
        <button
          type="button"
          disabled={!ready || !canSend || sending}
          onClick={onSend}
          className="w-full h-14 bg-on-surface text-surface-container-lowest rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 active:bg-inverse-surface shadow-sm transition-transform active:scale-[0.99] focus:outline-none disabled:opacity-40 disabled:active:scale-100"
        >
          {sending ? (
            <>
              <Icon name="progress_activity" size={20} className="animate-spin" />
              <span>Firmando y enviando…</span>
            </>
          ) : (
            <>
              <Icon name="send" size={20} />
              <span>Enviar repartido</span>
            </>
          )}
        </button>
        <div className="flex items-center justify-center gap-1.5 px-space-md text-center">
          <Icon name="verified_user" size={16} className="text-primary" />
          <span className="font-body-sm text-body-sm text-outline">
            Una sola transacción en Stellar. La familia recibe el total.
          </span>
        </div>
      </section>
      </div>
      </div>
    </div>
  );
}
