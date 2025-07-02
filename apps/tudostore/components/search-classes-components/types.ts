// // components\search-classes-components\types.ts 
// Tipos para ubicaciones
export interface Location {
  name: string;
  fullName?: string;
  lat: number;
  lon: number;
}

// Tipos para establecimientos
export interface Establishment {
  id: string;
  name: string;
  type: string;
  subtype: string;
  lat: number;
  lon: number;
  address: string;
  distance: string;
  rating: string;
  facilities: string[];
}

// Tipo para filtros activos
export interface ActiveFilters {
  fitness: string[];
  activities: string[];
  facilities: string[];
}

// Tipo para marcadores en el mapa
export interface MapMarker {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type: string;
}
