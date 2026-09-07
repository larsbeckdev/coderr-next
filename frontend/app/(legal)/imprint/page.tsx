import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Impressum",
}

export default function ImprintPage() {
  return (
    <article className="grid gap-8">
      <h1 className="font-heading text-3xl font-bold text-primary">
        Impressum
      </h1>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">
          Angaben gemäß § 5 TMG
        </h2>
        <address className="grid gap-1 text-sm text-muted-foreground not-italic">
          <p>
            <strong className="text-foreground">Name:</strong> Max Mustermann
          </p>
          <p>
            <strong className="text-foreground">Anschrift:</strong> Musterstraße
            1, 12345 Musterstadt
          </p>
          <p>
            <strong className="text-foreground">Telefon:</strong>{" "}
            <a href="tel:+4912345678" className="text-primary hover:underline">
              +49 123 45678
            </a>
          </p>
          <p>
            <strong className="text-foreground">E-Mail:</strong>{" "}
            <a
              href="mailto:info@example.com"
              className="text-primary hover:underline"
            >
              info@example.com
            </a>
          </p>
        </address>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">
          Haftung für Links
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten
          sind ausschließlich deren Betreiber verantwortlich.
        </p>
      </section>

      <section className="grid gap-3">
        <h2 className="font-heading text-lg font-semibold">Hinweis</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Coderr ist ein Lernprojekt. Es werden keine echten Aufträge vermittelt
          und keine Zahlungen abgewickelt.
        </p>
      </section>
    </article>
  )
}
