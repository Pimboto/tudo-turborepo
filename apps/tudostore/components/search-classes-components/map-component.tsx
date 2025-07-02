//components\search-classes-components\map-component.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface MapComponentProps {
  center: [number, number]
  zoom: number
  onBoundsChange: (bounds: [[number, number], [number, number]]) => void
  markers?: Array<{
    id: string
    lat: number
    lon: number
    name: string
    type: string
  }>
  onMarkerClick?: (id: string) => void
  selectedMarker?: string | null
}

export default function MapComponent({ 
  center, 
  zoom, 
  onBoundsChange, 
  markers = [],
  onMarkerClick,
  selectedMarker
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMapRef = useRef<L.Map | null>(null)
  const centerMarkerRef = useRef<L.Marker | null>(null)
  const markersLayerRef = useRef<L.LayerGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const previousSelectedMarkerRef = useRef<string | null>(null)
  const markerZoomRef = useRef<number | null>(null)
  // Referencia para almacenar marcadores y evitar recreación
  const prevMarkersRef = useRef<string[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return
    if (leafletMapRef.current) return // Prevent double initialization

    // Fix Leaflet icon issues
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    })

    // Create map instance with custom styles
    const mapInstance = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: false,
    })

    // Add custom tile layer for a more minimal, grayscale look
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapInstance)

    // Apply custom styling to the map
    const mapContainer = mapRef.current;
    if (mapContainer) {
      // Add CSS filter for a cleaner, more minimalist look
      const mapPane = mapInstance.getPane('tilePane');
      if (mapPane) {
        mapPane.style.filter = 'grayscale(30%) contrast(0.9) brightness(1.05)';
      }
    }

    // Add center marker
    const centerMarker = L.marker(center, {
      icon: L.divIcon({
        className: 'center-marker',
        html: `<div class="h-3 w-3 rounded-full bg-[#FF9422] border-2 border-white shadow-sm"></div>`,
        iconSize: [12, 12]
      })
    }).addTo(mapInstance)
    centerMarkerRef.current = centerMarker

    // Create markers layer group
    const markersLayer = L.layerGroup().addTo(mapInstance)
    markersLayerRef.current = markersLayer

    // Handle bounds change - Use a custom event to prevent too many updates
    let boundsUpdateTimeout: NodeJS.Timeout | null = null
    mapInstance.on("moveend", () => {
      // Debounce the bounds update
      if (boundsUpdateTimeout) {
        clearTimeout(boundsUpdateTimeout)
      }
      
      boundsUpdateTimeout = setTimeout(() => {
        const bounds = mapInstance.getBounds()
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        onBoundsChange([
          [sw.lat, sw.lng],
          [ne.lat, ne.lng],
        ])
      }, 300)
    })

    // Monitor zoom changes to store current zoom level
    mapInstance.on("zoomend", () => {
      if (selectedMarker !== null) {
        markerZoomRef.current = mapInstance.getZoom();
      }
    });

    // Add custom styles for attribution to make it less prominent
    const attributionControl = document.querySelector('.leaflet-control-attribution');
    if (attributionControl) {
      (attributionControl as HTMLElement).style.fontSize = '9px';
      (attributionControl as HTMLElement).style.opacity = '0.6';
    }

    // Agregar estilos CSS para los marcadores
    const styleElement = document.createElement('style');
    styleElement.id = 'map-marker-styles';
    
    // Verificar si el estilo ya existe para evitar duplicados
    if (!document.getElementById('map-marker-styles')) {
      styleElement.textContent = `
        /* Estilos para los popups */
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transform: translateY(-16px);
        }
        
        .leaflet-popup-content {
          margin: 0;
          min-width: 120px;
        }
        
        .leaflet-popup-tip {
          box-shadow: 0 1px 4px rgba(0,0,0,0.1);
        }
        
        /* Estilos exactos del marcador del ejemplo */
        .marker-pin {
          width: 30px;
          height: 30px;
          border-radius: 50% 50% 50% 0;
          background: #fff;
          position: relative;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
        
        .marker-pin.active {
          background: #FF9422;
          transform: rotate(-45deg) scale(1.2);
          z-index: 1000 !important;
        }
        
        .marker-pin.active svg {
          color: white;
        }
        
        .marker-pin svg {
          transform: rotate(45deg);
          color: #333;
        }
        
        /* Animar solo la primera vez que se crean los marcadores */
        .marker-animate {
          animation: drop-in 0.5s ease-out;
        }
        
        @keyframes drop-in {
          0% {
            opacity: 0;
            transform: rotate(-45deg) translateY(-20px);
          }
          60% {
            transform: rotate(-45deg) translateY(5px);
          }
          100% {
            opacity: 1;
            transform: rotate(-45deg) translateY(0);
          }
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Store map instance
    leafletMapRef.current = mapInstance
    setIsMapInitialized(true)

    // Cleanup on unmount
    return () => {
      if (boundsUpdateTimeout) {
        clearTimeout(boundsUpdateTimeout)
      }
      
      if (leafletMapRef.current) {
        leafletMapRef.current.remove()
        leafletMapRef.current = null
        centerMarkerRef.current = null
        markersLayerRef.current = null
        markerZoomRef.current = null
        setIsMapInitialized(false)
      }
      
      // Limpiar estilos CSS
      const styleToRemove = document.getElementById('map-marker-styles');
      if (styleToRemove) {
        styleToRemove.parentNode?.removeChild(styleToRemove);
      }
    }
  }, []) // Empty dependency array to initialize only once

  // Update map when center or zoom changes
  useEffect(() => {
    if (!isMapInitialized || !leafletMapRef.current) return

    // Skip updates if we're in the middle of marker selection zoom
    if (selectedMarker !== null && previousSelectedMarkerRef.current !== null) {
      return;
    }

    // Use a ref to track if we're in the process of updating
    const isCenterUpdate = !leafletMapRef.current.getCenter().equals(L.latLng(center))
    const isZoomUpdate = leafletMapRef.current.getZoom() !== zoom

    // Only update if there's an actual change
    if (isCenterUpdate || isZoomUpdate) {
      // Update center marker position
      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLatLng(center)
      }

      // Update map view
      leafletMapRef.current.setView(center, zoom, {
        animate: true,
        duration: 0.5,
      })
    }
  }, [center, zoom, isMapInitialized, selectedMarker, previousSelectedMarkerRef.current])

  // Crear/actualizar marcadores solo cuando cambia la lista de marcadores o el marcador seleccionado
  useEffect(() => {
    if (!isMapInitialized || !leafletMapRef.current || !markersLayerRef.current) return
    
    // Obtener IDs actuales
    const currentMarkerIds = markers.map(m => m.id);
    
    // Solo proceder con la actualización si hay cambios en los marcadores o el seleccionado
    const markersChanged = JSON.stringify(currentMarkerIds) !== JSON.stringify(prevMarkersRef.current);
    
    if (!markersChanged && selectedMarker === previousSelectedMarkerRef.current) {
      return;
    }
    
    // Actualizar referencia de IDs previos
    prevMarkersRef.current = currentMarkerIds;
    
    // Get existing marker IDs
    const existingMarkerIds = Array.from(markersRef.current.keys());
    
    // Remove markers that are no longer in the array
    existingMarkerIds.forEach(id => {
      if (!currentMarkerIds.includes(id)) {
        const marker = markersRef.current.get(id);
        if (marker) {
          markersLayerRef.current?.removeLayer(marker);
          markersRef.current.delete(id);
        }
      }
    });
    
    // Solo animar marcadores nuevos (primera carga)
    const isFirstLoad = existingMarkerIds.length === 0;
    
    // Create/update markers
    markers.forEach(markerData => {
      // Check if marker already exists
      let marker = markersRef.current.get(markerData.id);
      const isSelected = markerData.id === selectedMarker;
      
      if (marker) {
        // Si el marcador ya existe, solo actualizamos su estado de selección sin recrearlo
        marker.setLatLng([markerData.lat, markerData.lon]);
        
        // Solo cambiamos el icono si cambió el estado de selección
        if (isSelected !== (marker.getElement()?.querySelector('.marker-pin')?.classList.contains('active') || false)) {
          const markerIcon = createCustomIcon(isSelected, false);
          marker.setIcon(markerIcon);
        }
        
        marker.setPopupContent(`
          <div class="p-3 text-sm">
            <div class="font-semibold text-gray-800">${markerData.name}</div>
            <div class="text-xs mt-1 text-gray-600">${markerData.type}</div>
          </div>
        `);
      } else {
        // Create new marker if it doesn't exist
        const markerIcon = createCustomIcon(isSelected, isFirstLoad);
        
        marker = L.marker([markerData.lat, markerData.lon], { icon: markerIcon })
          .bindPopup(`
            <div class="p-3 text-sm">
              <div class="font-semibold text-gray-800">${markerData.name}</div>
              <div class="text-xs mt-1 text-gray-600">${markerData.type}</div>
            </div>
          `, { offset: [0, -10] })
          .on('click', () => {
            if (onMarkerClick) {
              onMarkerClick(markerData.id);
            }
          });
        
        markersLayerRef.current?.addLayer(marker);
        markersRef.current.set(markerData.id, marker);
      }
    });
  }, [markers, selectedMarker, isMapInitialized, onMarkerClick]);

  // Función para crear el icono personalizado
  const createCustomIcon = (isSelected: boolean, animate: boolean) => {
    return L.divIcon({
      className: "custom-div-icon",
      html: `<div class="marker-pin ${isSelected ? "active" : ""} ${animate ? "marker-animate" : ""}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  // Special effect to focus on a marker when it's selected
  useEffect(() => {
    // Only proceed if something has changed
    if (
      !selectedMarker || 
      !isMapInitialized || 
      !markersRef.current || 
      selectedMarker === previousSelectedMarkerRef.current
    ) return

    // Update the previous selected marker ref
    previousSelectedMarkerRef.current = selectedMarker
    
    const marker = markersRef.current.get(selectedMarker)
    if (marker && leafletMapRef.current) {
      // Get marker position
      const position = marker.getLatLng()
      
      // Block map events temporarily to prevent event loops
      const mapInstance = leafletMapRef.current;
      
      // Use a flag to prevent recursive updates
      const currentCenter = mapInstance.getCenter();
      const isSameLocation = Math.abs(currentCenter.lat - position.lat) < 0.0001 && 
                             Math.abs(currentCenter.lng - position.lng) < 0.0001;
      
      // Determine the appropriate zoom level
      // Si esto es la primera selección, usar zoom+1, de lo contrario mantener el zoom actual o usar el último zoom de marcador
      const targetZoom = markerZoomRef.current || mapInstance.getZoom() + 1;
                           
      if (!isSameLocation) {
        // Smoothly pan to the marker only if we're not already there
        mapInstance.once('moveend', () => {
          // Open the popup after the movement is complete
          setTimeout(() => {
            if (marker) {
              marker.openPopup();
            }
          }, 100);
        });
        
        // Usar flyTo con el nivel de zoom que hemos determinado
        mapInstance.flyTo([position.lat, position.lng], targetZoom, {
          duration: 0.5
        });
        
        // Actualizar el nivel de zoom almacenado
        markerZoomRef.current = targetZoom;
      } else {
        // Already at the right position, just open the popup
        marker.openPopup();
      }
    }
  }, [selectedMarker, isMapInitialized])

  return (
    <div
      ref={mapRef}
      id="map"
      className="h-full w-full"
      style={{ height: "100%", width: "100%", minHeight: "300px" }}
    />
  )
}
