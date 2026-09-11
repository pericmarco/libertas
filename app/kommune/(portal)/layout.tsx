import MunicipalNav from '@/components/kommune/MunicipalNav'

// Öffentliches Bürger-Portal: Portal-Kopfleiste + Inhalt.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MunicipalNav />
      {children}
    </>
  )
}
