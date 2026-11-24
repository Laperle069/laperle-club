"use client";

import { useActionState } from "react";
import { login, type FormState } from "@/app/auth-actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="stack">
      {state.error ? <p className="notice error" role="alert">{state.error}</p> : null}
      <label>
        E-Mail
        <input name="email" type="email" autoComplete="username" required defaultValue={state.email} key={state.email} />
      </label>
      <label>
        Passwort
        <input name="password" type="password" autoComplete="current-password" required autoFocus={Boolean(state.error)} />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "Einen Moment …" : "Anmelden"}
      </button>
    </form>
  );
}
