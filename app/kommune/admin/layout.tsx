import AdminNav from '@/components/kommune/AdminNav'

// Verwaltungsbereich des Kommunalportals — eigene Chrome, kein Bürger-Menü.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      {children}
    </div>
  )
}
