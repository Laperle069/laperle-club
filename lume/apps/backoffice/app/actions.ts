"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiRequestError } from "@/lib/api";

/** Formular-Aktionen. Fehler kommen als ?fehler=… zurück auf die Seite. */

const str = (form: FormData, key: string) => {
  const v = form.get(key);
  return typeof v === "string" && v.trim() !== "" ? v.trim() : undefined;
};

const euroToCents = (value: string | undefined) =>
  Math.round(Number((value ?? "0").replace(",", ".")) * 100);

function fail(path: string, err: unknown): never {
  // Weiterleitungen (z. B. zur Anmeldung) und echte Fehler unverändert durchreichen
  if (!(err instanceof ApiRequestError)) throw err;
  const message = err.message;
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}fehler=${encodeURIComponent(message)}`);
}

export async function createService(form: FormData) {
  try {
    await api("/services", {
      method: "POST",
      body: {
        name: str(form, "name"),
        category: str(form, "category"),
        durationMin: Number(str(form, "durationMin")),
        bufferAfterMin: Number(str(form, "bufferAfterMin") ?? 0),
        priceCents: euroToCents(str(form, "price")),
        onlineBookable: form.get("onlineBookable") === "on",
      },
    });
  } catch (err) {
    fail("/leistungen", err);
  }
  revalidatePath("/leistungen");
  redirect("/leistungen?ok=1");
}

export async function toggleService(form: FormData) {
  try {
    await api(`/services/${str(form, "id")}`, { method: "PATCH", body: { active: form.get("active") === "true" } });
  } catch (err) {
    fail("/leistungen", err);
  }
  revalidatePath("/leistungen");
}

export async function createStaff(form: FormData) {
  const days = form.getAll("weekday").map(Number);
  const start = str(form, "start") ?? "09:00";
  const end = str(form, "end") ?? "18:00";
  try {
    await api("/staff", {
      method: "POST",
      body: {
        displayName: str(form, "displayName"),
        email: str(form, "email"),
        color: str(form, "color"),
        serviceIds: form.getAll("serviceId").map(String),
        workingHours: days.map((weekday) => ({ weekday, start, end })),
      },
    });
  } catch (err) {
    fail("/mitarbeiter", err);
  }
  revalidatePath("/mitarbeiter");
  redirect("/mitarbeiter?ok=1");
}

export async function createCustomer(form: FormData) {
  try {
    await api("/customers", {
      method: "POST",
      body: {
        firstName: str(form, "firstName"),
        lastName: str(form, "lastName"),
        email: str(form, "email"),
        phone: str(form, "phone"),
        notes: str(form, "notes"),
        marketingConsent: form.get("marketingConsent") === "on",
      },
    });
  } catch (err) {
    fail("/kunden", err);
  }
  revalidatePath("/kunden");
  redirect("/kunden?ok=1");
}

export async function bookAppointment(form: FormData) {
  const date = str(form, "date") ?? "";
  const back = `/termine/neu?serviceId=${str(form, "serviceId") ?? ""}&datum=${date}`;
  const customerId = str(form, "customerId");
  try {
    await api("/appointments", {
      method: "POST",
      body: {
        serviceId: str(form, "serviceId"),
        staffId: str(form, "staffId"),
        startsAt: str(form, "startsAt"),
        source: "backoffice",
        notes: str(form, "notes"),
        ...(customerId
          ? { customerId }
          : {
              customer: {
                firstName: str(form, "firstName"),
                lastName: str(form, "lastName"),
                email: str(form, "email"),
                phone: str(form, "phone"),
              },
            }),
      },
    });
  } catch (err) {
    fail(back, err);
  }
  revalidatePath("/kalender");
  redirect(`/kalender?datum=${date}&ok=1`);
}

export async function setAppointmentStatus(form: FormData) {
  const id = str(form, "id");
  const status = str(form, "status");
  const date = str(form, "date") ?? "";
  try {
    if (status === "cancelled") await api(`/appointments/${id}/cancel`, { method: "POST" });
    else await api(`/appointments/${id}`, { method: "PATCH", body: { status } });
  } catch (err) {
    fail(`/kalender?datum=${date}`, err);
  }
  revalidatePath("/kalender");
  revalidatePath("/");
}

export async function toggleModule(form: FormData) {
  try {
    await api(`/modules/${str(form, "key")}`, { method: "PUT", body: { enabled: form.get("enabled") === "true" } });
  } catch (err) {
    fail("/einstellungen", err);
  }
  revalidatePath("/einstellungen");
}
