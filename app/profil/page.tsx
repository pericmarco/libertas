'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/client'
import { AGE_GROUPS, GENDERS, REGION_NAME, USERNAME_REGEX, containsBlocked } from '@/lib/constants'
import { ShieldCheck, CheckCircle2, KeyRound, Mail } from 'lucide-react'

type District = { id: string; name: string }

export default function Profil() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('citizen')
  const [username, setUsername] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [districtId, setDistrictId] = useState('')
  const [districts, setDistricts] = useState<District[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Konto & Sicherheit
  const [newEmail, setNewEmail] = useState('')
  const [emailBusy, setEmailBusy] = useState(false)
  const [emailMsg, setEmailMsg] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwBusy, setPwBusy] = useState(false)
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      setEmail(userData.user.email ?? '')

      const [{ data: profile }, { data: region }] = await Promise.all([
        supabase.from('profiles').select('username, role, age_group, gender, district_id').eq('id', userData.user.id).single(),
        supabase.from('regions').select('id').eq('name', REGION_NAME).single(),
      ])

      if (profile) {
        setUsername(profile.username ?? '')
        setRole(profile.role ?? 'citizen')
        if (profile.age_group && AGE_GROUPS.includes(profile.age_group)) setAgeGroup(profile.age_group)
        if (profile.gender) setGender(profile.gender)
        if (profile.district_id) setDistrictId(profile.district_id)
      }

      if (region) {
        const { data: districtData } = await supabase.from('districts').select('id, name').eq('region_id', region.id)
        if (districtData) setDistricts(districtData)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)

    const name = username.trim()
    if (name && !USERNAME_REGEX.test(name)) {
      setError('Nutzername: 3–24 Zeichen, nur Buchstaben, Zahlen, Punkt und Unterstrich.')
      setSaving(false)
      return
    }
    if (name && containsBlocked(name)) {
      setError('Dieser Nutzername ist nicht zulässig. Bitte wähle einen anderen.')
      setSaving(false)
      return
    }

    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username: name || null, age_group: ageGroup, gender, district_id: districtId })
      .eq('id', userData.user.id)

    if (updateError) {
      setError(updateError.message.includes('duplicate key')
        ? 'Dieser Nutzername ist bereits vergeben.'
        : updateError.message)
      setSaving(false)
      return
    }

    setSaved(true)
    setSaving(false)
  }

  async function changeEmail() {
    setEmailMsg('')
    const next = newEmail.trim()
    if (!next || next === email) return
    setEmailBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ email: next })
    setEmailBusy(false)
    if (error) { setEmailMsg('Fehler: ' + error.message); return }
    setEmailMsg('Wir haben einen Bestätigungslink an die neue Adresse geschickt. Die Änderung wird erst nach dem Bestätigen wirksam.')
    setNewEmail('')
  }

  async function changePassword() {
    setPwMsg('')
    if (newPassword.length < 8) { setPwMsg('Das Passwort muss mindestens 8 Zeichen haben.'); return }
    if (newPassword !== confirmPassword) { setPwMsg('Die Passwörter stimmen nicht überein.'); return }
    setPwBusy(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPwBusy(false)
    if (error) { setPwMsg('Fehler: ' + error.message); return }
    setPwMsg('Dein Passwort wurde geändert.')
    setNewPassword('')
    setConfirmPassword('')
  }

  const complete = ageGroup && gender && districtId
  const inp = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 py-10 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)}
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-10">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dein Profil</h1>
            <p className="text-gray-500 mt-1">Verwalte dein Konto und deine Angaben</p>
          </div>

          {/* Konto & Sicherheit — eigene Karte, außerhalb des Demografie-Formulars */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Konto &amp; Sicherheit</div>
            <div className="flex flex-col gap-6">

              {/* E-Mail ändern */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> E-Mail</label>
                <div className="text-sm text-gray-500 mb-2">Aktuell: <span className="text-gray-700">{email}</span></div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => { setNewEmail(e.target.value); setEmailMsg('') }}
                    placeholder="neue@e-mail.de"
                    className={inp}
                  />
                  <button
                    type="button"
                    onClick={changeEmail}
                    disabled={emailBusy || !newEmail.trim()}
                    className="shrink-0 px-4 py-3 sm:py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    {emailBusy ? 'Senden…' : 'E-Mail ändern'}
                  </button>
                </div>
                {emailMsg && (
                  <div className={`text-xs mt-2 px-3 py-2 rounded-lg ${emailMsg.startsWith('Fehler') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>{emailMsg}</div>
                )}
              </div>

              {/* Passwort ändern */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><KeyRound size={14} className="text-gray-400" /> Passwort ändern</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setPwMsg('') }}
                    placeholder="Neues Passwort"
                    className={inp}
                  />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setPwMsg('') }}
                    placeholder="Wiederholen"
                    className={inp}
                  />
                  <button
                    type="button"
                    onClick={changePassword}
                    disabled={pwBusy || !newPassword || !confirmPassword}
                    className="shrink-0 px-4 py-3 sm:py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40"
                  >
                    {pwBusy ? 'Speichern…' : 'Speichern'}
                  </button>
                </div>
                {pwMsg && (
                  <div className={`text-xs mt-2 px-3 py-2 rounded-lg ${pwMsg.startsWith('Fehler') || pwMsg.includes('mindestens') || pwMsg.includes('stimmen') ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>{pwMsg}</div>
                )}
              </div>

              {role !== 'citizen' && (
                <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                  <ShieldCheck size={15} />
                  {role === 'admin' ? 'Administrator-Konto' : role === 'politician' ? 'Politik-Konto' : 'Stadt-Konto'}
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-6">

            {/* Öffentliches Profil */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Öffentliches Profil</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nutzername <span className="text-gray-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setSaved(false) }}
                  placeholder="z. B. koelner_jeck"
                  minLength={3}
                  maxLength={24}
                  className={inp}
                />
                <p className="text-xs text-gray-400 mt-1.5">Frei wählbares Pseudonym. Ohne Nutzernamen bleibst du bei Beiträgen komplett anonym. Wir speichern bewusst keinen Klarnamen.</p>
              </div>
            </div>

            {/* Demografische Angaben */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Demografische Angaben</div>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Altersgruppe</label>
                  <div className="grid grid-cols-3 gap-2">
                    {AGE_GROUPS.map(ag => (
                      <button
                        key={ag}
                        type="button"
                        onClick={() => { setAgeGroup(ag); setSaved(false) }}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                          ageGroup === ag
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        {ag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Geschlecht</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GENDERS.map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => { setGender(g); setSaved(false) }}
                        className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                          gender === g
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Stadtteil</label>
                  <select
                    value={districtId}
                    onChange={e => { setDistrictId(e.target.value); setSaved(false) }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Stadtteil wählen…</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm text-gray-500 leading-relaxed">
                Diese Angaben werden anonymisiert verwendet und dienen nur dazu, Umfragen und Forderungen
                transparenter auszuwerten. So kann sichtbar werden, ob bestimmte Altersgruppen, Stadtteile
                oder Geschlechter in einer Beteiligung über- oder unterrepräsentiert sind.
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={!complete || saving}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Speichern…' : 'Änderungen speichern'}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
                  <CheckCircle2 size={16} /> Gespeichert
                </span>
              )}
            </div>
          </form>

          {/* Rechtliches — auch für eingeloggte Nutzer erreichbar */}
          <div className="flex gap-5 justify-center text-xs text-gray-400 mt-10 pb-4">
            <a href="/impressum" className="hover:text-gray-600 transition-colors">Impressum</a>
            <a href="/datenschutz" className="hover:text-gray-600 transition-colors">Datenschutz</a>
          </div>

        </div>
      </main>
    </>
  )
}
