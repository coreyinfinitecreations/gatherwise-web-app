import { useEffect, useRef, useState } from "react";

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export function useGooglePlaces(
  inputRef: React.RefObject<HTMLInputElement>,
  onAddressSelect: (components: AddressComponents) => void,
  isActive: boolean = true
) {
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (typeof window !== "undefined" && !window.google) {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          console.error("Google Maps API key is not configured");
          return;
        }

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsLoaded(true);
        document.head.appendChild(script);
      } else if (window.google) {
        setIsLoaded(true);
      }
    };

    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (!isActive || !isLoaded || !inputRef.current) {
      console.log("Google Places not ready:", {
        isActive,
        isLoaded,
        hasInput: !!inputRef.current,
      });
      return;
    }

    const initAutocomplete = async () => {
      const input = inputRef.current;
      if (!input) return;

      console.log("Initializing Google Places Autocomplete");

      try {
        autocompleteRef.current = new google.maps.places.Autocomplete(input, {
          types: ["address"],
          componentRestrictions: { country: "us" },
          fields: ["address_components", "formatted_address"],
        });

        console.log("Autocomplete initialized successfully");

        const listener = autocompleteRef.current.addListener(
          "place_changed",
          () => {
            const place = autocompleteRef.current?.getPlace();
            console.log("Place selected:", place);

            if (!place || !place.address_components) return;

            const components = place.address_components;
            let street = "";
            let city = "";
            let state = "";
            let zipCode = "";

            const streetNumber =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("street_number")
              )?.long_name || "";

            const route =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("route")
              )?.long_name || "";

            street = `${streetNumber} ${route}`.trim();

            city =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("locality")
              )?.long_name || "";

            state =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("administrative_area_level_1")
              )?.short_name || "";

            zipCode =
              components.find((c: google.maps.GeocoderAddressComponent) =>
                c.types.includes("postal_code")
              )?.long_name || "";

            onAddressSelect({
              street,
              city,
              state,
              zipCode,
              fullAddress: place.formatted_address || "",
            });
          }
        );

        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
        };
      } catch (error) {
        console.error("Error initializing Google Places:", error);
      }
    };

    const timeoutId = setTimeout(initAutocomplete, 100);

    return () => {
      clearTimeout(timeoutId);
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isActive, isLoaded, inputRef, onAddressSelect]);

  return { isLoaded };
}
