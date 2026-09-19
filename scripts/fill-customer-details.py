from pathlib import Path
import re
p=Path('customer-release/club/recht.html');s=p.read_text()
values={'[Datum eintragen]':'19. September 2026','[Firmierung]':'La Perlé Beauty Boutique, Inhaber Bertan Deniz Durmaz','[Anschrift]':'Bruchfeldstraße 33, 60528 Frankfurt am Main','[E-Mail]':'info@laperle-beauty.de','[Telefon]':'+49 155 11431293','[Firmierung, z. B. La Perlé Beauty Boutique, Inhaberin Vorname Nachname]':'La Perlé Beauty Boutique, Inhaber Bertan Deniz Durmaz','[Straße und Hausnummer]':'Bruchfeldstraße 33','[PLZ Ort]':'60528 Frankfurt am Main','[Name]':'Bertan Deniz Durmaz','[Hosting-Dienstleister, z. B. Supabase]':'Supabase','[Region]':'Frankfurt am Main, eu-central-1','[E-Mail-Versanddienst, falls verwendet]':'Brevo','[31.01. des Folgejahres]':'31. Januar des jeweiligen Folgejahres'}
for key,val in values.items():s=s.replace('<span class="tbd">'+key+'</span>',val)
s=re.sub(r'<div class="box">\s*<p[^>]*><b>Hinweis für Deniz.*?</div>','',s,flags=re.S)
s=re.sub(r'<p class="muted">Ein Datenschutzbeauftragter.*?</p>','',s,flags=re.S)
s=re.sub(r'<h3>Cookies und Reichweitenmessung</h3>.*?<h3>Deine Rechte</h3>','''<h3>Technische Bereitstellung</h3>
<p>Die Club-Oberfläche wird über GitHub Pages bereitgestellt. Beim Abruf werden technische Verbindungsdaten wie deine IP-Adresse verarbeitet. Das Punktekonto wird bei Supabase in Frankfurt am Main geführt. Schriften und JavaScript-Dateien werden zusammen mit der Club-Oberfläche ausgeliefert; Google Fonts und öffentliche Skript-CDNs werden dafür nicht aufgerufen. Die Club-Anwendung enthält kein Werbetracking.</p>
<p>Dein persönlicher Zugangslink dient der Anmeldung. Behandle ihn vertraulich. Auf den Verwaltungs- und Terminalgeräten werden Sitzungsinformationen und noch ungeklärte Buchungsvorgänge im Browser gespeichert, damit eine Wiederholung nicht zu doppelten Buchungen führt.</p>
<h3>Deine Rechte</h3>''',s,flags=re.S)
s=re.sub(r'<h3>Umsatzsteuer</h3>.*?(?=<h3>Verantwortlich)', '', s, flags=re.S)
p.write_text(s)
print('Company details filled; not-yet-issued VAT ID omitted without a tax-status claim')
