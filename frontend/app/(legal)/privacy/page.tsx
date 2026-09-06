import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Datenschutz",
}

export default function PrivacyPage() {
  return (
    <article className="grid gap-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Datenschutzerklärung
      </h1>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">
          Welche Daten gespeichert werden
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Bei der Registrierung werden Benutzername, E-Mail-Adresse und die
          gewählte Rolle gespeichert. Im Profil kommen freiwillig Vor- und
          Nachname, Ort, Telefonnummer, Arbeitszeiten, eine Beschreibung und ein
          Profilbild hinzu. Angebote, Aufträge und Bewertungen werden mit dem
          jeweiligen Konto verknüpft gespeichert.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Anmeldung</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Nach der Anmeldung wird ein Token im lokalen Speicher des Browsers
          abgelegt und bei jeder Anfrage an die API mitgeschickt. Beim Abmelden
          wird er gelöscht. Cookies werden nicht gesetzt, ein Tracking findet
          nicht statt.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Sichtbarkeit</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Angebote sind öffentlich sichtbar. Profile, Aufträge und Bewertungen
          sind nur für angemeldete Nutzer sichtbar. Aufträge sieht ausschließlich
          das Kundenkonto und das Anbieterkonto, die daran beteiligt sind.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Deine Rechte</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Du kannst Auskunft über deine gespeicherten Daten verlangen sowie ihre
          Berichtigung oder Löschung. Wende dich dafür an die im Impressum
          genannte Adresse.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Hinweis</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Coderr ist ein Lernprojekt. Dieser Text ersetzt keine rechtliche
          Beratung.
        </p>
      </section>
    </article>
  )
}
