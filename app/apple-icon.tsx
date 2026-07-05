import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Homescreen-Icon für iOS (rundet die Ecken selbst ab)
export default function AppleIcon() {
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
        <div style={{ color: 'white', fontSize: 108, fontWeight: 700, fontFamily: 'sans-serif' }}>L</div>
      </div>
    ),
    size
  )
}
