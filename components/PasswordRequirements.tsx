'use client'

import { Check, X } from 'lucide-react'
import { PASSWORD_RULES } from '@/lib/password'

// Live-Anzeige der Passwort-Anforderungen. Erscheint erst, sobald getippt wird.
export default function PasswordRequirements({ password }: { password: string }) {
  if (!password) return null
  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_RULES.map(rule => {
        const ok = rule.test(password)
        return (
          <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
            {ok ? <Check size={13} className="shrink-0" /> : <X size={13} className="shrink-0" />}
            {rule.label}
          </li>
        )
      })}
    </ul>
  )
}
