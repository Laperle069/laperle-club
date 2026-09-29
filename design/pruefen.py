#!/usr/bin/env python3
"""Freigabeprüfung für das Designsystem (Fassung 4).

    python3 design/pruefen.py

Prüft ohne Netzwerk und ohne Abhängigkeiten:
  1. tokens.json: Grammatik (Namen, Eindeutigkeit, Farbwerte, Aliase, Themen).
  2. Tokengleichheit: jeder Token (Farbe je Thema, Schatten je Thema, alle übrigen
     Familien, type.families als --font-<Schlüssel>) steht mit demselben Wert im CSS;
     die Kopie für data-theme="auto" (prefers-color-scheme: light) gleicht dem
     Perle-Satz, die Druckkopie dem Perle-Satz mit Papierweiß (lp-paper) für
     Grund und Flächen und Perle-Text auf der Mitgliedskarte (SPEC B.3 1e, E08, G.18).
  3. Vollständigkeit: jede var(--…) im CSS ist definiert.
  4. Kompatibilität: jede Klasse und ID aus Fassung 3 kommt in Fassung 4 vor (auch
     verkettete wie .btn.ghost), und jede --*-Variable, die eine Seite mit Designblock
     außerhalb des Blocks nutzt, ist definiert.
  5. Kein Grün: kein Farbwert im CSS oder in tokens.json liegt im Grünbereich.
  6. Kontrast: alle Paare aus kontrastpaare.json erreichen ihr Minimum in jedem Thema.
Rückgabewert 0 nur, wenn alles besteht.

Format von kontrastpaare.json: eine Liste von Paaren
  {"fg": Token oder #hex, "bg": Token oder #hex, "min": Zahl, "usage": "…"}
mit den optionalen Feldern
  "themen":        Liste der Themen, in denen das Paar vorkommt (Standard: alle).
  "bg_over":       Token oder #hex: deckender Grund unter einem durchscheinenden bg
                   (z. B. lp-hover über lp-surface); bg wird zuerst darüber gelegt.
  "fg_brightness", "bg_brightness":
                   Faktor k von filter:brightness(k) auf Vordergrund bzw. Grund
                   (Kanal × k, gekappt), z. B. 1.08 für den Hover der Primärfläche.
  "satz":          Thema, dessen Farbsatz in jedem Seitenthema gilt (Nacht-Inseln
                   deklarieren den dunklen Satz selbst: "satz": "dark").
  "info":          true = wird berechnet und gezählt, ist aber kein Kriterium.
  "id":            Verweis auf die Kontrasttabelle der Spezifikation (nur Anzeige).
"""
import json
import math
import re
import sys
from pathlib import Path

DESIGN = Path(__file__).resolve().parent
WURZEL = DESIGN.parent
F3 = DESIGN / "midnight-prive-fassung-3.css"
F4 = DESIGN / "laperle-designsystem.css"
TOKENS = DESIGN / "tokens.json"
PAARE = DESIGN / "kontrastpaare.json"
START, ENDE = "/* MP-DESIGN-START */", "/* MP-DESIGN-END */"
# Druck (SPEC B.3 1e, E08, G.18): diese Rollen tragen Papierweiß (lp-paper), die
# Mitgliedskarte trägt Perle-Text; alle übrigen Werte der Druckkopie = Perle-Satz.
DRUCK_PAPIER = ("lp-bg", "lp-surface", "lp-surface-raised", "lp-field", "lp-selected")
DRUCK_TEXT = {"lp-member-text": "lp-text", "lp-member-muted": "lp-text-muted"}
# Laufzeitvariablen, die Skripte am Element setzen (Bühnenstaub), und private Bauteilvariablen.
LAUFZEIT = {"--x", "--y", "--delay"}
NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$")
FARBFN = re.compile(r"^(rgba?|hsla?|oklch|oklab|lab|lch|color)\([0-9eE.,%/+\s-]+\)$|^(rgba?|hsla?|oklch|oklab|lab|lch)\([0-9a-z.,%/+\s-]+\)$", re.I)
HEX = re.compile(r"^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$")

fehler = []


def fail(bereich, text):
    fehler.append(f"[{bereich}] {text}")


def ohne_kommentare(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)


# --- Farbmathematik --------------------------------------------------------
def hex_rgb(h):
    h = h.lstrip("#")
    if len(h) in (3, 4):
        h = "".join(c * 2 for c in h)
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
    return r, g, b, a


def fn_rgb(v):
    m = re.match(r"rgba?\(([^)]*)\)", v.strip(), re.I)
    if not m:
        return None
    teile = [t for t in re.split(r"[\s,/]+", m.group(1).strip()) if t]
    if len(teile) < 3:
        return None
    wert = lambda t: float(t[:-1]) * 2.55 if t.endswith("%") else float(t)
    r, g, b = (wert(t) / 255 for t in teile[:3])
    a = teile[3] if len(teile) > 3 else "1"
    a = float(a[:-1]) / 100 if a.endswith("%") else float(a)
    return r, g, b, a


def farbe(v):
    v = v.strip()
    if HEX.match(v):
        return hex_rgb(v)
    return fn_rgb(v)


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def luminanz(rgb):
    r, g, b = rgb[:3]
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def ueber(fg, bg):
    a = fg[3]
    return tuple(fg[i] * a + bg[i] * (1 - a) for i in range(3)) + (1.0,)


def kontrast(fg, bg):
    bg = bg if bg[3] >= 1 else ueber(bg, (1, 1, 1, 1))
    fg = ueber(fg, bg) if fg[3] < 1 else fg
    l1, l2 = sorted((luminanz(fg), luminanz(bg)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


def oklch(rgb):
    r, g, b = (lin(c) for c in rgb[:3])
    l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
    m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
    s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
    l, m, s = (math.copysign(abs(x) ** (1 / 3), x) for x in (l, m, s))
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return L, math.hypot(A, B), math.degrees(math.atan2(B, A)) % 360


def gruen(rgb):
    """Grün = Farbton 100–170° in OKLCH bei spürbarer Buntheit."""
    _, c, h = oklch(rgb)
    return c > 0.035 and 100 <= h <= 170


# --- 1. tokens.json --------------------------------------------------------
def tokens_pruefen():
    if not TOKENS.exists():
        fail("tokens", "design/tokens.json fehlt")
        return {}, []
    t = json.loads(TOKENS.read_text("utf-8"))
    themen = [th["id"] for th in t["color"]["themes"]]
    if themen[:2] != ["dark", "light"]:
        fail("tokens", f"Themen müssen mit dark, light beginnen, sind {themen}")
    namen = {}
    for fam, inhalt in t.items():
        if fam in ("name", "version", "meta", "type") or not isinstance(inhalt, dict):
            continue
        for tok in inhalt.get("tokens", []):
            n = tok["name"]
            if not NAME.match(n):
                fail("tokens", f"ungültiger Name {n!r}")
            if n in namen:
                fail("tokens", f"doppelter Name {n!r} ({namen[n]} und {fam})")
            namen[n] = fam
            if not tok.get("usage"):
                fail("tokens", f"{n}: Verwendungshinweis fehlt")
    farben = {tok["name"]: tok["value"] for tok in t["color"]["tokens"]}
    aufgeloest = {}

    def aufloesen(name, thema, tiefe=0):
        if tiefe > 16 or name not in farben:
            return None
        v = farben[name]
        v = v if isinstance(v, str) else v.get(thema, v.get(themen[0]))
        if isinstance(v, str) and v.startswith("{") and v.endswith("}"):
            return aufloesen(v[1:-1], thema, tiefe + 1)
        return v

    for name, v in farben.items():
        werte = {th: v for th in themen} if isinstance(v, str) else v
        for th, w in werte.items():
            if th not in themen:
                fail("tokens", f"{name}: unbekanntes Thema {th}")
            if w.startswith("{"):
                if aufloesen(name, th) is None:
                    fail("tokens", f"{name}/{th}: Alias {w} löst nicht auf")
            elif not (HEX.match(w) or FARBFN.match(w)):
                fail("tokens", f"{name}/{th}: Farbwert {w!r} unzulässig")
        for th in themen:
            aufgeloest[(name, th)] = aufloesen(name, th)
    return aufgeloest, themen


# --- CSS-Hilfen --------------------------------------------------------------
def css_bloecke(css):
    """(Selektor, Deklarationen) für alle Regeln, @media-Schachtelung eingeebnet."""
    css = ohne_kommentare(css)
    ergebnis, stapel, puffer = [], [], ""
    for ch in css:
        if ch == "{":
            stapel.append(puffer.strip())
            puffer = ""
        elif ch == "}":
            if stapel:
                sel = stapel.pop()
                if puffer.strip():
                    ergebnis.append((sel, puffer.strip(), list(stapel)))
            puffer = ""
        else:
            puffer += ch
    return ergebnis


def selektor_namen(css):
    """Alle Klassen und IDs aus Selektoren, auch verkettete (.btn.ghost → .btn, .ghost).
    Attributselektoren sind vorher entfernt, @-Präludien und Keyframe-Stufen tragen keine."""
    namen = set()
    for sel in re.findall(r"([^{}]+)\{", ohne_kommentare(css)):
        if sel.strip().startswith("@"):
            continue
        sel = re.sub(r"\[[^\]]*\]", "", sel)
        namen.update(re.findall(r"([.#][A-Za-z_][\w-]*)", sel))
    return namen


def seiten():
    """Alle HTML-Seiten mit Designblock (wie design/einbetten.py): Startmarke als eigene Zeile."""
    treffer = []
    for pfad in sorted(WURZEL.rglob("*.html")):
        if ".git" in pfad.parts or pfad.is_relative_to(DESIGN):
            continue
        if any(z.strip() == START for z in pfad.read_text("utf-8").splitlines()):
            treffer.append(pfad)
    return treffer


def definierte_variablen(css):
    return set(re.findall(r"(--[A-Za-z0-9_-]+)\s*:", ohne_kommentare(css)))


def benutzte_variablen(text):
    return set(re.findall(r"var\(\s*(--[A-Za-z0-9_-]+)", text))


def seitenrest(html):
    zeilen = html.splitlines()
    try:
        a = zeilen.index(START)
        b = zeilen.index(ENDE)
    except ValueError:
        return html
    return "\n".join(zeilen[:a] + zeilen[b + 1:])


# --- 2. Tokengleichheit -------------------------------------------------------
def themen_saetze(css):
    """Deklarationen der Themenblöcke: dunkel (:root, [data-theme="dark"]), hell
    ([data-theme="light"]), auto (in prefers-color-scheme: light) und druck (in @media print)."""
    saetze = {"dunkel": {}, "hell": {}, "auto": {}, "druck": {}}
    for sel, dekl, umgebung in css_bloecke(css):
        teile = {s.strip() for s in sel.split(",")}
        kontext = " ".join(" ".join(umgebung).split())
        if not umgebung:
            art = ("dunkel" if teile & {":root", '[data-theme="dark"]', ':root[data-theme="dark"]'}
                   else "hell" if any('data-theme="light"' in s for s in teile) else None)
        elif re.fullmatch(r"@media \(prefers-color-scheme: ?light\)", kontext) and '[data-theme="auto"]' in teile:
            art = "auto"
        elif kontext == "@media print" and ":root" in teile:
            art = "druck"
        else:
            art = None
        if art:
            for n, v in re.findall(r"(--(?:lp|mp|font)-[A-Za-z0-9_-]+|--_select-arrow)\s*:\s*([^;]+)", dekl):
                saetze[art].setdefault(n, " ".join(v.split()))
    return saetze


def aufloesen_css(v, *saetze):
    """var(--x) über die genannten Sätze auflösen (mehrstufig)."""
    for _ in range(8):
        m = re.fullmatch(r"var\(\s*(--[A-Za-z0-9_-]+)\s*\)", v or "")
        if not m:
            break
        v = next((s[m.group(1)] for s in saetze if m.group(1) in s), None)
    return v


def gleich(a, b):
    if a is None or b is None:
        return False
    if " ".join(a.split()) == " ".join(b.split()):
        return True
    fa, fb = farbe(a), farbe(b)
    return bool(fa and fb) and all(abs(x - y) <= 0.003 for x, y in zip(fa, fb))


def token_gleichheit(css, aufgeloest, themen):
    s = themen_saetze(css)
    dunkel, hell = s["dunkel"], s["hell"]

    def css_wert(name, th):
        ziel = [hell, dunkel] if th == "light" else [dunkel]
        roh = next((z["--" + name] for z in ziel if "--" + name in z), None)
        return roh, aufloesen_css(roh, *ziel)

    # Farben je Thema
    for (name, th), wert in aufgeloest.items():
        if wert is None or th not in ("dark", "light"):
            continue
        roh, v = css_wert(name, th)
        if roh is None:
            fail("gleichheit", f"--{name} ({th}) nicht im CSS definiert")
        elif not gleich(v, wert):
            fail("gleichheit", f"--{name} ({th}): CSS {roh} → {v} ≠ tokens.json {wert}")
    # Alle übrigen Familien (Schatten je Thema) und type.families
    if TOKENS.exists():
        t = json.loads(TOKENS.read_text("utf-8"))
        for fam, inhalt in t.items():
            if fam in ("name", "version", "meta", "type", "color") or not isinstance(inhalt, dict):
                continue
            for tok in inhalt.get("tokens", []):
                werte = tok["value"] if isinstance(tok["value"], dict) else {"dark": tok["value"]}
                for th, wert in werte.items():
                    roh, v = css_wert(tok["name"], th)
                    if roh is None:
                        fail("gleichheit", f"--{tok['name']} ({fam}, {th}) nicht im CSS definiert")
                    elif not gleich(v, wert):
                        fail("gleichheit", f"--{tok['name']} ({fam}, {th}): CSS {roh} → {v} ≠ tokens.json {wert}")
        for schluessel, wert in t.get("type", {}).get("families", {}).items():
            if not gleich(dunkel.get("--font-" + schluessel), wert):
                fail("gleichheit", f"--font-{schluessel}: CSS {dunkel.get('--font-' + schluessel)} ≠ tokens.json {wert}")
    # Kopie für data-theme="auto" = Perle-Satz (1c), vollständig und wertgleich
    for n in sorted(set(hell) | set(s["auto"])):
        if not gleich(s["auto"].get(n), hell.get(n)):
            fail("gleichheit", f"auto-Kopie {n}: {s['auto'].get(n)} ≠ Perle {hell.get(n)}")
    # Druckkopie = Perle-Satz mit Papierweiß und Perle-Text auf der Mitgliedskarte
    soll = dict(hell)
    papier = aufgeloest.get(("lp-paper", "light"))
    for n in DRUCK_PAPIER:
        soll["--" + n] = papier
    for n, quelle in DRUCK_TEXT.items():
        soll["--" + n] = aufgeloest.get((quelle, "light"))
    for n in sorted(set(soll) | set(s["druck"])):
        ist = aufloesen_css(s["druck"].get(n), s["druck"], dunkel)
        if not (gleich(s["druck"].get(n), soll.get(n)) or gleich(ist, aufloesen_css(soll.get(n), hell, dunkel))):
            fail("gleichheit", f"Druckkopie {n}: {s['druck'].get(n)} ≠ Soll {soll.get(n)}")


# --- Ablauf -------------------------------------------------------------------
def main():
    if not F4.exists():
        sys.exit("design/laperle-designsystem.css fehlt")
    f3 = F3.read_text("utf-8")
    f4 = F4.read_text("utf-8")

    aufgeloest, themen = tokens_pruefen()
    token_gleichheit(f4, aufgeloest, themen)

    definiert = definierte_variablen(f4)
    for v in sorted(benutzte_variablen(ohne_kommentare(f4)) - definiert - LAUFZEIT):
        if not v.startswith("--_"):
            fail("vollständig", f"{v} wird benutzt, aber nicht definiert")

    fehlend = sorted(selektor_namen(f3) - selektor_namen(f4))
    for n in fehlend:
        fail("kompatibel", f"Selektor {n} aus Fassung 3 fehlt in Fassung 4")
    liste = seiten()
    if not liste:
        fail("kompatibel", "keine Seite mit Designblock gefunden")
    for pfad in liste:
        rest = seitenrest(pfad.read_text("utf-8"))
        for v in sorted(benutzte_variablen(rest) - definiert - LAUFZEIT):
            fail("kompatibel", f"{pfad.relative_to(WURZEL)} nutzt {v}, Fassung 4 definiert es nicht")

    literale = set(re.findall(r"#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)", ohne_kommentare(f4)))
    if TOKENS.exists():
        literale |= {w for w in re.findall(r'"(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))"', TOKENS.read_text("utf-8"))}
    for lit in sorted(literale):
        rgb = farbe(lit)
        if rgb and gruen(rgb):
            L, c, h = oklch(rgb)
            fail("kein Grün", f"{lit} (OKLCH h {h:.0f}°, C {c:.3f})")

    geprueft = info = 0
    if PAARE.exists():
        def rgb_von(ausdruck, thema):
            wert = ausdruck if ausdruck.startswith("#") else aufgeloest.get((ausdruck, thema))
            return farbe(wert) if wert else None

        def hell(rgb, k):
            return tuple(min(1.0, c * k) for c in rgb[:3]) + (rgb[3],)

        for p in json.loads(PAARE.read_text("utf-8")):
            name = f"{p.get('id', '')} {p['fg']} auf {p['bg']}".strip()
            for th in p.get("themen", themen):
                satz = p.get("satz", th)
                fg, bg = rgb_von(p["fg"], satz), rgb_von(p["bg"], satz)
                unten = rgb_von(p["bg_over"], satz) if "bg_over" in p else None
                if satz not in themen or not fg or not bg or ("bg_over" in p and (not unten or unten[3] < 1)):
                    fail("kontrast", f"{name} ({th}): Wert fehlt")
                    continue
                if unten:
                    bg = ueber(bg, unten)
                if "fg_brightness" in p:
                    fg = hell(fg, p["fg_brightness"])
                if "bg_brightness" in p:
                    bg = hell(bg, p["bg_brightness"])
                r = kontrast(fg, bg)
                if p.get("info"):
                    info += 1
                    continue
                geprueft += 1
                if r + 1e-9 < p["min"]:
                    fail("kontrast", f"{name} ({th}): {r:.2f} < {p['min']}")
    else:
        fail("kontrast", "design/kontrastpaare.json fehlt")

    print(f"Fassung 3: {len(selektor_namen(f3))} Klassen/IDs · Fassung 4: {len(selektor_namen(f4))}")
    print(f"Farbtoken geprüft: {len({n for n, _ in aufgeloest})} · Kontrastpaare geprüft: {geprueft}"
          f" (+ {info} Info ohne Soll)")
    if fehler:
        print(f"\n{len(fehler)} Fehler:")
        for f in fehler:
            print(" ", f)
        sys.exit(1)
    print("OK: alle Prüfungen bestanden.")


if __name__ == "__main__":
    main()
