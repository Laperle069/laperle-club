"use server";

import type { ApiKeyCreatedDto, LoginResultDto } from "@lume/api/types";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiRequestError, publicApi, SESSION_COOKIE } from "@/lib/api";

const str = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
};

export interface FormState {
  error?: string;
  ok?: string;
  key?: string;
  /** Eingabe nach Fehler wieder anzeigen (React leert Formulare nach dem Absenden) */
  email?: string;
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  let result: LoginResultDto;
  try {
    result = await publicApi<LoginResultDto>("/auth/login", {
      method: "POST",
      body: { email: str(form, "email"), password: form.get("password"), studioSlug: str(form, "studio") },
    });
  } catch (err) {
    return {
      error: err instanceof ApiRequestError ? err.message : "Anmeldung fehlgeschlagen",
      email: str(form, "email"),
    };
  }
  (await cookies()).set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(result.expiresAt),
  });
  redirect("/");
}

export async function logout() {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // Auch wenn die API nicht antwortet: lokal abmelden
  }
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

export async function changePassword(_prev: FormState, form: FormData): Promise<FormState> {
  if (form.get("newPassword") !== form.get("repeat")) return { error: "Die neuen Passwörter stimmen nicht überein" };
  try {
    await api("/auth/password", {
      method: "POST",
      body: { currentPassword: form.get("currentPassword"), newPassword: form.get("newPassword") },
    });
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.message };
    throw err;
  }
  return { ok: "Passwort geändert. Andere Geräte wurden abgemeldet." };
}

export async function addTeamMember(_prev: FormState, form: FormData): Promise<FormState> {
  try {
    await api("/team", {
      method: "POST",
      body: { email: str(form, "email"), name: str(form, "name"), role: str(form, "role"), password: form.get("password") },
    });
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.message };
    throw err;
  }
  revalidatePath("/team");
  return { ok: "Hinzugefügt. Gib der Person E-Mail und Startpasswort persönlich weiter." };
}

export async function changeTeamRole(form: FormData) {
  try {
    await api(`/team/${str(form, "userId")}`, { method: "PATCH", body: { role: str(form, "role") } });
  } catch (err) {
    if (!(err instanceof ApiRequestError)) throw err;
    redirect(`/team?fehler=${encodeURIComponent(err.message)}`);
  }
  revalidatePath("/team");
}

export async function removeTeamMember(form: FormData) {
  try {
    await api(`/team/${str(form, "userId")}`, { method: "DELETE" });
  } catch (err) {
    if (!(err instanceof ApiRequestError)) throw err;
    redirect(`/team?fehler=${encodeURIComponent(err.message)}`);
  }
  revalidatePath("/team");
}

export async function createApiKey(_prev: FormState, form: FormData): Promise<FormState> {
  let created: ApiKeyCreatedDto;
  try {
    created = await api<ApiKeyCreatedDto>("/api-keys", {
      method: "POST",
      body: { name: str(form, "name"), role: str(form, "role") },
    });
  } catch (err) {
    if (err instanceof ApiRequestError) return { error: err.message };
    throw err;
  }
  revalidatePath("/schluessel");
  // Der Schlüssel geht nur in diese eine Antwort, nicht in die Adresse oder ein Cookie
  return { key: created.key, ok: created.name };
}

export async function revokeApiKey(form: FormData) {
  try {
    await api(`/api-keys/${str(form, "id")}`, { method: "DELETE" });
  } catch (err) {
    if (!(err instanceof ApiRequestError)) throw err;
    redirect(`/schluessel?fehler=${encodeURIComponent(err.message)}`);
  }
  revalidatePath("/schluessel");
}
