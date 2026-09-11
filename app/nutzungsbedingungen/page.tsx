import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { brandName } from '@/lib/city/host'
import LegalPage, { Section } from '@/components/LegalPage'

export const metadata = { title: 'Nutzungsbedingungen' }

export default async function Nutzungsbedingungen() {
  const city = await getCurrentCity()
  const brand = brandName(city)

  return (
    <LegalPage title="Nutzungsbedingungen" meta="Stand: September 2026 · Version 1">

      <Section title="1. Geltungsbereich">
        <p>
          Diese Nutzungsbedingungen gelten für die Nutzung der Beteiligungsplattform {brand} für
          {' '}{city.name} (nachfolgend „die Plattform"). Anbieterin ist die Lybertas GbR; die
          vollständigen Angaben findest du im{' '}
          <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link>.
          Ergänzend gelten unsere{' '}
          <Link href="/community-richtlinien" className="text-blue-600 hover:underline">Community-Richtlinien</Link>{' '}
          und die{' '}
          <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>.
        </p>
      </Section>

      <Section title="2. Zugang und Registrierung">
        <p className="mb-2">
          Das Lesen der öffentlichen Inhalte ist ohne Konto möglich. Für das Einreichen von
          Anliegen, das Beziehen von Positionen und das Abstimmen ist ein Konto erforderlich.
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Registrieren kann sich jede natürliche Person ab <strong>16 Jahren</strong>.</li>
          <li>Du wählst einen <strong>Nutzernamen</strong> (Pseudonym), unter dem deine Beiträge erscheinen.</li>
          <li>Pro Person ist <strong>ein Konto</strong> zulässig. Mehrfachkonten sind nicht gestattet.</li>
          <li>Deine Zugangsdaten sind vertraulich zu behandeln und nicht an Dritte weiterzugeben.</li>
          <li>Ein Anspruch auf Registrierung besteht nicht.</li>
        </ul>
      </Section>

      <Section title="3. Deine Beiträge">
        <p>
          Du bist für die von dir eingestellten Inhalte selbst verantwortlich. Beiträge sollen sich
          auf das jeweilige Thema beziehen, in deutscher Sprache verfasst und sachlich formuliert
          sein. Was inhaltlich gilt, steht in den{' '}
          <Link href="/community-richtlinien" className="text-blue-600 hover:underline">Community-Richtlinien</Link>.
          Du sicherst zu, dass du die erforderlichen Rechte an allem hast, was du hochlädst, und
          dass deine Beiträge keine Rechte Dritter verletzen.
        </p>
      </Section>

      <Section title="4. Verantwortung für Inhalte">
        <p>
          Wir prüfen Beiträge <strong>nicht vorab</strong> auf Richtigkeit oder Rechtmäßigkeit.
          Konkreten Hinweisen auf rechtswidrige oder regelwidrige Inhalte gehen wir jedoch
          unverzüglich nach und entfernen betroffene Beiträge, sobald wir davon Kenntnis erlangen.
          Inhalte von Nutzerinnen und Nutzern geben nicht die Auffassung der Anbieterin oder der
          Stadt wieder.
        </p>
      </Section>

      <Section title="5. Rechte an deinen Inhalten">
        <p>
          Deine Beiträge bleiben deine. Du räumst uns lediglich das <strong>einfache, nicht
          ausschließliche Recht</strong> ein, sie im Rahmen des Plattformbetriebs zu speichern,
          anzuzeigen und — in anonymisierter, zusammengefasster Form — für die Auswertung der
          Beteiligung zu verwenden. Löschst du einen Beitrag oder dein Konto, endet dieses Recht.
          Bereits erstellte anonyme Auswertungen, die keinen Rückschluss auf dich zulassen, bleiben
          davon unberührt.
        </p>
      </Section>

      <Section title="6. Moderation und Sperrung">
        <p>
          Wir behalten uns vor, Beiträge zu entfernen, die gegen diese Bedingungen, die
          Community-Richtlinien oder geltendes Recht verstoßen. Bei schweren oder wiederholten
          Verstößen können wir ein Konto vorübergehend oder dauerhaft sperren. Wir informieren dich
          in der Regel über den Grund; du kannst der Maßnahme über die im Impressum genannten
          Kontaktwege widersprechen.
        </p>
      </Section>

      <Section title="7. Konto beenden">
        <p>
          Du kannst dein Konto jederzeit und ohne Angabe von Gründen beenden. Eine
          Selbstbedienungs-Löschung im Konto ist derzeit noch nicht verfügbar — bis dahin genügt
          eine formlose Nachricht an die im Impressum genannte Adresse; wir löschen dein Konto dann
          zeitnah. Welche Daten dabei gelöscht werden, steht in der{' '}
          <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>.
        </p>
      </Section>

      <Section title="8. Verfügbarkeit">
        <p>
          Die Plattform wird auf unbestimmte Zeit betrieben. Ein Anspruch auf ständige
          Verfügbarkeit besteht nicht: Wartungsarbeiten, technische Störungen oder Weiterentwicklung
          können zu Unterbrechungen führen. {brand} befindet sich im Aufbau; einzelne Funktionen
          können sich ändern oder entfallen.
        </p>
      </Section>

      <Section title="9. Haftung">
        <p>
          Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei der Verletzung von
          Leben, Körper oder Gesundheit. Bei einfacher Fahrlässigkeit haften wir nur bei Verletzung
          wesentlicher Vertragspflichten und begrenzt auf den vertragstypischen, vorhersehbaren
          Schaden. Im Übrigen ist die Haftung ausgeschlossen. Für Inhalte, die Nutzerinnen und
          Nutzer einstellen, haften wir nach den gesetzlichen Bestimmungen erst ab Kenntnis.
        </p>
      </Section>

      <Section title="10. Änderungen dieser Bedingungen">
        <p>
          Wir können diese Bedingungen anpassen, etwa bei neuen Funktionen oder geänderter
          Rechtslage. Über wesentliche Änderungen informieren wir dich vorab in der Plattform oder
          per E-Mail. Widersprichst du nicht innerhalb von vier Wochen und nutzt die Plattform
          weiter, gelten die geänderten Bedingungen als angenommen.
        </p>
      </Section>

      <Section title="11. Schlussbestimmungen">
        <p>
          Es gilt das Recht der Bundesrepublik Deutschland. Sollte eine Bestimmung unwirksam sein,
          bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
        </p>
      </Section>

    </LegalPage>
  )
}
