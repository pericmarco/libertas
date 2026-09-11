import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { brandName } from '@/lib/city/host'
import LegalPage, { Section } from '@/components/LegalPage'

export const metadata = { title: 'Community-Richtlinien' }

export default async function CommunityRichtlinien() {
  const city = await getCurrentCity()
  const brand = brandName(city)

  return (
    <LegalPage title="Community-Richtlinien" meta="Stand: September 2026 · Version 1">

      <Section title="Warum es diese Regeln gibt">
        <p>
          Auf {brand} diskutieren Menschen mit sehr unterschiedlichen Meinungen über ihre Stadt.
          Damit das für alle nutzbar bleibt — auch für die, die sich sonst nicht zu Wort melden —
          gelten ein paar einfache Regeln. Sie sind Teil der{' '}
          <Link href="/nutzungsbedingungen" className="text-blue-600 hover:underline">Nutzungsbedingungen</Link>.
        </p>
      </Section>

      <Section title="So diskutieren wir">
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li><strong>Bleib beim Thema.</strong> Beziehe dich auf das Anliegen, um das es gerade geht.</li>
          <li><strong>Kritisiere die Sache, nicht die Person.</strong> Widerspruch ist erwünscht, Herabwürdigung nicht.</li>
          <li><strong>Werde konkret.</strong> „Die Ampel an der Kreuzung ist zu kurz" hilft mehr als „alles Mist".</li>
          <li><strong>Bleib sachlich, auch wenn du dich ärgerst.</strong> Provokationen bringen niemanden weiter.</li>
        </ul>
      </Section>

      <Section title="Was nicht geht">
        <p className="mb-2">Diese Inhalte entfernen wir:</p>
        <ul className="list-disc list-inside space-y-1 text-gray-600">
          <li>Beleidigungen, Bedrohungen, Hassrede</li>
          <li>Rassistische, sexistische, antisemitische oder sonst menschenverachtende Äußerungen</li>
          <li>Aufrufe zu Gewalt oder deren Verherrlichung</li>
          <li>Verleumdung, bewusste Falschbehauptungen über Personen</li>
          <li>Werbung und kommerzielle Inhalte</li>
          <li><strong>Personenbezogene Daten Dritter</strong> — also Namen, Adressen, Telefonnummern, Fotos anderer Menschen ohne deren Einverständnis</li>
          <li>Fremde Texte oder Bilder ohne die nötigen Rechte</li>
          <li>Spam, Massenbeiträge, Manipulation von Abstimmungen</li>
        </ul>
      </Section>

      <Section title="Ein Konto pro Person">
        <p>
          Mehrfachkonten verzerren Unterstützung und Abstimmungen und untergraben genau das, was
          diese Plattform leisten soll: ein ehrliches Bild davon, was die Menschen in {city.name}{' '}
          wirklich bewegt. Wir gehen Hinweisen darauf konsequent nach.
        </p>
      </Section>

      <Section title="Was passiert bei Verstößen">
        <p className="mb-2">Wir gehen gestuft vor — je nach Schwere:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-600">
          <li><strong>Hinweis</strong> — bei einmaligen, leichten Verstößen.</li>
          <li><strong>Beitrag entfernen</strong> — wenn der Inhalt gegen diese Regeln verstößt.</li>
          <li><strong>Konto sperren</strong> — bei schweren oder wiederholten Verstößen, vorübergehend oder dauerhaft.</li>
        </ol>
        <p className="mt-2">
          Strafbare Inhalte melden wir den zuständigen Behörden. In diesen Fällen können wir zur
          Herausgabe der bei uns gespeicherten Daten verpflichtet sein.
        </p>
      </Section>

      <Section title="Einen Beitrag melden">
        <p>
          Wenn dir ein Beitrag auffällt, der gegen diese Regeln verstößt, melde ihn über die
          Melden-Funktion an der jeweiligen Forderung. Die Meldung geht an unser Moderationsteam und
          wird geprüft — du musst dich nicht selbst mit der Person auseinandersetzen.
        </p>
      </Section>

      <Section title="Wenn du anderer Meinung bist">
        <p>
          Moderation kann irren. Wurde dein Beitrag entfernt oder dein Konto gesperrt und du hältst
          das für falsch, schreib uns über die im{' '}
          <Link href="/impressum" className="text-blue-600 hover:underline">Impressum</Link>{' '}
          genannten Kontaktdaten. Wir schauen uns das noch einmal an.
        </p>
      </Section>

    </LegalPage>
  )
}
