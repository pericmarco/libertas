'use client'

import { createContext, useContext } from 'react'
import { FALLBACK_CITY, brandName, isMunicipal, type City } from './host'

// Die aktive Stadt wird serverseitig aufgelöst und hier an alle
// Client-Komponenten weitergereicht:
//
//   const city = useCity()
//   <h1>{cityBrand()}</h1>
//
const CityContext = createContext<City | null>(null)

export function CityProvider({ city, children }: { city: City; children: React.ReactNode }) {
  return <CityContext.Provider value={city}>{children}</CityContext.Provider>
}

/** Aktive Stadt (mit Notnagel, falls kein Provider darüber liegt). */
export function useCity(): City {
  return useContext(CityContext) ?? FALLBACK_CITY
}

/** Anzeigename der aktiven Stadt-Marke — „Lybertas", solange keine gesetzt ist. */
export function useCityBrand(): string {
  return brandName(useCity())
}

/** True, wenn die aktive Stadt das kommunale Beteiligungsportal nutzt. */
export function useIsMunicipal(): boolean {
  return isMunicipal(useCity())
}
