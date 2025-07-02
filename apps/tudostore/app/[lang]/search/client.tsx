//app\[lang]\search\client.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/navbar";
import Script from "next/script";
import { getFilterOptions, DEFAULT_LOCATION, DEFAULT_DISTANCE_KM } from "@/components/search-classes-components/constants";
import { FilterBar, ResultsPanel, SearchMap, generateFakeEstablishments } from "@/components/search-classes-components";
import { Location, Establishment, ActiveFilters, MapMarker } from "@/components/search-classes-components/types";
import type { Locale } from "@/middleware";
import { Footer } from "@/components/Footer";

interface SearchClientProps {
  params: {
    lang: Locale;
  };
  dictionary: any;
}

export default function SearchClient({ params, dictionary }: SearchClientProps) {
  const [searchText, setSearchText] = useState("");
  const [location, setLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    fitness: [],
    activities: [],
    facilities: [],
  });
  const [distanceKm, setDistanceKm] = useState<number>(DEFAULT_DISTANCE_KM);
  const [isDistanceActive, setIsDistanceActive] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    DEFAULT_LOCATION.lat,
    DEFAULT_LOCATION.lon,
  ]);
  const [mapZoom, setMapZoom] = useState(12);
  const [mapBounds, setMapBounds] = useState<
    [[number, number], [number, number]] | null
  >(null);
  const [isClient, setIsClient] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Estado para establecimientos y resultados
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishment, setSelectedEstablishment] = useState<string | null>(null);

  // Referencias para evitar bucles infinitos
  const isGeneratingRef = useRef(false);
  const previousSelectedLocationRef = useRef<Location | null>(null);
  const previousFiltersRef = useRef<ActiveFilters | null>(null);
  const previousDistanceRef = useRef<number | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Establecer isClient en true cuando el componente se monta
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generar establecimientos cuando cambia la ubicación o los filtros - con medidas de seguridad
  useEffect(() => {
    if (!selectedLocation) return;

    // Comprobar si realmente necesitamos regenerar establecimientos
    const locationChanged =
      !previousSelectedLocationRef.current ||
      selectedLocation.lat !== previousSelectedLocationRef.current.lat ||
      selectedLocation.lon !== previousSelectedLocationRef.current.lon;

    const filtersChanged =
      !previousFiltersRef.current ||
      JSON.stringify(activeFilters) !==
        JSON.stringify(previousFiltersRef.current);

    const distanceChanged =
      previousDistanceRef.current === null ||
      distanceKm !== previousDistanceRef.current;

    // Solo regenerar si algo cambió y no estamos ya generando
    if (
      (locationChanged || filtersChanged || distanceChanged) &&
      !isGeneratingRef.current
    ) {
      isGeneratingRef.current = true;

      // Actualizar referencias con valores actuales
      previousSelectedLocationRef.current = selectedLocation;
      previousFiltersRef.current = { ...activeFilters };
      previousDistanceRef.current = distanceKm;

      // Generar con 20 establecimientos como máximo
      const count = 20;
      const newEstablishments = generateFakeEstablishments(
        selectedLocation.lat,
        selectedLocation.lon,
        count,
        activeFilters,
        distanceKm,
        dictionary.searchClasses.constants
      );

      setEstablishments(newEstablishments);

      // Limpiar la marca de generación cuando termine
      isGeneratingRef.current = false;
    }
  }, [selectedLocation, activeFilters, distanceKm, dictionary]);

  // Actualizar el centro del mapa cuando cambia la ubicación - con medidas de seguridad
  useEffect(() => {
    if (selectedLocation) {
      // Evitar actualizaciones innecesarias del centro del mapa
      if (
        mapCenter[0] !== selectedLocation.lat ||
        mapCenter[1] !== selectedLocation.lon
      ) {
        setMapCenter([selectedLocation.lat, selectedLocation.lon]);
        setMapZoom(13);
      }
    }
  }, [selectedLocation, mapCenter]);

  // Funciones de manejador memorizadas para evitar recrearlas en cada renderizado
  const handleBoundsChange = useCallback(
    (bounds: [[number, number], [number, number]]) => {
      setMapBounds(bounds);
    },
    []
  );

  // Buscar en el área actual con medidas de seguridad
  const searchInArea = useCallback(() => {
    if (mapBounds && mapCenter) {
      // Comprobar si el centro realmente ha cambiado
      if (
        !selectedLocation ||
        Math.abs(selectedLocation.lat - mapCenter[0]) > 0.0001 ||
        Math.abs(selectedLocation.lon - mapCenter[1]) > 0.0001
      ) {
        setSelectedLocation({
          name: dictionary.searchClasses.map.currentArea,
          lat: mapCenter[0],
          lon: mapCenter[1],
        });
        setLocation(dictionary.searchClasses.map.currentArea);
      }
    }
  }, [mapBounds, mapCenter, selectedLocation, setLocation, dictionary]);

  // Manejar clic en establecimiento con medidas de seguridad
  const handleEstablishmentClick = useCallback(
    (id: string) => {
      // Solo establecer si es diferente
      if (id !== selectedEstablishment) {
        setSelectedEstablishment(id);

        // Encontrar el establecimiento
        const establishment = establishments.find((e) => e.id === id);
        if (establishment) {
          // Solo actualizar el centro si es suficientemente diferente
          const currentCenter = mapCenter;
          const isSameLocation =
            Math.abs(currentCenter[0] - establishment.lat) < 0.0001 &&
            Math.abs(currentCenter[1] - establishment.lon) < 0.0001;

          if (!isSameLocation) {
            setMapCenter([establishment.lat, establishment.lon]);
            setMapZoom(15);
          }
          
          // Scroll al card correspondiente si viene de un clic en el mapa
          // Usamos setTimeout para asegurar que el DOM esté actualizado
          setTimeout(() => {
            const cardElement = document.getElementById(`establishment-card-${id}`);
            if (cardElement) {
              // Obtenemos el contenedor de scroll actual (el viewport de ScrollArea)
              const scrollViewport = document.querySelector('[data-radix-scroll-area-viewport]');
              if (scrollViewport) {
                const cardOffsetTop = cardElement.offsetTop;
                const scrollContainer = scrollViewport.parentElement;
                const containerTop = scrollContainer ? scrollContainer.getBoundingClientRect().top : 0;
                
                // Calculamos la posición de scroll óptima
                scrollViewport.scrollTo({
                  top: cardOffsetTop - 20, // Ajuste para dar un poco de espacio arriba
                  behavior: 'smooth'
                });
              }
            }
          }, 100);
        }
      }
    },
    [establishments, selectedEstablishment, mapCenter, setMapCenter, setMapZoom]
  );

  // Función auxiliar para contar filtros activos
  const countActiveFilters = useCallback(() => {
    return (
      Object.values(activeFilters).flat().length +
      (selectedLocation ? 1 : 0) +
      (isDistanceActive ? 1 : 0)
    );
  }, [activeFilters, selectedLocation, isDistanceActive]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setActiveFilters({
      fitness: [],
      activities: [],
      facilities: [],
    });
    setDistanceKm(DEFAULT_DISTANCE_KM);
    setIsDistanceActive(false);
    setSearchText("");
    setLocation("");
    setSelectedLocation(null);
    setEstablishments([]);

    // Limpiar referencias de seguimiento
    previousSelectedLocationRef.current = null;
    previousFiltersRef.current = null;
    previousDistanceRef.current = null;
  }, []);

  // Preparar marcadores para el mapa
  const mapMarkers: MapMarker[] = establishments.map(e => ({
    id: e.id,
    lat: e.lat,
    lon: e.lon,
    name: e.name,
    type: e.subtype
  }));

  // Obtener las opciones de filtro según el idioma
  const filterOptions = getFilterOptions(dictionary.searchClasses.constants);

  return (
    <>
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossOrigin=""
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="flex flex-col min-h-screen relative z-10">
        {/* Navbar with higher z-index to ensure dropdowns appear above other elements */}
        <div className="relative z-[100]">
          <Navbar lang={params.lang} dictionary={dictionary.navbar} variant="light" transparentOnTop={false} />
        </div>

        {/* Content container with proper z-index layering */}
        <div className="relative z-[50] flex flex-col flex-1 pt-16 md:pt-24">
          {/* Filter Bar Component */}
          <div className="sticky top-16 md:top-24 bg-white shadow-sm z-40">
            <FilterBar
              location={location}
              setLocation={setLocation}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              activeFilters={activeFilters}
              setActiveFilters={setActiveFilters}
              distanceKm={distanceKm}
              setDistanceKm={setDistanceKm}
              isDistanceActive={isDistanceActive}
              setIsDistanceActive={setIsDistanceActive}
              dictionary={dictionary.searchClasses.filterBar}
              filterOptions={filterOptions}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col md:flex-row z-30">
            {/* Results Panel Component */}
            <ResultsPanel
              selectedLocation={selectedLocation}
              establishments={establishments}
              selectedEstablishment={selectedEstablishment}
              handleEstablishmentClick={handleEstablishmentClick}
              countActiveFilters={countActiveFilters}
              clearFilters={clearFilters}
              resultsRef={resultsRef}
              dictionary={dictionary.searchClasses.resultsPanel}
            />
            
            {/* Map Component */}
            <SearchMap
              mapCenter={mapCenter}
              mapZoom={mapZoom}
              setMapZoom={setMapZoom}
              markers={mapMarkers}
              selectedMarker={selectedEstablishment}
              onMarkerClick={handleEstablishmentClick}
              onBoundsChange={handleBoundsChange}
              searchInArea={searchInArea}
              selectedLocation={selectedLocation}
              isClient={isClient}
              scriptLoaded={scriptLoaded}
              dictionary={dictionary.searchClasses.map}
            />
          </div>
        </div>
      </div>
      
      <Footer dictionary={dictionary.footer} lang={params.lang} />

    </>
  );
}
