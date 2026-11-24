import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/** Tokens (API-Schlüssel, Sitzungen) werden nur als SHA-256-Hash gespeichert. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Zufälliges Token mit erkennbarem Präfix, z. B. "lume_live_…" oder "lume_sess_…". */
export function generateToken(prefix: string): string {
  return `${prefix}_${randomBytes(32).toString("base64url")}`;
}

const SCRYPT = { N: 32768, r: 8, p: 1, keyLen: 64 };

function scryptAsync(password: string, salt: Buffer, keyLen: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) =>
    scrypt(password, salt, keyLen, options, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

/** Passwort-Hash mit scrypt (Format: scrypt$N$r$p$salt$hash). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt, SCRYPT.keyLen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
    maxmem: 128 * SCRYPT.N * SCRYPT.r * 2,
  });
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !n || !r || !p || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const N = Number(n);
  const R = Number(r);
  const key = await scryptAsync(password, Buffer.from(salt, "base64"), expected.length, {
    N,
    r: R,
    p: Number(p),
    maxmem: 128 * N * R * 2,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}
