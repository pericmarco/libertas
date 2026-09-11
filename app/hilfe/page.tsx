import Link from 'next/link'
import { getCurrentCity } from '@/lib/city/server'
import { brandName } from '@/lib/city/host'
import LegalPage, { Section } from '@/components/LegalPage'

export const metadata = { title: 'Hilfe & FAQ' }

export default async function Hilfe() {
  const city = await getCurrentCity()
  const brand = brandName(city)

  return (
    <LegalPage title="Hilfe & FAQ" columns={false}>
      <p className="text-gray-600 mb-8">
        Die häufigsten Fragen zu {brand}. Ist deine Frage nicht dabei? Schreib uns an{' '}
        <a href="mailto:info@lybertas.de" className="text-blue-600 hover:underline">info@lybertas.de</a>.
      </p>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-x-12">

        <Section title={`Was ist ${brand}?`}>
          <p>
            Eine Plattform, auf der du Anliegen für {city.name} einbringen, Anliegen anderer
            unterstützen und über lokale Themen abstimmen kannst. Ziel ist, sichtbar zu machen,
            was die Menschen hier wirklich bewegt — und das an Verwaltung und Politik zu tragen.
          </p>
        </Section>

        <Section title="Brauche ich ein Konto?">
          <p>
            Zum <strong>Lesen</strong> nicht: Feed, Anliegen, Karte und Überblick sind ohne
            Anmeldung einsehbar. Zum <strong>Mitmachen</strong> — einreichen, Position beziehen,
            abstimmen — brauchst du ein kostenloses Konto. Mindestalter ist 16 Jahre.
          </p>
        </Section>

        <Section title="Wer sieht meinen Namen?">
          <p>
            Öffentlich erscheint nur dein selbst gewählter <strong>Nutzername</strong> (Pseudonym).
            Deinen echten Namen speichern wir intern und zeigen ihn nicht an — du kannst im Profil
            selbst entscheiden, ob er sichtbar sein soll. Details stehen in der{' '}
            <Link href="/datenschutz" className="text-blue-600 hover:underline">Datenschutzerklärung</Link>.
          </p>
        </Section>

        <Section title="Wie reiche ich ein Anliegen ein?">
          <p>
            Über den blauen <strong>Plus-Knopf</strong> in der Mitte der Navigation. Du wählst die
            Art des Anliegens, beschreibst kurz, worum es geht, und ordnest es einem Thema und
            einem Ort zu. Je konkreter, desto besser — „Ampelphase an der Kreuzung X zu kurz" wirkt
            mehr als eine allgemeine Beschwerde.
          </p>
        </Section>

        <Section title="Was bedeuten Unterstützung, Gegenargument und Alternative?">
          <p>
            Das sind die drei Positionen, die du zu einem Anliegen beziehen kannst.{' '}
            <strong className="text-green-700">Unterstützung</strong> heißt: Ich sehe das auch so.{' '}
            <strong className="text-orange-600">Gegenargument</strong>: Ich sehe das kritisch — und
            sage warum. <strong className="text-blue-600">Alternative</strong>: Ich schlage einen
            anderen Weg vor. Alle drei zählen als Beteiligung; es geht nicht nur ums Zustimmen.
          </p>
        </Section>

        <Section title="Was passiert mit meinem Anliegen?">
          <p>
            Anliegen sammeln Relevanz durch die Beteiligung anderer. Erreicht ein Anliegen genug
            Zuspruch, wird es für die Bürgerpriorisierung vorgeschlagen und an die zuständige
            Stelle weitergeleitet. Den Stand siehst du jederzeit am Anliegen selbst.
          </p>
        </Section>

        <Section title="Was ist eine Mängelmeldung?">
          <p>
            Kaputte Laterne, Schlagloch, wilder Müll: Das sind keine politischen Forderungen,
            sondern Hinweise an die Verwaltung. Mängelmeldungen sind deshalb{' '}
            <strong>nicht öffentlich</strong> — sie sind nur für dich und das Team sichtbar und
            werden weitergeleitet.
          </p>
        </Section>

        <Section title="Wie melde ich einen unangemessenen Beitrag?">
          <p>
            Über die Melden-Funktion am jeweiligen Anliegen. Die Meldung geht an unser
            Moderationsteam. Was erlaubt ist und was nicht, steht in den{' '}
            <Link href="/community-richtlinien" className="text-blue-600 hover:underline">Community-Richtlinien</Link>.
          </p>
        </Section>

        <Section title="Wie ändere ich E-Mail oder Passwort?">
          <p>
            Im <Link href="/profil" className="text-blue-600 hover:underline">Profil</Link> unter
            „Konto &amp; Sicherheit". Passwort vergessen? Auf der Anmeldeseite findest du den Link{' '}
            „Passwort vergessen?" — wir schicken dir dann einen Link per E-Mail.
          </p>
        </Section>

        <Section title="Wie lösche ich mein Konto?">
          <p>
            Schreib uns formlos an{' '}
            <a href="mailto:info@lybertas.de" className="text-blue-600 hover:underline">info@lybertas.de</a>{' '}
            — wir löschen dein Konto zeitnah. Eine Löschfunktion direkt im Konto bauen wir gerade.
          </p>
        </Section>

        <Section title="Ich bin Mandatsträger:in — wie komme ich ins Verzeichnis?">
          <p>
            Im <Link href="/politiker" className="text-blue-600 hover:underline">Politik-Verzeichnis</Link>{' '}
            legen wir Einträge aus den uns zugesandten Angaben an. Meldest du dich anschließend mit
            genau der hinterlegten E-Mail-Adresse an, kannst du deinen Eintrag unter{' '}
            <Link href="/politiker/mein-profil" className="text-blue-600 hover:underline">„Eintrag verwalten"</Link>{' '}
            selbst übernehmen und pflegen.
          </p>
        </Section>

      </div>
    </LegalPage>
  )
}
