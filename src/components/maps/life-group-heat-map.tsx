"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Map, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface LifeGroupLocation {
  lat: number;
  lng: number;
  name: string;
  members: number;
}

interface UnderservedArea {
  lat: number;
  lng: number;
  name: string;
  description: string;
  coverage: string;
}

interface LifeGroupHeatMapProps {
  locations: LifeGroupLocation[];
  underservedAreas?: UnderservedArea[];
  center?: { lat: number; lng: number };
  zoom?: number;
  radiusMiles?: number;
  cityName?: string;
  countyName?: string;
}

export function LifeGroupHeatMap({
  locations,
  underservedAreas = [],
  center = { lat: 35.8456, lng: -86.3903 },
  zoom = 12,
  radiusMiles = 1.5,
  cityName = "Murfreesboro",
  countyName = "Rutherford County",
}: LifeGroupHeatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [heatmap, setHeatmap] =
    useState<google.maps.visualization.HeatmapLayer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showZipCodes, setShowZipCodes] = useState(false);
  const [showCityBounds, setShowCityBounds] = useState(false);
  const [showCountyBounds, setShowCountyBounds] = useState(false);
  const [zipCodePolygons, setZipCodePolygons] = useState<google.maps.Polygon[]>(
    []
  );
  const [zipCodeLabels, setZipCodeLabels] = useState<google.maps.Marker[]>([]);
  const [zipDataLayer, setZipDataLayer] = useState<google.maps.Data | null>(
    null
  );
  const [cityDataLayer, setCityDataLayer] = useState<google.maps.Data | null>(
    null
  );
  const [countyDataLayer, setCountyDataLayer] =
    useState<google.maps.Data | null>(null);
  const [cityPolygon, setCityPolygon] = useState<google.maps.Polygon | null>(
    null
  );
  const [countyPolygon, setCountyPolygon] =
    useState<google.maps.Polygon | null>(null);
  const [geocodingError, setGeocodingError] = useState<string | null>(null);

  const metersPerMile = 1609.34;
  const radiusMeters = radiusMiles * metersPerMile;

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        if (typeof window.google !== "undefined") {
          initializeMap();
          return;
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          setError("Google Maps API key not configured");
          setLoading(false);
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=visualization`;
        script.async = true;
        script.defer = true;
        script.onload = () => initializeMap();
        script.onerror = () => {
          setError("Failed to load Google Maps");
          setLoading(false);
        };
        document.head.appendChild(script);
      } catch (err) {
        setError("Error loading map");
        setLoading(false);
      }
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: "roadmap",
        styles: [
          {
            featureType: "poi",
            stylers: [{ visibility: "off" }],
          },
        ],
      });

      mapInstance.addListener("idle", () => {
        if (showZipCodes) {
          const event = new Event("mapBoundsChanged");
          window.dispatchEvent(event);
        }
      });

      setMap(mapInstance);
      setLoading(false);
    };

    loadGoogleMaps();
  }, [center, zoom]);

  useEffect(() => {
    if (!map || locations.length === 0) return;

    if (heatmap) {
      heatmap.setMap(null);
    }

    const scale = Math.pow(2, map.getZoom() || zoom);
    const metersPerPixel =
      (156543.03392 * Math.cos((center.lat * Math.PI) / 180)) / scale;
    const radiusPixels = Math.round(radiusMeters / metersPerPixel);

    const heatmapData = locations.map((location) => ({
      location: new google.maps.LatLng(location.lat, location.lng),
      weight: location.members,
    }));

    const newHeatmap = new google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: map,
      radius: radiusPixels,
      opacity: 0.6,
      gradient: [
        "rgba(0, 255, 255, 0)",
        "rgba(0, 255, 255, 1)",
        "rgba(0, 191, 255, 1)",
        "rgba(0, 127, 255, 1)",
        "rgba(0, 63, 255, 1)",
        "rgba(0, 0, 255, 1)",
        "rgba(0, 0, 223, 1)",
        "rgba(0, 0, 191, 1)",
        "rgba(0, 0, 159, 1)",
        "rgba(0, 0, 127, 1)",
        "rgba(63, 0, 91, 1)",
        "rgba(127, 0, 63, 1)",
        "rgba(191, 0, 31, 1)",
        "rgba(255, 0, 0, 1)",
      ],
    });

    const infoWindow = new google.maps.InfoWindow();
    const circles: google.maps.Circle[] = [];

    locations.forEach((location) => {
      const circle = new google.maps.Circle({
        strokeColor: "#8b5cf6",
        strokeOpacity: 0.4,
        strokeWeight: 2,
        fillColor: "#8b5cf6",
        fillOpacity: 0.1,
        map,
        center: { lat: location.lat, lng: location.lng },
        radius: radiusMeters,
      });
      circles.push(circle);

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map: map,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#8b5cf6",
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("mouseover", () => {
        infoWindow.setContent(`
          <div style="padding: 8px; min-width: 150px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
              ${location.name}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              ${location.members} members
            </p>
          </div>
        `);
        infoWindow.open(map, marker);
      });

      marker.addListener("mouseout", () => {
        infoWindow.close();
      });
    });

    underservedAreas.forEach((area) => {
      const marker = new google.maps.Marker({
        position: { lat: area.lat, lng: area.lng },
        map: map,
        title: area.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: area.coverage === "none" ? "#ef4444" : "#f59e0b",
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
        zIndex: 1000,
      });

      const areaInfoWindow = new google.maps.InfoWindow();

      marker.addListener("mouseover", () => {
        areaInfoWindow.setContent(`
          <div style="padding: 8px; min-width: 180px;">
            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #dc2626;">
              ⚠️ ${area.name}
            </h3>
            <p style="margin: 0; font-size: 12px; color: #6b7280;">
              ${area.description}
            </p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: #ef4444; font-weight: 500;">
              Opportunity to start new group
            </p>
          </div>
        `);
        areaInfoWindow.open(map, marker);
      });

      marker.addListener("mouseout", () => {
        areaInfoWindow.close();
      });
    });

    setHeatmap(newHeatmap);
  }, [map, locations, underservedAreas, radiusMeters, zoom, center.lat]);

  useEffect(() => {
    if (!map || !showZipCodes) {
      zipCodeLabels.forEach((label) => label.setMap(null));
      setZipCodeLabels([]);
      if (zipDataLayer) {
        zipDataLayer.setMap(null);
        setZipDataLayer(null);
      }
      return;
    }

    const loadZipCodes = () => {
      zipCodeLabels.forEach((label) => label.setMap(null));
      setZipCodeLabels([]);

      if (zipDataLayer) {
        zipDataLayer.setMap(null);
      }

      console.log("Loading ZIP code boundaries...");

      const bounds = map.getBounds();
      if (!bounds) return;

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();

      const dataLayer = new google.maps.Data({ map });

      dataLayer.setStyle({
        fillColor: "#3b82f6",
        fillOpacity: 0.1,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.6,
        strokeWeight: 2,
      });

      dataLayer.addListener("mouseover", (event: any) => {
        dataLayer.overrideStyle(event.feature, {
          fillOpacity: 0.2,
          strokeWeight: 3,
        });
      });

      dataLayer.addListener("mouseout", (event: any) => {
        dataLayer.revertStyle();
      });

      fetch(
        `https://nominatim.openstreetmap.org/search?format=json&city=${encodeURIComponent(cityName)}&country=us`,
        {
          headers: {
            "User-Agent": "Gatherwise Church Management App",
          },
        }
      )
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch city info");
          return response.json();
        })
        .then((cityData) => {
          if (!cityData || cityData.length === 0) {
            console.warn("No city data found");
            return;
          }

          const cityBbox = cityData[0].boundingbox;
          const cityBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(parseFloat(cityBbox[0]), parseFloat(cityBbox[2])),
            new google.maps.LatLng(parseFloat(cityBbox[1]), parseFloat(cityBbox[3]))
          );

          return fetch(
            `https://raw.githubusercontent.com/OpenDataDE/State-zip-code-GeoJSON/master/tn_tennessee_zip_codes_geo.min.json`
          )
            .then((response) => {
              if (!response.ok) throw new Error("Failed to fetch ZIP codes");
              return response.json();
            })
            .then((geoJsonData) => {
              console.log(
                `Loaded ${geoJsonData.features?.length || 0} ZIP codes for Tennessee`
              );

              const newLabels: google.maps.Marker[] = [];

              geoJsonData.features?.forEach((feature: any) => {
                const zipCode = feature.properties.ZCTA5CE10 || feature.properties.GEOID10 || feature.properties.name;
                
                if (!zipCode) return;

                const geometry = feature.geometry;
                if (geometry) {
                  try {
                    const geometryBounds = new google.maps.LatLngBounds();
                    
                    const processCoordinates = (coords: any) => {
                      if (Array.isArray(coords[0])) {
                        coords.forEach((c: any) => processCoordinates(c));
                      } else {
                        geometryBounds.extend(new google.maps.LatLng(coords[1], coords[0]));
                      }
                    };

                    if (geometry.type === "Polygon") {
                      processCoordinates(geometry.coordinates[0]);
                    } else if (geometry.type === "MultiPolygon") {
                      geometry.coordinates.forEach((polygon: any) => {
                        processCoordinates(polygon[0]);
                      });
                    }

                    const zipCenter = geometryBounds.getCenter();
                    
                    if (cityBounds.contains(zipCenter)) {
                      dataLayer.addGeoJson({
                        type: "Feature",
                        properties: { zip: zipCode },
                        geometry: geometry,
                      });

                      const label = new google.maps.Marker({
                        position: zipCenter,
                        map: map,
                        icon: {
                          path: google.maps.SymbolPath.CIRCLE,
                          scale: 0,
                        },
                        label: {
                          text: zipCode.toString(),
                          color: "#1e3a8a",
                          fontSize: "16px",
                          fontWeight: "700",
                          className: "zip-label",
                        },
                        clickable: false,
                        zIndex: 1000,
                      });

                      newLabels.push(label);
                    }
                  } catch (e) {
                    console.warn(`Failed to add ZIP ${zipCode} boundary:`, e);
                  }
                }
              });

              console.log(`Filtered to ${newLabels.length} ZIP codes in ${cityName}`);
              setZipCodeLabels(newLabels);
              setZipDataLayer(dataLayer);
            });
        })
        .catch((error) => {
          console.error("Error loading ZIP codes:", error);
          setGeocodingError(
            "Failed to load ZIP code boundaries. Please check your internet connection."
          );
        });
    };

    loadZipCodes();

    const handleBoundsChanged = () => {
      if (showZipCodes) {
        loadZipCodes();
      }
    };

    window.addEventListener("mapBoundsChanged", handleBoundsChanged);

    return () => {
      window.removeEventListener("mapBoundsChanged", handleBoundsChanged);
    };
  }, [map, showZipCodes]);

  useEffect(() => {
    if (!map) return;

    if (cityDataLayer) {
      cityDataLayer.setMap(null);
      setCityDataLayer(null);
    }
    if (cityPolygon) {
      cityPolygon.setMap(null);
      setCityPolygon(null);
    }

    if (!showCityBounds) return;

    console.log("Loading city bounds for:", cityName);

    const dataLayer = new google.maps.Data({ map });

    dataLayer.setStyle({
      fillColor: "#10b981",
      fillOpacity: 0.08,
      strokeColor: "#10b981",
      strokeOpacity: 0.9,
      strokeWeight: 3,
    });

    const query = `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(
      cityName
    )}&state=Tennessee&country=USA&format=geojson&polygon_geojson=1&limit=1`;

    fetch(query)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch city boundary");
        return response.json();
      })
      .then((data) => {
        console.log("City boundary data:", data);
        if (data.features && data.features.length > 0) {
          dataLayer.addGeoJson(data);
          setCityDataLayer(dataLayer);
        } else {
          console.warn("No city boundary found");
          setGeocodingError(`City boundary for ${cityName} not available`);
        }
      })
      .catch((error) => {
        console.error("Error loading city bounds:", error);
        setGeocodingError("Failed to load city boundary");
      });
  }, [map, showCityBounds, cityName]);

  useEffect(() => {
    if (!map) return;

    if (countyDataLayer) {
      countyDataLayer.setMap(null);
      setCountyDataLayer(null);
    }
    if (countyPolygon) {
      countyPolygon.setMap(null);
      setCountyPolygon(null);
    }

    if (!showCountyBounds) return;

    console.log("Loading county bounds for:", countyName);

    const dataLayer = new google.maps.Data({ map });

    dataLayer.setStyle({
      fillColor: "#f59e0b",
      fillOpacity: 0.08,
      strokeColor: "#f59e0b",
      strokeOpacity: 0.9,
      strokeWeight: 3,
    });

    const query = `https://nominatim.openstreetmap.org/search?county=${encodeURIComponent(
      countyName
    )}&state=Tennessee&country=USA&format=geojson&polygon_geojson=1&limit=1`;

    fetch(query)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch county boundary");
        return response.json();
      })
      .then((data) => {
        console.log("County boundary data:", data);
        if (data.features && data.features.length > 0) {
          dataLayer.addGeoJson(data);
          setCountyDataLayer(dataLayer);
        } else {
          console.warn("No county boundary found");
          setGeocodingError(`County boundary for ${countyName} not available`);
        }
      })
      .catch((error) => {
        console.error("Error loading county bounds:", error);
        setGeocodingError("Failed to load county boundary");
      });
  }, [map, showCountyBounds, countyName]);

  if (error) {
    return (
      <div className="h-[500px] bg-muted rounded-lg border flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">
            Please check your Google Maps API configuration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 bg-muted rounded-lg border flex items-center justify-center z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {geocodingError && (
        <div className="absolute top-4 left-4 z-10 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 max-w-md shadow-lg">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Geocoding API Not Enabled
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Enable the Geocoding API in Google Cloud Console to use boundary
            overlays.
          </p>
          <button
            onClick={() => setGeocodingError(null)}
            className="text-xs text-yellow-600 dark:text-yellow-400 underline mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" className="shadow-lg">
              <Map className="h-4 w-4 mr-2" />
              Map Layers
              {(showZipCodes || showCityBounds || showCountyBounds) && (
                <span className="ml-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Boundary Overlays</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showZipCodes}
              onCheckedChange={(checked) => {
                console.log("Toggle ZIP codes:", checked);
                setShowZipCodes(checked);
              }}
            >
              <Hash className="h-4 w-4 mr-2 text-blue-500" />
              <span>ZIP Code Zones</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showCityBounds}
              onCheckedChange={(checked) => {
                console.log("Toggle city bounds:", checked);
                setShowCityBounds(checked);
              }}
            >
              <div className="h-4 w-4 mr-2 rounded border-2 border-green-500" />
              <span>City Boundary</span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showCountyBounds}
              onCheckedChange={(checked) => {
                console.log("Toggle county bounds:", checked);
                setShowCountyBounds(checked);
              }}
            >
              <div className="h-4 w-4 mr-2 rounded border-2 border-orange-500" />
              <span>County Boundary</span>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={mapRef}
        className="h-[500px] rounded-lg border"
        style={{ width: "100%" }}
      />
    </div>
  );
}
