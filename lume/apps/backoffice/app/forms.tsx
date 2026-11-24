"use client";

import { useActionState, useState } from "react";
import { addTeamMember, changePassword, createApiKey, type FormState } from "@/app/auth-actions";

const ROLE_OPTIONS = [
  { value: "staff", label: "Mitarbeiter – sieht Kalender und Kunden" },
  { value: "reception", label: "Empfang – bucht und verwaltet Termine und Kunden" },
  { value: "manager", label: "Leitung – zusätzlich Leistungen und Mitarbeiter" },
  { value: "owner", label: "Inhaber – alles, auch Team, Schlüssel und Bausteine" },
];

function Status({ state }: { state: FormState }) {
  if (state.error) return <p className="notice error" role="alert">{state.error}</p>;
  if (state.ok && !state.key) return <p className="notice ok">{state.ok}</p>;
  return null;
}

export function TeamForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addTeamMember, {});
  return (
    <form action={action} className="card" key={state.ok}>
      <h2>Person hinzufügen</h2>
      <Status state={state} />
      <div className="form-row">
        <label>
          Name
          <input name="name" required />
        </label>
        <label>
          E-Mail
          <input name="email" type="email" required />
        </label>
        <label>
          Startpasswort (mind. 10 Zeichen)
          <input name="password" type="text" minLength={10} required autoComplete="off" />
        </label>
      </div>
      <label>
        Rolle
        <select name="role" defaultValue="staff">
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={pending}>
        Hinzufügen
      </button>
    </form>
  );
}

export function ApiKeyForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createApiKey, {});
  const [copied, setCopied] = useState(false);
  return (
    <>
      {state.key ? (
        <div className="card highlight" role="status">
          <h2>Neuer Schlüssel „{state.ok}“</h2>
          <p>
            <strong>Jetzt kopieren und sicher aufbewahren.</strong> Er wird nur dieses eine Mal angezeigt.
          </p>
          <code className="secret">{state.key}</code>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              void navigator.clipboard.writeText(state.key ?? "").then(() => setCopied(true));
            }}
          >
            {copied ? "Kopiert ✓" : "Kopieren"}
          </button>
        </div>
      ) : null}
      <form action={action} className="card">
        <h2>Neuen Schlüssel anlegen</h2>
        <p className="muted small">
          Für Programme und KI-Agenten, z. B. den Lumé-MCP-Server, Zapier oder eine eigene Website. Gib jedem
          Programm einen eigenen Schlüssel mit so wenig Rechten wie nötig.
        </p>
        <Status state={state} />
        <div className="form-row">
          <label>
            Wofür?
            <input name="name" placeholder="z. B. Claude-Assistent" required maxLength={80} />
          </label>
          <label>
            Darf
            <select name="role" defaultValue="reception">
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={pending}>
          Schlüssel anlegen
        </button>
      </form>
    </>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePassword, {});
  return (
    <form action={action} className="card" key={state.ok}>
      <h2>Passwort ändern</h2>
      <Status state={state} />
      <div className="form-row">
        <label>
          Aktuelles Passwort
          <input name="currentPassword" type="password" autoComplete="current-password" required />
        </label>
        <label>
          Neues Passwort (mind. 10 Zeichen)
          <input name="newPassword" type="password" autoComplete="new-password" minLength={10} required />
        </label>
        <label>
          Neues Passwort wiederholen
          <input name="repeat" type="password" autoComplete="new-password" minLength={10} required />
        </label>
      </div>
      <button type="submit" disabled={pending}>
        Ändern
      </button>
    </form>
  );
}
