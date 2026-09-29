#!/usr/bin/env python3
"""Bettet das gemeinsame Designsystem in die HTML-Seiten ein.

Der Block steht in jeder Seite zwischen den Zeilen
    /* MP-DESIGN-START */
    /* MP-DESIGN-END */
und muss in allen Seiten byte-identisch sein.

Aufrufe (aus dem Repository-Wurzelverzeichnis):
    python3 design/einbetten.py pruefen
        Prüft, dass alle Seiten denselben Block tragen, und nennt die
        Quelldatei in design/, der er entspricht. Ändert nichts.
    python3 design/einbetten.py pruefen design/laperle-designsystem.css
        Prüft zusätzlich, dass alle Seiten genau diese Quelle tragen.
    python3 design/einbetten.py schreiben design/laperle-designsystem.css
        Ersetzt den Block in allen Seiten durch die Quelle.

Nur Standardbibliothek. Kein Upload, keine Netzwerkzugriffe.
"""
import hashlib
import sys
from pathlib import Path

START = "/* MP-DESIGN-START */"
ENDE = "/* MP-DESIGN-END */"
WURZEL = Path(__file__).resolve().parent.parent
DESIGN = WURZEL / "design"


def md5(text):
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def seiten():
    """Alle HTML-Dateien, die eine Startmarke als eigene Zeile tragen."""
    treffer = []
    for pfad in sorted(WURZEL.rglob("*.html")):
        if ".git" in pfad.parts or pfad.is_relative_to(DESIGN):
            continue
        if any(z.strip() == START for z in pfad.read_text("utf-8").splitlines()):
            treffer.append(pfad)
    return treffer


def block_grenzen(zeilen, pfad):
    starts = [i for i, z in enumerate(zeilen) if z.rstrip("\r\n") == START]
    enden = [i for i, z in enumerate(zeilen) if z.rstrip("\r\n") == ENDE]
    if len(starts) != 1 or len(enden) != 1 or enden[0] < starts[0]:
        sys.exit(f"Abbruch: {pfad.relative_to(WURZEL)} hat {len(starts)} Start- und "
                 f"{len(enden)} Endmarken (erwartet je eine, Start vor Ende).")
    return starts[0], enden[0]


def block_lesen(pfad):
    zeilen = pfad.read_text("utf-8").splitlines(keepends=True)
    a, b = block_grenzen(zeilen, pfad)
    return "".join(zeilen[a:b + 1])


def quelle_lesen(pfad):
    text = Path(pfad).read_text("utf-8")
    zeilen = text.splitlines(keepends=True)
    a, b = block_grenzen(zeilen, Path(pfad).resolve())
    if a != 0 or any(z.strip() for z in zeilen[b + 1:]):
        sys.exit(f"Abbruch: {pfad} muss mit der Startmarke beginnen und mit der Endmarke enden.")
    return "".join(zeilen[a:b + 1])


def bekannte_quellen():
    return {md5(quelle_lesen(p)): p.name for p in sorted(DESIGN.glob("*.css"))
            if p.read_text("utf-8").lstrip().startswith(START)}


def pruefen(quelle=None):
    liste = seiten()
    if not liste:
        sys.exit("Keine Seite mit Designblock gefunden.")
    bloecke = {p: md5(block_lesen(p)) for p in liste}
    bekannt = bekannte_quellen()
    for p, h in bloecke.items():
        print(f"{h}  {p.relative_to(WURZEL)}  ({bekannt.get(h, 'keine Quelle in design/')})")
    if len(set(bloecke.values())) != 1:
        sys.exit("FEHLER: Die Seiten tragen unterschiedliche Blöcke.")
    if quelle:
        soll = md5(quelle_lesen(quelle))
        if soll not in bloecke.values():
            sys.exit(f"FEHLER: Die Seiten tragen nicht {quelle} ({soll}).")
    print(f"OK: {len(liste)} Seiten, ein identischer Block.")


def schreiben(quelle):
    neu = quelle_lesen(quelle)
    for p in seiten():
        zeilen = p.read_text("utf-8").splitlines(keepends=True)
        a, b = block_grenzen(zeilen, p)
        ergebnis = "".join(zeilen[:a]) + neu + "".join(zeilen[b + 1:])
        if not neu.endswith("\n") and b + 1 < len(zeilen):
            ergebnis = "".join(zeilen[:a]) + neu + "\n" + "".join(zeilen[b + 1:])
        p.write_text(ergebnis, "utf-8")
        print(f"geschrieben: {p.relative_to(WURZEL)}")
    pruefen(quelle)


if __name__ == "__main__":
    befehl = sys.argv[1] if len(sys.argv) > 1 else "pruefen"
    arg = sys.argv[2] if len(sys.argv) > 2 else None
    if befehl == "pruefen":
        pruefen(arg)
    elif befehl == "schreiben" and arg:
        schreiben(arg)
    else:
        sys.exit(__doc__)
