// components/search-classes-components/utils.ts
import { Location, Establishment, ActiveFilters } from "./types";
import { getFilterOptions } from "./constants";
import { Dictionary } from "@/lib/dictionary";

// Función para buscar ubicaciones con Nominatim (OpenStreetMap)
export const searchLocations = async (
  searchText: string
): Promise<Location[]> => {
  if (!searchText.trim()) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchText
      )}&limit=5&countrycodes=co`
    );

    if (!response.ok) {
      throw new Error("Network error when searching locations");
    }

    const data = await response.json();
    return data.map((item: any) => ({
      name: item.display_name.split(",")[0],
      fullName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error("Error searching locations:", error);
    return [];
  }
};

// Función para calcular la distancia entre dos puntos (en km)
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
};

// Generar facilidades aleatorias para establecimientos
export const generateRandomFacilities = (facilitiesOptions: string[]): string[] => {
  const allFacilities = [...facilitiesOptions];
  const result: string[] = [];

  // Seleccionar entre 1 y 4 facilidades aleatorias
  const count = Math.floor(Math.random() * 4) + 1;

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * allFacilities.length);
    const facility = allFacilities[randomIndex];

    if (!result.includes(facility)) {
      result.push(facility);
    }
  }

  return result;
};

// Función para generar establecimientos simulados
export const generateFakeEstablishments = (
  lat: number,
  lon: number,
  count: number,
  filters: ActiveFilters,
  distanceKm: number,
  dictionary?: Dictionary["searchClasses"]["constants"]
): Establishment[] => {
  const establishments: Establishment[] = [];
  
  // Usar el diccionario proporcionado o valores predeterminados
  const filterOptions = dictionary 
    ? getFilterOptions(dictionary) 
    : {
        fitness: ["Gym", "Yoga", "Pilates", "Crossfit", "Functional", "Spinning"],
        activities: ["Swimming", "Dance", "Martial Arts", "Boxing", "Climbing", "Running"],
        facilities: ["Pool", "Sauna", "Showers", "Lockers", "Parking", "Cafeteria"],
      };

  // Combinar todos los filtros activos
  const allFilters = [
    ...filters.fitness.map((f) => ({ type: "fitness", name: f })),
    ...filters.activities.map((f) => ({ type: "activities", name: f })),
    ...filters.facilities.map((f) => ({ type: "facilities", name: f })),
  ];

  // Si no hay filtros activos, usar todas las opciones disponibles
  if (allFilters.length === 0) {
    for (const type in filterOptions) {
      filterOptions[type as keyof typeof filterOptions].forEach((option) => {
        allFilters.push({ type, name: option });
      });
    }
  }

  // Generar establecimientos aleatorios
  for (let i = 0; i < count; i++) {
    // Seleccionar un filtro aleatorio
    const randomFilter =
      allFilters[Math.floor(Math.random() * allFilters.length)];

    // Generar coordenadas aleatorias dentro de un radio
    const radius = Math.random() * (distanceKm / 111); // Convertir km a grados aproximadamente
    const angle = Math.random() * Math.PI * 2;
    const offsetLat = radius * Math.cos(angle);
    const offsetLon = radius * Math.sin(angle);

    const newLat = lat + offsetLat;
    const newLon = lon + offsetLon;

    // Calcular la distancia real
    const distance = calculateDistance(lat, lon, newLat, newLon);

    // Verificar si coincide con los filtros seleccionados
    const matchesFitness =
      filters.fitness.length === 0 ||
      (randomFilter.type === "fitness" &&
        filters.fitness.includes(randomFilter.name));

    const matchesActivities =
      filters.activities.length === 0 ||
      (randomFilter.type === "activities" &&
        filters.activities.includes(randomFilter.name));

    // Para las facilidades, generar algunas aleatoriamente y verificar coincidencias
    const randomFacilities = generateRandomFacilities(filterOptions.facilities);
    const matchesFacilities =
      filters.facilities.length === 0 ||
      filters.facilities.some((f) => randomFacilities.includes(f));

    // Verificar si está dentro del radio de distancia
    const isWithinDistance = distance <= distanceKm;

    // Solo agregar si coincide con al menos uno de los filtros activos y está dentro del radio
    if (
      (matchesFitness || matchesActivities || matchesFacilities) &&
      isWithinDistance
    ) {
      establishments.push({
        id: `est-${i}`,
        name: `${randomFilter.name} Studio ${i + 1}`,
        type: randomFilter.type,
        subtype: randomFilter.name,
        lat: newLat,
        lon: newLon,
        address: `Street ${Math.floor(Math.random() * 100) + 1} #${
          Math.floor(Math.random() * 100) + 1
        }-${Math.floor(Math.random() * 100) + 1}`,
        distance: distance.toFixed(1),
        rating: (Math.random() * 3 + 2).toFixed(1), // Calificación entre 2 y 5
        facilities: randomFacilities,
      });
    }
  }

  // Ordenar por distancia
  return establishments
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    .slice(0, 15); // Limitar a 15 resultados
};
