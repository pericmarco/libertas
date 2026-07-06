import Navbar from '@/components/layout/Navbar'
import { Sparkles, MessageSquareReply, TrendingUp } from 'lucide-react'

export default function Wirkung() {
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-6 py-10">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Wirkung</h1>
            <p className="text-gray-500 mt-1">Was Beteiligung tatsächlich bewegt</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Sparkles size={24} className="text-blue-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Bald an dieser Stelle</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
              Hier wird künftig sichtbar, welche Forderungen und Umfragen politische Reaktionen
              ausgelöst haben und ob Politik oder Verwaltung darauf eingegangen sind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <MessageSquareReply size={18} className="text-gray-400 mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">Reaktionen der Politik</div>
              <div className="text-xs text-gray-500 leading-relaxed">Welche Anliegen haben eine offizielle Rückmeldung erhalten.</div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <TrendingUp size={18} className="text-gray-400 mb-2" />
              <div className="text-sm font-semibold text-gray-800 mb-1">Umgesetzte Forderungen</div>
              <div className="text-xs text-gray-500 leading-relaxed">Welche Themen aus der Bürgerschaft tatsächlich Wirkung gezeigt haben.</div>
            </div>
          </div>

        </div>
      </main>
    </>
  )
}
