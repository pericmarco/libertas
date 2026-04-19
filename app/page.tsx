import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white">
      <div className="max-w-2xl text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <span className="text-white font-bold text-2xl">L</span>
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">
          Politik in deinem<br />Wahlkreis
        </h1>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          Informiere dich über lokale Themen, stimme ab, reiche Forderungen ein
          und verfolge, ob deine Anliegen aufgegriffen werden.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/register" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            Jetzt mitmachen
          </Link>
          <Link href="/dashboard" className="px-8 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors">
            Demo ansehen
          </Link>
        </div>
      </div>
    </main>
  )
}
