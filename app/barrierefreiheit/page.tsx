import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { brandName } from '@/lib/city/host'
import LegalPage, { Section } from '@/components/LegalPage'

export const metadata = { title: 'Erklärung zur Barrierefreiheit' }

export default async function Barrierefreiheit() {
  const city = await getCurrentCity()
  const brand = brandName(city)

  return (
    <LegalPage title="Erklärung zur Barrierefreiheit" meta="Stand: September 2026 · erstellt durch Selbstbewertung">

      <Section title="Geltungsbereich">
        <p>
          Diese Erklärung gilt für die Beteiligungsplattform {brand} für {city.name}, erreichbar
          über diese Website einschließlich aller Unterseiten. Wir sind bemüht, die Plattform im
          Einklang mit den Anforderungen an digitale Barrierefreiheit nutzbar zu machen — Maßstab
          sind die Web Content Accessibility Guidelines (WCAG) 2.1 in den Stufen A und AA.
        </p>
      </Section>

      <Section title="Stand der Vereinbarkeit">
        <p>
          Die Plattform ist mit den genannten Anforderungen <strong>teilweise vereinbar</strong>.
          Die im Folgenden aufgeführten Inhalte sind aus den jeweils genannten Gründen noch nicht
          oder nicht vollständig barrierefrei.
        </p>
      </Section>

      <Section title="Nicht oder eingeschränkt barrierefreie Inhalte">
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>
            <strong>Kartenansicht:</strong> Die interaktive Karte lässt sich derzeit nicht
            vollständig per Tastatur bedienen; die dort verorteten Anliegen sind für
            Screenreader nicht gleichwertig zugänglich. Alle Anliegen sind jedoch zusätzlich in
            der Listenansicht vollständig erreichbar.
          </li>
          <li>
            <strong>Farbkontraste:</strong> Einzelne Sekundärtexte und Hilfetexte erreichen den
            geforderten Kontrastwert von 4,5:1 möglicherweise noch nicht durchgängig.
          </li>
          <li>
            <strong>Inhalte in Deutscher Gebärdensprache</strong> und in{' '}
            <strong>Leichter Sprache</strong> liegen bislang nicht vor.
          </li>
          <li>
            <strong>Nutzergenerierte Inhalte:</strong> Beiträge, Bilder und Dateien, die von
            Nutzerinnen und Nutzern eingestellt werden, können wir nicht vorab auf
            Barrierefreiheit prüfen — etwa fehlende Bildbeschreibungen.
          </li>
        </ul>
      </Section>

      <Section title="Geplante Verbesserungen">
        <p>
          Wir arbeiten an der schrittweisen Beseitigung der genannten Einschränkungen. Vorrang
          haben die Tastaturbedienbarkeit der Karte sowie eine systematische Prüfung der
          Farbkontraste. Diese Erklärung wird bei wesentlichen Änderungen aktualisiert.
        </p>
      </Section>

      <Section title="Erstellung dieser Erklärung">
        <p>
          Diese Erklärung wurde im September 2026 erstellt. Grundlage ist eine{' '}
          <strong>Selbstbewertung</strong> durch die Anbieterin. Eine externe Prüfung, etwa nach
          dem BITV-Test, hat bislang nicht stattgefunden.
        </p>
      </Section>

      <Section title="Barriere melden — Kontakt">
        <p>
          Sind dir Barrieren aufgefallen, oder benötigst du Informationen in einer zugänglicheren
          Form? Melde dich gerne — wir nehmen jede Rückmeldung ernst und antworten so schnell wie
          möglich:
        </p>
        <p className="mt-2">
          E-Mail:{' '}
          <a href="mailto:info@lybertas.de" className="text-blue-600 hover:underline">info@lybertas.de</a>
          <br />
          Postanschrift: siehe{' '}
          <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link>
        </p>
      </Section>

      <Section title="Durchsetzungsverfahren">
        <p>
          Bleibt deine Rückmeldung ohne zufriedenstellende Antwort, kannst du dich an die
          zuständige Schlichtungs- beziehungsweise Durchsetzungsstelle wenden. Wird diese Plattform
          von einer Kommune oder einer anderen öffentlichen Stelle betrieben, ist die dort
          zuständige Stelle maßgeblich; die entsprechenden Angaben werden dann an dieser Stelle
          ergänzt.
        </p>
      </Section>

    </LegalPage>
  )
}
