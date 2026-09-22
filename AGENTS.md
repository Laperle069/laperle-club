# AGENTS.md — La Perle gemeinsames Digitalprojekt

Diese Datei gilt für Repository-Arbeit zu **einem Projekt mit drei getrennten Arbeitsbereichen: Website, La Perle Club und Backoffice**. Bereichsübergreifende Chat-Zuständigkeiten und fachliche Regeln stehen in `La-Perle-Master-Projektanweisung.md`; chatbezogene Details stehen in den drei `La-Perle-*-Projektanweisung.md`-Ergänzungen. Aktueller Stand und offene Aufgaben stehen in `PROJECT_STATUS.md`. Lies nur die für die konkrete Aufgabe nötigen Teile.

## Arbeitsregeln

- Starte mit einer gezielten Dateisuche nach der beauftragten Funktion. Lies nur betroffene Dateien und direkte Abhängigkeiten; keine vollständige Repo-Inventur ohne Bedarf.
- Ändere nur den angefragten Bereich. Verwende einen kleinen, nachvollziehbaren Diff. Keine ungefragten Refactorings, Redesigns, Frameworkwechsel, Abhängigkeitsupdates oder neuen Repositories.
- Prüfe, ob die Änderung die andere Anwendung oder den Datenfluss berührt. Bei Schnittstellen nur nötige Verträge/Dateien prüfen und Änderungen in getrennten Bereichen kenntlich machen.
- Bestehende Komponenten, Design-Tokens, Tests und Projektbefehle wiederverwenden. API-/Service-Geheimnisse nie in Frontend-Code oder Ausgaben schreiben.
- Produktive Daten/Server nicht verändern. Lokale Vorschau, Teststand, Freigabe und Live-Veröffentlichung klar unterscheiden. Beautinda betreut den produktiven Server; kein Upload oder Installationspaket ohne ausdrücklichen Auftrag.
- Führe nur passende Tests, Syntaxprüfungen, Builds oder Viewportchecks für die geänderte Funktion aus. Keine breite Testsuite ohne konkreten Grund.
- Berichte kurz: geänderte Dateien, Änderung, tatsächlich ausgeführte Prüfungen/Ergebnis und offene Punkte. Keine vollständigen Logs oder Dateien in die Antwort kopieren.

## Bereichszuordnung

- **Website:** öffentliche Seiten, Inhalte, SEO, Buchungs-/Lead-Flows und Website-Chatbot.
- **Club:** Mitgliederoberfläche, Punkte/Prämien/Ränge, Club-Terminal, Club-Backend und Wallets.
- **Backoffice:** Verwaltungsnavigation, Rollen, zentrale Abläufe, Schnittstellen und Agenturübergabe.

Wenn die Aufgabe mehrere Bereiche berührt, zuerst Scope und Dateien im Ergebnis benennen. Keine fachliche Regel in einem anderen Bereich stillschweigend ändern.

## Statuspflege

Nach einer abgeschlossenen, relevanten Projektänderung `PROJECT_STATUS.md` knapp aktualisieren: Status, betroffene Dateien/Komponente, bestandene Prüfung und verbleibende offene Punkte. Keine Gesprächshistorie oder umfangreichen Diffs dort ablegen.
