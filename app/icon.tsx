import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

// App-Icon (Android/Manifest). Vollflächig ohne Rundung — die Launcher
// maskieren selbst (purpose: maskable).
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2563eb',
        }}
      >
        <div style={{ color: 'white', fontSize: 300, fontWeight: 700, fontFamily: 'sans-serif' }}>L</div>
      </div>
    ),
    size
  )
}
