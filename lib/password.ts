// Gemeinsame Passwort-Anforderungen für Registrierung, Passwort-Reset und
// Passwort-Änderung. Eine Quelle der Wahrheit, damit die Regeln überall gleich
// sind.
export type PasswordRule = { label: string; test: (pw: string) => boolean }

export const PASSWORD_RULES: PasswordRule[] = [
  { label: 'Mindestens 8 Zeichen', test: pw => pw.length >= 8 },
  { label: 'Ein Großbuchstabe', test: pw => /[A-Z]/.test(pw) },
  { label: 'Ein Kleinbuchstabe', test: pw => /[a-z]/.test(pw) },
  { label: 'Eine Zahl oder ein Sonderzeichen', test: pw => /[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw) },
]

// Erfüllt das Passwort alle Regeln?
export function isPasswordValid(pw: string): boolean {
  return PASSWORD_RULES.every(r => r.test(pw))
}

// Fehlermeldung, falls eine Regel nicht erfüllt ist — sonst null.
export function validatePassword(pw: string): string | null {
  return isPasswordValid(pw)
    ? null
    : 'Dein Passwort erfüllt noch nicht alle Anforderungen.'
}
