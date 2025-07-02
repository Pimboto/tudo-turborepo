// components/search-classes-components/constants.ts
import { Dictionary } from "@/lib/dictionary";

// Ubicación predeterminada (Medellín)
export const DEFAULT_LOCATION = {
  name: "Medellín",
  lat: 6.2476,
  lon: -75.5658,
};

// Estilo de botón activo para filtros
export const activeButtonClass =
  "bg-[#FF9422] text-[#FAFAFA] hover:bg-[#FF9422]/90 border-[#FF9422]";

// Valor por defecto para la distancia
export const DEFAULT_DISTANCE_KM = 5;

// Función para obtener opciones de filtro con traducciones
export const getFilterOptions = (dictionary: Dictionary["searchClasses"]["constants"]) => {
  return {
    fitness: dictionary.fitnessOptions,
    activities: dictionary.activitiesOptions,
    facilities: dictionary.facilitiesOptions,
  };
};
